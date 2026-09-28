const assert = require('node:assert/strict');
const { test } = require('node:test');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Execute production modules with synthetic service boundaries; never call providers.
function load(file, dependencies = {}, extra = {}) {
  const output = ts.transpileModule(readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  const resolve = id => {
    if (Object.hasOwn(dependencies, id)) return dependencies[id];
    throw new Error(`Unexpected dependency: ${id}`);
  };
  new Function('require', 'module', 'exports', 'console', ...Object.keys(extra), output)(
    resolve, module, module.exports, { warn() {}, error() {} }, ...Object.values(extra),
  );
  return module.exports;
}
const clientModule = () => load('app/api/gpt/utils/openai-client.ts', { openai: require('openai') }, {
  process: { env: { OPENAI_API_KEY: 'synthetic-test-key' } },
});

function limiter({ data, readError = false, writeError = false } = {}) {
  const db = { collection: () => ({ doc: () => ({
    async get() {
      if (readError) throw new Error('database unavailable');
      return { exists: data !== undefined, data: () => data };
    },
    async set() { if (writeError) throw new Error('write unavailable'); },
  }) }) };
  return load('app/api/gpt/utils/rate-limiter.ts', {
    '@/lib/firebaseAdmin': { firebaseAdmin: { firestore: () => db } },
    './openai-client': clientModule(),
  });
}

test('limiter denies read, initialization, expired reset and corrupt-counter failures', async () => {
  for (const options of [
    { readError: true },
    { writeError: true },
    { data: { requests: 0, tokens: 0, windowStart: new Date(0) }, writeError: true },
    { data: { requests: NaN, tokens: 0, windowStart: new Date() } },
    { data: { requests: 0, windowStart: new Date() } },
  ]) {
    const result = await limiter(options).checkRateLimit('user-a');
    assert.equal(result.allowed, false);
    assert.equal(result.unavailable, true);
  }
});

test('normal first request and existing quota denials retain their behavior', async () => {
  assert.equal((await limiter().checkRateLimit('user-a')).allowed, true);
  for (const counts of [{ requests: 60, tokens: 0 }, { requests: 0, tokens: 90000 }]) {
    const result = await limiter({ data: { ...counts, windowStart: new Date() } }).checkRateLimit('user-a');
    assert.equal(result.allowed, false);
    assert.equal(result.unavailable, undefined);
  }
  const result = await limiter({ data: { requests: 1000, tokens: 0, windowStart: new Date(Date.now() - 120000) } }).checkRateLimit('user-a');
  assert.equal(result.allowed, false);
});

test('OpenAI transient errors make one upstream attempt and the configured timeout is applied', async () => {
  const { getOpenAI, OPENAI_CONFIG } = clientModule();
  const client = getOpenAI();
  assert.equal(client.timeout, OPENAI_CONFIG.TIMEOUT_MS);
  assert.equal(client.timeout, 30000);
  assert.equal(client.maxRetries, 0);
  for (const status of [429, 500]) {
    let calls = 0;
    const offline = client.withOptions({ fetch: async () => {
      calls++;
      return new Response(JSON.stringify({ error: { message: 'transient test failure' } }), {
        status, headers: { 'Content-Type': 'application/json' },
      });
    } });
    await assert.rejects(offline.chat.completions.create({ model: 'gpt-4o-mini', messages: [] }));
    assert.equal(calls, 1);
  }
});

function compass({ authenticated = true, rate = { allowed: true }, record = async () => {}, saveFails = false } = {}) {
  const events = [];
  class ConversationError extends Error {}
  const route = load('app/api/ai/route.ts', {
    'next/server': { NextResponse: Response },
    '@/lib/ai/prompts/ipurposeMentorPrompts': { getSystemPrompt: () => 'system', inferLensFromMessage: () => 'soul' },
    '@/lib/apiEntitlementHelper': { requireAuthenticated: async () => authenticated
      ? { uid: 'user-a' } : { error: Response.json({ error: 'Unauthorized' }, { status: 401 }) } },
    '@/app/api/gpt/utils/openai-client': { getOpenAI: () => ({ chat: { completions: { create: async () => {
      events.push('generate');
      return { choices: [{ message: { content: 'personalized response' } }], usage: { total_tokens: 123 }, model: 'gpt-4o-mini' };
    } } } }) },
    '@/app/api/gpt/utils/rate-limiter': {
      checkRateLimit: async () => rate,
      recordRequest: async (uid, tokens) => { assert.equal(uid, 'user-a'); assert.equal(tokens, 123); events.push('record'); await record(); events.push('recorded'); },
    },
    '@/lib/ai/companionConversations': {
      CompanionConversationError: ConversationError,
      getCompanionHistory: async () => [],
      saveCompanionTurn: async () => { events.push('save'); if (saveFails) throw new Error('save failed'); return 'conversation-a'; },
    },
    '@/lib/ai/companionContext': { getCompanionContext: async () => ({}) },
    '@/lib/ai/companionContextFormatter': { formatCompanionContext: () => 'private context' },
    '@/lib/ai/companionModelConfig': { getCompanionModelConfig: () => ({ maxInputCharacters: 4000, maxOutputTokens: 1024 }), resolveCompanionModel: () => 'gpt-4o-mini' },
  });
  return { events, request: () => route.POST(new Request('https://example.test/api/ai', {
    method: 'POST', body: JSON.stringify({ message: 'Hello' }),
  })) };
}

test('unauthorized and unavailable/quota-denied Compass requests do not generate or persist', async () => {
  for (const [options, status] of [
    [{ authenticated: false }, 401],
    [{ rate: { allowed: false, unavailable: true } }, 503],
    [{ rate: { allowed: false } }, 429],
  ]) {
    const h = compass(options);
    assert.equal((await h.request()).status, status);
    assert.deepEqual(h.events, []);
  }
});

test('Compass awaits accounting before saving or returning and counts a failed conversation save', async () => {
  let release;
  const pending = new Promise(resolve => { release = resolve; });
  const h = compass({ record: () => pending });
  const response = h.request();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(h.events, ['generate', 'record']);
  release();
  assert.equal((await response).status, 200);
  assert.deepEqual(h.events, ['generate', 'record', 'recorded', 'save']);
  const failed = compass({ saveFails: true });
  assert.equal((await failed.request()).status, 500);
  assert.deepEqual(failed.events, ['generate', 'record', 'recorded', 'save']);
});

test('legacy raw stream forwards a finite abort deadline to its single provider call', async () => {
  let calls = 0;
  let signal;
  const route = load('app/api/ai/stream/route.ts', {
    '@/lib/apiEntitlementHelper': { requireBasicPaid: async () => ({ uid: 'paid-user' }) },
    '@/app/api/gpt/utils/openai-client': { OPENAI_CONFIG: { TIMEOUT_MS: 10 } },
    '@/lib/ai/companionModelConfig': { getCompanionModelConfig: () => ({ maxInputCharacters: 4000, maxOutputTokens: 1024 }), resolveCompanionModel: () => 'gpt-4o-mini' },
  }, {
    process: { env: { OPENAI_API_KEY: 'synthetic-test-key' } },
    fetch: async (_url, init) => { calls++; signal = init.signal; return new Response('stream'); },
  });
  const response = await route.POST(new Request('https://example.test/api/ai/stream', {
    method: 'POST', body: JSON.stringify({ prompt: 'Hello' }),
  }));
  assert.equal(await response.text(), 'stream');
  assert.equal(calls, 1);
  await new Promise(resolve => setTimeout(resolve, 25));
  assert.equal(signal.aborted, true);
});

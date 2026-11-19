const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function fixture() {
  const mocks = {}, cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file).exports;
  // eslint-disable-next-line @next/next/no-assign-module-variable -- Test-only CommonJS export object for isolated transpilation.
    const module = { exports: {} }; cache.set(file, module);
    const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
    new Function('require', 'module', 'exports', code)(id => {
      if (id in mocks) return mocks[id];
      if (id.startsWith('@/')) return load(id.slice(2) + '.ts');
      if (id.startsWith('.')) return load(path.normalize(path.join(path.dirname(file), id)) + '.ts');
      return require(id);
    }, module, module.exports);
    return module.exports;
  }
  const db = new (load('tests/fakes/firestore.ts').FakeFirestore)();
  db.documents.set('users/a', {}); db.documents.set('users/b', {});
  const state = { uid: 'a', calls: [], rate: true, failModeration: false, hold: null };
  const firestore = () => db;
  class Timestamp extends Date { toMillis() { return this.getTime(); } }
  firestore.Timestamp = { now: () => new Timestamp(), fromMillis: value => new Timestamp(value) };
  mocks['@/lib/firebaseAdmin'] = { firebaseAdmin: { firestore } };
  mocks['next/server'] = { NextResponse: Response };
  mocks['@/lib/apiEntitlementHelper'] = { requireAuthenticated: async () => state.uid ? { uid: state.uid } : { error: Response.json({}, { status: 401 }) } };
  mocks['@/app/api/gpt/utils/rate-limiter'] = { checkRateLimit: async () => ({ allowed: state.rate, unavailable: !state.rate }), recordRequest: async () => {} };
  mocks['@/lib/ai/companionContext'] = { getCompanionContext: async () => ({ profile: { displayName: 'Synthetic Name', focusAreas: [] }, recentCheckIns: [], recentDailySessions: [], recentLabs: [], recentReflections: [] }) };
  // History belongs to the verified UID; persistence is the actual production implementation.
  mocks['@/lib/ai/companionConversations'] = { ...load('lib/ai/companionConversations.ts'), getCompanionHistory: async () => [] };
  mocks['@/app/api/gpt/utils/openai-client'] = { getOpenAI: () => ({
    moderations: { create: async options => { state.calls.push(['moderation', options]); if (state.failModeration) throw Error('synthetic outage'); return { results: Array.from({ length: Array.isArray(options.input) ? options.input.length : 1 }, () => ({ flagged: false })) }; } },
    chat: { completions: { create: async options => { state.calls.push(['generation', options]); if (state.hold) await state.hold; return { choices: [{ message: { content: 'Synthetic safe reply' } }], model: 'test-model', usage: { total_tokens: 8 } }; } } },
  }) };
  const safety = load('lib/ai/companionSafety.ts');
  return { db, state, safety, route: load('app/api/ai/route.ts'), reports: load('app/api/ai/reports/route.ts'),
    grant: uid => safety.writeAiConsent(db, uid || state.uid, { granted: true, version: safety.AI_CONSENT_VERSION }) };
}
const request = (id = 'one', url = '/api/ai/v2') => new Request('https://synthetic.test' + url, { method: 'POST', body: JSON.stringify({ message: 'A synthetic question', ...(id ? { requestId: id } : {}) }) });
test('both protocols deny missing consent before all provider calls; v2 rejects missing IDs', async () => {
  const h = fixture();
  for (const url of ['/api/ai/v2', '/api/ai']) assert.equal((await h.route.POST(request('one', url))).status, 403);
  assert.equal(h.state.calls.length, 0);
  await h.grant(); assert.equal((await h.route.POST(request(null))).status, 400); assert.equal(h.state.calls.length, 0);
});
test('concurrent v2 requests admit one generation and completed retry returns the exact saved response', async () => {
  const h = fixture(); await h.grant(); let release; h.state.hold = new Promise(resolve => { release = resolve; });
  const first = h.route.POST(request());
  while (!h.state.calls.some(c => c[0] === 'generation')) await new Promise(resolve => setImmediate(resolve));
  const repeats = await Promise.all(Array.from({ length: 8 }, () => h.route.POST(request())));
  assert.ok(repeats.every(r => r.status === 409)); release(); const response = await first;
  assert.equal(response.status, 200); const reply = await response.json();
  const retried = await h.route.POST(request()); assert.equal(retried.status, 200); assert.deepEqual(await retried.json(), reply);
  assert.equal(h.state.calls.filter(c => c[0] === 'generation').length, 1);
  assert.equal(h.state.calls.filter(c => c[0] === 'moderation').length, 2);
  assert.equal(h.db.documents.get(`users/a/companionConversations/${reply.conversationId}/messages/${reply.assistantMessageId}`).content, reply.response);
  assert.equal(h.db.documents.get('users/a/compassRequests/one').status, 'completed');
  const body = { conversationId: reply.conversationId, messageId: reply.assistantMessageId, reason: 'inaccurate', details: 'Synthetic report', response: 'forged', uid: 'b' };
  const reportReq = () => new Request('https://synthetic.test/api/ai/reports', { method: 'POST', body: JSON.stringify(body) });
  assert.equal((await h.reports.POST(reportReq())).status, 200); assert.equal((await h.reports.POST(reportReq())).status, 200);
  const reports = [...h.db.documents].filter(([key]) => key.includes('/companionReports/'));
  assert.equal(reports.length, 1); assert.equal(reports[0][1].response, reply.response);
  h.state.uid = 'b'; assert.equal((await h.reports.POST(reportReq())).status, 404);
  await h.db.recursiveDelete(h.db.collection('users').doc('a')); assert.equal([...h.db.documents].some(([key]) => key.startsWith('users/a/')), false);
});
test('withdrawal during generation blocks output moderation/persistence and cannot replay uncertain work', async () => {
  const h = fixture(); await h.grant(); let release; h.state.hold = new Promise(resolve => { release = resolve; });
  const pending = h.route.POST(request()); while (!h.state.calls.some(c => c[0] === 'generation')) await new Promise(resolve => setImmediate(resolve));
  await h.safety.writeAiConsent(h.db, 'a', { granted: false, version: h.safety.AI_CONSENT_VERSION }); release();
  assert.equal((await pending).status, 403); assert.equal(h.state.calls.filter(c => c[0] === 'moderation').length, 1);
  assert.equal([...h.db.documents].some(([key]) => key.includes('/companionConversations/')), false);
  await h.grant(); assert.equal((await h.route.POST(request())).status, 403); assert.equal(h.state.calls.filter(c => c[0] === 'generation').length, 1);
});
test('moderation outage is closed to repeat provider calls; pre-provider outage can retry without duplicates', async () => {
  const h = fixture(); await h.grant(); h.state.failModeration = true;
  assert.equal((await h.route.POST(request())).status, 503); assert.equal((await h.route.POST(request())).status, 503); assert.equal(h.state.calls.length, 1);
  const retry = fixture(); await retry.grant(); retry.state.rate = false;
  assert.equal((await retry.route.POST(request())).status, 503); assert.equal(retry.state.calls.length, 0);
  retry.state.rate = true; assert.equal((await retry.route.POST(request())).status, 200); assert.equal(retry.state.calls.filter(c => c[0] === 'generation').length, 1);
});
test('both Compass protocols reject unsupported models before provider calls or any request/conversation writes',async()=>{
 const h=fixture();await h.grant();const before=JSON.stringify([...h.db.documents]);
 for(const url of ['/api/ai','/api/ai/v2'])for(const model of ['gpt-4','gpt-4-turbo-preview','gpt-3.5-turbo','unapproved',null,3]){
  const response=await h.route.POST(new Request('https://synthetic.test'+url,{method:'POST',body:JSON.stringify({message:'Synthetic question',model,requestId:'rejected'})}));assert.equal(response.status,400);assert.match((await response.json()).error,/Unsupported generation model/);
 }
 assert.deepEqual(h.state.calls,[]);assert.equal(JSON.stringify([...h.db.documents]),before);
});
test('approved Compass generation uses only current generation/moderation models and keeps a durable receipt',async()=>{
 const h=fixture();await h.grant();const response=await h.route.POST(new Request('https://synthetic.test/api/ai/v2',{method:'POST',body:JSON.stringify({message:'Synthetic question',model:'gpt-4o-mini',requestId:'approved-model'})}));assert.equal(response.status,200);assert.equal(h.state.calls.find(x=>x[0]==='generation')[1].model,'gpt-4o-mini');assert(h.state.calls.filter(x=>x[0]==='moderation').every(x=>x[1].model==='omni-moderation-latest'));assert.equal(h.db.documents.get('users/a/compassRequests/approved-model').status,'completed');
});

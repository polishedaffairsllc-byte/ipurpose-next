const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function load(file, dependencies = {}) {
  const output = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  // eslint-disable-next-line @next/next/no-assign-module-variable -- Test-only CommonJS export object for isolated transpilation.
  const module = { exports: {} };
  new Function('require', 'module', 'exports', output)(id => dependencies[id] || (id.startsWith('.') ? load(path.relative(path.join(__dirname, '..'), path.resolve(path.dirname(path.join(__dirname, '..', file)), id + '.ts'))) : require(id)), module, module.exports);
  return module.exports;
}
function fixture() {
  const db = new (load('tests/fakes/firestore.ts').FakeFirestore)();
  db.documents.set('users/a', {});
  let authenticated = true;
  const safety = load('lib/ai/companionSafety.ts');
  const dependencies = { 'next/server': { NextResponse: Response },
    '@/lib/apiEntitlementHelper': { requireAuthenticated: async () => authenticated ? { uid: 'a' } : { error: Response.json({ error: 'Unauthorized' }, { status: 401 }) } },
    '@/lib/firebaseAdmin': { firebaseAdmin: { firestore: () => db } },
    '@/lib/ai/companionSafety': safety };
  return { db, safety, consent: load('app/api/ai/consent/route.ts', dependencies), reports: load('app/api/ai/reports/route.ts', dependencies), deny: () => { authenticated = false; } };
}
const request = (body, origin) => new Request('https://example.test/api/ai/consent', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(origin ? { Origin: origin } : {}) }, body: JSON.stringify(body) });
test('consent routes authenticate, reject malformed and cross-origin choices, and ignore forged identity', async () => {
  const h = fixture();
  assert.equal((await h.consent.GET()).status, 200);
  assert.equal((await h.consent.POST(request({}, 'https://attacker.test'))).status, 403);
  assert.equal((await h.consent.POST(request({}))).status, 400);
  const response = await h.consent.POST(request({ granted: true, version: h.safety.AI_CONSENT_VERSION, uid: 'b' }));
  assert.equal(response.status, 200); assert.equal((await response.json()).granted, true);
  assert.ok(h.db.documents.has('users/a/consents/compassAi')); assert.equal(h.db.documents.has('users/b/consents/compassAi'), false);
  h.deny(); assert.equal((await h.consent.GET()).status, 401); assert.equal((await h.consent.POST(request({}))).status, 401);
});
test('reports route confirms storage, rejects user messages and fails honestly during outages', async () => {
  const h = fixture(); const body = { conversationId: 'chat', messageId: 'assistant', reason: 'offensive' };
  h.db.documents.set('users/a/companionConversations/chat', {});
  h.db.documents.set('users/a/companionConversations/chat/messages/assistant', { role: 'assistant', content: 'Actual response' });
  assert.equal((await h.reports.POST(request({ ...body, messageId: 'missing' }))).status, 404);
  const saved = await h.reports.POST(request(body)); assert.equal(saved.status, 200); assert.equal((await saved.json()).reported, true);
  h.db.failReads = true; const failed = await h.reports.POST(request(body)); assert.equal(failed.status, 503); assert.equal((await failed.json()).reported, undefined);
  h.deny(); assert.equal((await h.reports.POST(request(body))).status, 401);
});

const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function load(file, mocks = {}) {
  // eslint-disable-next-line @next/next/no-assign-module-variable -- Test-only CommonJS export object for isolated transpilation.
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function('require', 'module', 'exports', code)(id => mocks[id] || (id.startsWith('.') ? load(path.normalize(path.join(path.dirname(file), id)) + '.ts') : require(id)), module, module.exports);
  return module.exports;
}
const safety = load('lib/ai/companionSafety.ts');
const ledger = load('lib/ai/compassRequests.ts', { './companionSafety': safety });
const { FakeFirestore } = load('tests/fakes/firestore.ts');
test('concurrent identical requests have one winner; replay returns saved result without provider work', async () => {
  const db = new FakeFirestore(); db.documents.set('users/a', {}); const fingerprint = ledger.requestFingerprint({ message: 'private' });
  const outcomes = await Promise.allSettled(Array.from({ length: 12 }, () => ledger.reserveCompassRequest(db, 'a', 'stable', fingerprint)));
  assert.equal(outcomes.filter(x => x.status === 'fulfilled').length, 1);
  for (const x of outcomes.filter(x => x.status === 'rejected')) assert.equal(x.reason.status, 409);
  const ref = ledger.compassRequestRef(db, 'a', 'stable');
  await ref.set({ status: 'completed', reply: { response: 'safe', conversationId: 'chat', assistantMessageId: 'reply' } }, { merge: true });
  assert.equal((await ledger.reserveCompassRequest(db, 'a', 'stable', fingerprint)).response, 'safe');
  await assert.rejects(ledger.reserveCompassRequest(db, 'a', 'stable', 'changed'), { status: 409 });
  db.documents.set('users/b', {});
  assert.equal(await ledger.reserveCompassRequest(db, 'b', 'stable', fingerprint), null);
});
test('unknown provider outcome never replays; failures before provider access can safely retry', async () => {
  const db = new FakeFirestore(); db.documents.set('users/a', {}); await ledger.reserveCompassRequest(db, 'a', 'unknown', 'hash');
  await ledger.failCompassRequest(db, 'a', 'unknown', false, 503);
  await assert.rejects(ledger.reserveCompassRequest(db, 'a', 'unknown', 'hash'), { status: 503 });
  await ledger.reserveCompassRequest(db, 'a', 'pre-provider', 'hash'); await ledger.failCompassRequest(db, 'a', 'pre-provider', true, 503);
  assert.equal(await ledger.reserveCompassRequest(db, 'a', 'pre-provider', 'hash'), null);
  await db.recursiveDelete(db.collection('users').doc('a')); assert.equal(db.documents.size, 0);
  await assert.rejects(ledger.reserveCompassRequest(db, 'a', 'late', 'hash'), { status: 403 });
  assert.equal(db.documents.size, 0, 'A completed deletion cannot acquire a new receipt even after its temporary guard is cleaned');
});

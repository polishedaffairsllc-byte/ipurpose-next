const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Real route/auth/profile/scoring modules, with only request stores and Firebase
// IO replaced. In particular, no entitlement or missing-profile shortcut mock.
function harness() {
 const cache = new Map(); const root = path.resolve(__dirname, '..');
 const state = { authorization: 'Bearer valid-token', indexMissing: true, authLookupFails: false, profileReadFails: false, userReads: 0, verifications: [], clarityQueries: [] };
 const mocks = { 'next/headers': { headers: async () => new Headers(state.authorization ? { Authorization: state.authorization } : {}), cookies: async () => ({ get: () => undefined }) } };
 function load(relative) {
  const filename = path.resolve(root, relative); if (cache.has(filename)) return cache.get(filename).exports;
  const testModule = { exports: {} }; cache.set(filename, testModule);
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { fileName: filename, compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022 } }).outputText;
  const localRequire = id => {
   if (Object.hasOwn(mocks, id)) return mocks[id];
   if (id.startsWith('.') || id.startsWith('@/')) {
    const base = id.startsWith('@/') ? path.resolve(root, id.slice(2)) : path.resolve(path.dirname(filename), id);
    const file = ['.ts', '.tsx'].map(ext => base + ext).find(fs.existsSync);
    if (file) return load(path.relative(root, file));
   }
   return require(id);
  };
  new Function('require', 'module', 'exports', output)(localRequire, testModule, testModule.exports); return testModule.exports;
 }
 const db = new (load('tests/fakes/firestore.ts').FakeFirestore)();
 const originalCollection = db.collection.bind(db);
 db.collection = name => {
  if (name !== 'clarityCheckSubmissions') {
   const collection = originalCollection(name); const doc = collection.doc.bind(collection);
   collection.doc = uid => {
    const ref = doc(uid); const get = ref.get.bind(ref);
    ref.get = async () => {
     // Auth reads the user first; only the actual Purpose read is unavailable.
     state.userReads++;
     if (state.profileReadFails && state.userReads > 1) throw new Error('Purpose database unavailable');
     return get();
    }; return ref;
   }; return collection;
  }
  const query = { where(field, operator, value) { state.clarityQueries.push([field, operator, value]); return query; }, select() { return query; }, orderBy(field, direction) { state.clarityQueries.push([field, direction]); return query; }, limit() { return query; }, async get() {
   if (state.indexMissing) { const error = new Error('The query requires an index'); error.code = 9; throw error; }
   return { size: 1, docs: [{ data: () => ({ uid: 'person', type: 'questionnaire', scores: { totalScore: 7 }, resultSummary: 'Existing approved result', identityType: 'Builder' }) }] };
  } }; return query;
 };
 const firestore = () => db; firestore.FieldValue = { delete: () => ({ fakeDelete: true }) };
 const auth = { async verifyIdToken(token, revoked) { state.verifications.push([token, revoked]); if (token !== 'valid-token') throw new Error('Invalid token'); return { uid: 'person' }; }, async getUser() { if (state.authLookupFails) throw new Error('Auth lookup unavailable'); return { emailVerified: false }; } };
 mocks['@/lib/firebaseAdmin'] = mocks['./firebaseAdmin'] = { firebaseAdmin: { firestore, auth: () => auth } };
 return { state, db, route: load('app/api/ai/purpose/route.ts'), math: load('mobile/src/lib/purposeCheck.ts') };
}
const originalEnvironment = process.env.NODE_ENV;
test.before(() => { process.env.NODE_ENV = 'production'; });
test.after(() => { if (originalEnvironment === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = originalEnvironment; });
const answers = { q1: ['explain'], q2: ['learn'], q3: ['learn'], q4: ['community'], q5: ['learn'], q6: ['understand'] };
const request = body => new Request('https://ipurposesoul.com/api/ai/purpose', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

for (const existing of [false, true]) test(`verified native ${existing ? 'existing' : 'new'} account loads Purpose despite missing optional Clarity index`, async () => {
 const { state, db, route, math } = harness();
 const profile = existing ? math.generatePurposeProfile(math.buildPurposePayload(answers, '', false)) : null;
 if (profile) db.documents.set('users/person', { purposeProfile: profile });
 const response = await route.GET(); assert.equal(response.status, 200); assert.deepEqual(await response.json(), { purposeProfile: profile, identityType: null });
 assert.deepEqual(state.verifications, [['valid-token', true]]); assert.deepEqual(state.clarityQueries, [['uid', '==', 'person'], ['createdAt', 'desc']]);
 assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
});
test('optional Auth lookup failure cannot block first-time Purpose, while available Clarity identity still pairs', async () => {
 const { state, route } = harness(); state.authLookupFails = true;
 assert.deepEqual(await (await route.GET()).json(), { purposeProfile: null, identityType: null });
 state.authLookupFails = false; state.indexMissing = false;
 assert.equal((await (await route.GET()).json()).identityType, 'Builder');
});
test('missing, malformed and rejected native tokens return structured 401 without profile access', async () => {
 const { state, route } = harness();
 for (const authorization of [null, 'Bearer rejected-token', 'Basic invalid', 'Bearer']) {
  state.authorization = authorization; const response = await route.GET(); assert.equal(response.status, 401);
  const body = await response.json(); assert.equal(body.ok, false); assert.equal(body.error.code, 'Unauthorized'); assert.match(body.error.message, /session/);
 }
 assert.deepEqual(state.clarityQueries, []);
});
test('genuine Purpose database failure remains HTTP 500 rather than first-time start', async () => {
 const { state, route } = harness(); state.profileReadFails = true;
 const response = await route.GET(); assert.equal(response.status, 500); assert.match((await response.json()).error, /could not be loaded/);
});
test('first-time six-answer PUT creates profile, GET reads it, retake replaces reflection, DELETE preserves unrelated data', async () => {
 const { db, route, math } = harness();
 let response = await route.PUT(request(math.buildPurposePayload(answers, 'Explicitly saved reflection', true)));
 assert.equal(response.status, 200); assert.equal((await response.json()).purposeProfile.reflection, 'Explicitly saved reflection');
 assert.equal(db.documents.has('users/person'), true); assert.equal(db.documents.has('users/other'), false);
 assert.equal((await (await route.GET()).json()).purposeProfile.reflection, 'Explicitly saved reflection');
 db.documents.get('users/person').focusAreas = ['protected'];
 response = await route.PUT(request(math.buildPurposePayload(answers, 'Must not be sent', false))); assert.equal(response.status, 200);
 assert.equal((await response.json()).purposeProfile.reflection, undefined);
 response = await route.DELETE(); assert.equal(response.status, 200); assert.deepEqual(await response.json(), { success: true });
 assert.deepEqual(db.documents.get('users/person'), { focusAreas: ['protected'] });
 assert.deepEqual(await (await route.GET()).json(), { purposeProfile: null, identityType: null });
});
test('incomplete, wrong-version and client-owned UID payloads are rejected without saving', async () => {
 const { db, route, math } = harness(); const valid = math.buildPurposePayload(answers, '', false);
 for (const body of [{ ...valid, answers: { q1: ['explain'] } }, { ...valid, purposeCheckVersion: 999 }, { ...valid, uid: 'other' }]) {
  assert.equal((await route.PUT(request(body))).status, 400); assert.equal(db.documents.size, 0);
 }
 const malformed = new Request('https://ipurposesoul.com/api/ai/purpose', { method: 'PUT', body: '{' }); assert.equal((await route.PUT(malformed)).status, 400);
});

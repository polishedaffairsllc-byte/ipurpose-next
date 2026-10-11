const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function load(file, mocks) {
  const output = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const compiled = { exports: {} };
  new Function('require', 'module', 'exports', output)(name => { assert.ok(Object.hasOwn(mocks, name), name); return mocks[name]; }, compiled, compiled.exports);
  return compiled.exports;
}
const schema = load('mobile/src/lib/introVideos.ts', {});
function backend() {
  const profiles = new Map([['trusted-user', { emailConsent: true, purpose: { score: 93 }, introVideos: { hasCompletedWelcome: true } }]]), writes = [];
  const helper = load('lib/introVideos.ts', {
    '../mobile/src/lib/introVideos': schema,
    './firebaseAdmin': { firebaseAdmin: { firestore: () => ({ collection: collection => ({ doc: uid => ({
      get: async () => ({ data: () => profiles.get(uid) }),
      set: async (patch, options) => { writes.push({ collection, uid, patch, options }); profiles.set(uid, { ...profiles.get(uid), introVideos: { ...profiles.get(uid)?.introVideos, ...patch.introVideos } }); },
    }) }) }) } },
  });
  let authError = null;
  const route = load('app/api/ai/profile/route.ts', {
    'next/server': { NextResponse: { json: (body, init = {}) => ({ body, status: init.status || 200, headers: init.headers }) } },
    '@/lib/apiEntitlementHelper': { requireAuthenticated: async () => ({ uid: 'trusted-user', error: authError }) },
    '@/lib/ai/companionContext': { getCompanionProfile: async () => ({ focusAreas: ['Preserve me'], purposeStatement: 'Unchanged', visualEnvironmentPreference: { mode: 'manual', manualTheme: 'depth' } }) },
    '@/lib/ai/timezone': {}, '@/lib/ai/visualEnvironmentPreference': {},
    '@/lib/introVideos': helper, '@/mobile/src/lib/introVideos': schema,
  });
  return { helper, route, profiles, writes, deny: () => { authError = { status: 401 }; } };
}
const request = body => ({ json: async () => body });
test('profile intro updates are authenticated, allowlisted, monotonic, and preserve unrelated saved data', async () => {
  const h = backend();
  for (const kind of ['clarity', 'purpose', 'compass', 'clarity']) {
    const response = await h.route.PATCH(request({ completedIntro: kind }));
    assert.equal(response.status, 200);
    assert.equal(response.body.profile.introVideos[schema.INTRO_FLAGS[kind]], true);
    assert.equal(response.body.profile.purposeStatement, 'Unchanged');
    assert.equal(response.headers['Cache-Control'], 'private, no-store');
  }
  const profile = h.profiles.get('trusted-user');
  assert.deepEqual(profile.introVideos, { hasCompletedWelcome: true, hasSeenClarityIntro: true, hasSeenPurposeIntro: true, hasSeenCompassIntro: true });
  assert.equal(profile.emailConsent, true); assert.deepEqual(profile.purpose, { score: 93 });
  for (const write of h.writes) { assert.equal(write.uid, 'trusted-user'); assert.equal(write.collection, 'users'); assert.deepEqual(write.options, { merge: true }); assert.deepEqual(Object.keys(write.patch), ['introVideos']); }
  const get = await h.route.GET(); assert.deepEqual(get.body.profile.introVideos, profile.introVideos);
  h.deny(); assert.equal((await h.route.GET()).status, 401); assert.equal((await h.route.PATCH(request({ completedIntro: 'welcome' }))).status, 401); assert.equal(h.writes.length, 4);
});
test('unsupported flags, reset attempts, spoofed account IDs and multi-field changes never write', async () => {
  const h = backend();
  for (const body of [{ completedIntro: false }, { completedIntro: 'hasSeenCompassIntro' }, { completedIntro: 'constructor' }, { completedIntro: 'compass', uid: 'other-user' }, { introVideos: { hasSeenCompassIntro: false } }, { completedIntro: 'purpose', focusAreas: [] }, null]) {
    assert.equal((await h.route.PATCH(request(body))).status, 400);
  }
  assert.equal(h.writes.length, 0);
  assert.deepEqual(schema.readIntroCompletions({ hasCompletedWelcome: 'true', hasSeenClarityIntro: true, unrelated: true }), { hasSeenClarityIntro: true });
});

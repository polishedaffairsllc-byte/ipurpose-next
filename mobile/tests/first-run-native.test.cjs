const assert = require('node:assert/strict');
const { test } = require('node:test');
const { harness } = require('./helpers/native-harness.cjs');

function apiHarness() {
  const h = harness();
  let activeUser = { uid: 'new-user', getIdToken: async () => 'mock-id-token' };
  const auth = { get currentUser() { return activeUser; }, set currentUser(next) { activeUser = next; } };
  h.mocks['./analyticsEvents'] = { logLaunchEvent: () => {} };
  h.mocks['./firebase'] = { auth };
  return { h, auth, api: h.load('lib/api.ts') };
}

test('first-run contract preserves founder-approved chooser labels, not the six-question Purpose Check', () => {
  const { h } = apiHarness();
  const flow = h.load('lib/firstRun.ts');
  assert.deepEqual(flow.FIRST_RUN_CHOICES.map(entry => entry.value), ['clarity', 'purpose']);
  assert.equal(flow.FIRST_RUN_CHOICES[0].description, 'Understand what feels off, unclear, or out of alignment.');
  assert.equal(flow.FIRST_RUN_CHOICES[1].description, 'Explore your direction, strengths, audience, and impact.');
  assert.equal(flow.FIRST_RUN_CHOICE_NOTE, 'Both remain available later from Home.');
  assert.deepEqual(flow.parseFirstRunState({ stage: 'welcome' }), { stage: 'welcome' });
  assert.deepEqual(flow.parseFirstRunState({ stage: 'intro', choice: 'purpose' }), { stage: 'intro', choice: 'purpose' });
  assert.deepEqual(flow.parseFirstRunState({ stage: 'complete', choice: 'clarity' }), { stage: 'complete', choice: 'clarity' });
});

test('first-run state rejects malformed stage/choice, extra fields and incomplete experience', () => {
  const { h } = apiHarness();
  const parse = h.load('lib/firstRun.ts').parseFirstRunState;
  for (const value of [null, [], {}, { stage: 'invalid' }, { stage: 'intro' }, { stage: 'experience' },
    { stage: 'intro', choice: 'unknown' }, { stage: 'choice', choice: 'purpose' },
    { stage: 'welcome', granted: true }, { stage: 'welcome', uid: 'other-user' }]) {
    assert.throws(() => parse(value), /Invalid first-run state/);
  }
});

test('authenticated first-run GET and POST use only the first-run route and never imply OpenAI permission', async () => {
  const { h, api } = apiHarness();
  const requests = [];
  h.mocks.fetch = async (url, init) => {
    requests.push({ url, init });
    return Response.json({ uid: 'new-user', state: requests.length === 1
      ? { stage: 'choice' } : { stage: 'intro', choice: 'purpose' } });
  };
  assert.deepEqual(await api.getNativeFirstRun(), { stage: 'choice' });
  assert.deepEqual(await api.advanceNativeFirstRun({ stage: 'intro', choice: 'purpose' }),
    { stage: 'intro', choice: 'purpose' });
  assert.deepEqual(requests.map(item => item.url), [
    'https://ipurposesoul.com/api/auth/first-run',
    'https://ipurposesoul.com/api/auth/first-run',
  ]);
  assert.equal(requests[0].init.headers.get('Authorization'), 'Bearer mock-id-token');
  assert.equal(requests[1].init.method, 'POST');
  assert.deepEqual(JSON.parse(requests[1].init.body), { stage: 'intro', choice: 'purpose' });
  assert.doesNotMatch(requests[1].init.body, /granted|OpenAI|consent/i);
});

test('first-run client rejects a different server UID and account switches during reads', async () => {
  const { h, api, auth } = apiHarness();
  h.mocks.fetch = async () => Response.json({ uid: 'other-user', state: { stage: 'complete' } });
  await assert.rejects(api.getNativeFirstRun(), /signed-in account changed/);
  h.mocks.fetch = async () => {
    auth.currentUser = { uid: 'other-user', getIdToken: async () => 'other-token' };
    return Response.json({ uid: 'new-user', state: { stage: 'complete' } });
  };
  await assert.rejects(api.getNativeFirstRun(), /signed-in account changed/);
});

test('first-run validation prevents malformed writes even when a user is signed in', async () => {
  const { h, api } = apiHarness();
  const calls = [];
  h.mocks.fetch = async url => { calls.push(url); return Response.json({ uid: 'new-user', state: { stage: 'complete' } }); };
  await assert.rejects(api.advanceNativeFirstRun({ stage: 'intro' }), /Invalid first-run state/);
  assert.deepEqual(calls, []);
});

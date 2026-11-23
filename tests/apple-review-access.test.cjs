const { test } = require('node:test');
const assert = require('node:assert/strict');
const { trustHarness } = require('./helpers/trust-harness.cjs');

function fixture() {
  const h = trustHarness();
  const user = { uid: 'review-user', email: 'review@example.test', metadata: { creationTime: '2026-11-17T12:00:00Z' } };
  const firestore = () => h.db.asFirestore();
  h.mocks['@/lib/firebaseAdmin'] = { firebaseAdmin: { firestore, auth: () => ({
    verifyIdToken: async token => {
      if (token !== 'test-token') throw new Error('Invalid token');
      return { uid: user.uid };
    },
    getUser: async () => user,
  }) } };
  h.mocks['next/server'] = { NextResponse: Response };
  h.mocks['@/lib/apiEntitlementHelper'] = { requireAuthenticated: async () => ({ uid: user.uid }) };
  const safety = h.load('lib/ai/companionSafety.ts');
  const signup = h.load('lib/signup/completion.ts');
  const disclosure = h.load('lib/signup/disclosure.ts');
  return { ...h, user, safety, signup, disclosure, input: { granted: true, version: disclosure.SIGNUP_AI_VERSION } };
}

test('installed binary can finish signup and recover admission without granting OpenAI permission', async () => {
  const h = fixture();
  await assert.rejects(h.signup.requireCompletedSignup(h.db, h.user), { status: 409 });
  const result = await h.signup.completeSignup(h.db, h.user, h.input, async () => h.user);
  assert.deepEqual(result, { completed: true, version: h.disclosure.SIGNUP_AI_VERSION });
  await h.signup.requireCompletedSignup(h.db, h.user);
  const consent = await h.safety.readAiConsent(h.db, h.user.uid);
  assert.equal(consent.granted, false);
  assert.equal(consent.provider, 'OpenAI');
  assert.notEqual(consent.version, h.disclosure.SIGNUP_AI_VERSION);
  assert.match(consent.notice, /messages.*conversation history.*name.*timezone/);
  await assert.rejects(h.safety.requireAiConsent(h.db, h.user.uid), { status: 403 });
});

test('signup retries preserve current consent, withdrawal, and saved profile', async () => {
  const h = fixture();
  await h.signup.completeSignup(h.db, h.user, h.input, async () => h.user);
  await h.db.collection('users').doc(h.user.uid).set({ displayName: 'Reviewer', entitlementTier: 'FREE' }, { merge: true });
  await h.safety.writeAiConsent(h.db, h.user.uid, { granted: true, version: h.safety.AI_CONSENT_VERSION });
  await h.signup.completeSignup(h.db, h.user, h.input, async () => h.user);
  assert.equal((await h.safety.readAiConsent(h.db, h.user.uid)).granted, true);
  await h.safety.writeAiConsent(h.db, h.user.uid, { granted: false, version: h.safety.AI_CONSENT_VERSION });
  await Promise.all(Array.from({ length: 5 }, () => h.signup.completeSignup(h.db, h.user, h.input, async () => h.user)));
  assert.equal((await h.safety.readAiConsent(h.db, h.user.uid)).granted, false);
  assert.equal(h.db.documents.get('users/review-user').displayName, 'Reviewer');
  await h.signup.requireCompletedSignup(h.db, h.user);
});

test('an account being deleted cannot be recreated by a concurrent signup retry', async () => {
  const h = fixture();
  await h.load('lib/accountDeletionLock.ts').accountDeletionLock(h.db, h.user.uid).set({ startedAt: new Date() });
  await assert.rejects(h.signup.completeSignup(h.db, h.user, h.input, async () => h.user), { status: 409 });
  assert.equal(h.db.documents.has('users/review-user'), false);
});

test('signup routes authenticate and return same-account admission with no partial writes on failure', async () => {
  const h = fixture();
  const route = h.load('app/api/auth/complete-signup/route.ts');
  const request = (method, body, token = 'test-token') => new Request('https://app.test/api/auth/complete-signup', {
    method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  assert.equal((await route.GET(request('GET', null, 'invalid'))).status, 401);
  assert.deepEqual(await (await route.GET(request('GET'))).json(), { completed: false, uid: h.user.uid });
  assert.equal((await route.POST(request('POST', { ...h.input, granted: false }))).status, 400);
  assert.equal(h.db.documents.size, 0);
  h.db.failReads = true;
  assert.equal((await route.POST(request('POST', h.input))).status, 503);
  assert.equal(h.db.documents.size, 0);
  h.db.failReads = false;
  assert.equal((await route.POST(request('POST', { ...h.input, uid: 'someone-else' }))).status, 200);
  assert.deepEqual(await (await route.GET(request('GET'))).json(), { completed: true, uid: h.user.uid });
  assert.equal(h.db.documents.has('users/someone-else'), false);
});

test('old generic grants require renewal and cannot authorize generation or moderation', async () => {
  const h = fixture();
  h.db.documents.set('users/review-user', {});
  h.db.documents.set('users/review-user/consents/compassAi', { granted: true, version: h.disclosure.SIGNUP_AI_VERSION });
  let generations = 0;
  let moderations = 0;
  h.mocks['@/app/api/gpt/utils/openai-client'] = { getOpenAI: () => ({
    chat: { completions: { create: async () => {
      generations++;
      return { choices: [{ message: { content: 'Choose one small step.' } }], model: 'gpt-4o-mini', usage: { total_tokens: 15 } };
    } } },
    moderations: { create: async ({ input }) => {
      moderations++;
      return { results: Array.from({ length: Array.isArray(input) ? input.length : 1 }, () => ({ flagged: false })) };
    } },
  }) };
  h.mocks['@/app/api/gpt/utils/rate-limiter'] = { checkRateLimit: async () => ({ allowed: true }), recordRequest: async () => {} };
  h.mocks['@/lib/ai/companionContext'] = { getCompanionContext: async () => ({}) };
  h.mocks['@/lib/ai/companionContextFormatter'] = { formatCompanionContext: () => 'Synthetic saved context' };
  h.mocks['@/lib/ai/companionConversations'] = {
    CompanionConversationError: class extends Error {},
    getCompanionHistory: async () => [],
    saveCompanionTurnWithMessage: async () => ({ conversationId: 'chat', assistantMessageId: 'reply' }),
  };
  const route = h.load('app/api/ai/route.ts');
  const send = () => route.POST(new Request('https://app.test/api/ai', { method: 'POST', body: JSON.stringify({ message: 'Help me choose one small step.' }) }));
  assert.equal((await send()).status, 403);
  assert.deepEqual([generations, moderations], [0, 0]);
  await h.safety.writeAiConsent(h.db, h.user.uid, { granted: true, version: h.safety.AI_CONSENT_VERSION });
  const response = await send();
  assert.equal(response.status, 200);
  assert.equal((await response.json()).assistantMessageId, 'reply');
  assert.deepEqual([generations, moderations], [1, 2]);
  await h.safety.writeAiConsent(h.db, h.user.uid, { granted: false, version: h.safety.AI_CONSENT_VERSION });
  assert.equal((await send()).status, 403);
  assert.deepEqual([generations, moderations], [1, 2]);
});

test('legacy Welcome completion is consistently read and advanced without an extra Welcome prompt', async () => {
  const h = fixture();
  await h.signup.completeSignup(h.db, h.user, h.input, async () => h.user);
  const parent = h.db.collection('users').doc(h.user.uid);
  await parent.set({ introVideos: { hasCompletedWelcome: true } }, { merge: true });
  await parent.collection('onboarding').doc('firstRun').set({ state: { stage: 'welcome' } });
  const firstRun = h.load('lib/signup/firstRun.ts');
  assert.deepEqual(await firstRun.getFirstRun(h.db, h.user), { stage: 'choice' });
  assert.deepEqual(
    await firstRun.advanceFirstRun(h.db, h.user, { stage: 'intro', choice: 'purpose' }, async () => h.user),
    { stage: 'intro', choice: 'purpose' },
  );
  assert.deepEqual(await firstRun.getFirstRun(h.db, h.user), { stage: 'intro', choice: 'purpose' });
  assert.deepEqual(
    await firstRun.advanceFirstRun(h.db, h.user, { stage: 'intro', choice: 'purpose' }, async () => h.user),
    { stage: 'intro', choice: 'purpose' },
  );
  await firstRun.advanceFirstRun(h.db, h.user, { stage: 'experience', choice: 'purpose' }, async () => h.user);
  await firstRun.advanceFirstRun(h.db, h.user, { stage: 'complete', choice: 'purpose' }, async () => h.user);
  assert.deepEqual(await firstRun.getFirstRun(h.db, h.user), { stage: 'complete', choice: 'purpose' });
});

test('a new account without completed Welcome cannot skip straight to the chooser experience', async () => {
  const h = fixture();
  await h.signup.completeSignup(h.db, h.user, h.input, async () => h.user);
  const firstRun = h.load('lib/signup/firstRun.ts');
  assert.deepEqual(await firstRun.getFirstRun(h.db, h.user), { stage: 'welcome' });
  await assert.rejects(
    firstRun.advanceFirstRun(h.db, h.user, { stage: 'intro', choice: 'clarity' }, async () => h.user),
    { status: 409 },
  );
  await firstRun.advanceFirstRun(h.db, h.user, { stage: 'choice' }, async () => h.user);
  await firstRun.advanceFirstRun(h.db, h.user, { stage: 'intro', choice: 'clarity' }, async () => h.user);
  await assert.rejects(
    firstRun.advanceFirstRun(h.db, h.user, { stage: 'experience', choice: 'purpose' }, async () => h.user),
    { status: 409 },
  );
});

test('existing post-cutoff users with completed Clarity are not forced through a new Welcome journey', async () => {
  const h = fixture();
  await h.signup.completeSignup(h.db, h.user, h.input, async () => h.user);
  const firstRun = h.load('lib/signup/firstRun.ts');
  const parent = h.db.collection('users').doc(h.user.uid);
  await parent.set({ compassOnboarding: { status: 'complete' } }, { merge: true });
  assert.deepEqual(await firstRun.getFirstRun(h.db, h.user), { stage: 'complete' });
  assert.deepEqual(await firstRun.advanceFirstRun(h.db, h.user, { stage: 'complete' }, async () => h.user), { stage: 'complete' });
});

test('explicit saved first-run state is not overwritten by the existing-account fallback', async () => {
  const h = fixture();
  await h.signup.completeSignup(h.db, h.user, h.input, async () => h.user);
  const firstRun = h.load('lib/signup/firstRun.ts');
  const parent = h.db.collection('users').doc(h.user.uid);
  await parent.set({ compassOnboarding: { status: 'complete' } }, { merge: true });
  await parent.collection('onboarding').doc('firstRun').set({ state: { stage: 'experience', choice: 'clarity' } });
  assert.deepEqual(await firstRun.getFirstRun(h.db, h.user), { stage: 'experience', choice: 'clarity' });
  assert.deepEqual(await firstRun.advanceFirstRun(h.db, h.user, { stage: 'complete', choice: 'clarity' }, async () => h.user),
    { stage: 'complete', choice: 'clarity' });
});

test('partial Clarity retains first-run eligibility even with an early archetype', async () => {
  const h = fixture();
  await h.signup.completeSignup(h.db, h.user, h.input, async () => h.user);
  await h.db.collection('users').doc(h.user.uid).set({
    compassOnboarding: { status: 'in_progress' },
    archetypePrimary: 'Visionary',
  }, { merge: true });
  assert.deepEqual(await h.load('lib/signup/firstRun.ts').getFirstRun(h.db, h.user), { stage: 'welcome' });
});

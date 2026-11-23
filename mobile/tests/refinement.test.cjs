const assert = require('node:assert/strict');
const { test } = require('node:test');
const { harness, React, act, render, press, button, text } = require('./helpers/native-harness.cjs');

test('Purpose smart advance saves two choices, one-of-two Continue, deselection, Back edits, and final reflection without submitting', async () => {
  const h = harness(); const writes = [];
  h.state.save = async body => { writes.push(body); h.state.profile = h.load('lib/purposeCheck.ts').generatePurposeProfile(body); };
  const tree = await render(React.createElement(h.load('app/(app)/(tabs)/purpose.tsx').default));
  const qs = h.load('lib/purposeCheckCopy.ts').PURPOSE_QUESTIONS;
  await press(tree, 'Take the Purpose Check');
  await press(tree, qs[0].options[0].label);
  assert.match(text(tree.root), /Question 1 of 6/);
  assert.equal(button(tree, 'Continue').props.disabled, false);
  await press(tree, '✓ ' + qs[0].options[0].label);
  assert.match(text(tree.root), /Question 1 of 6/);
  assert.equal(button(tree, 'Continue').props.disabled, true);
  await press(tree, qs[0].options[1].label);
  const stale = button(tree, qs[0].options[2].label).props.onPress;
  await act(async () => { stale(); stale(); });
  assert.match(text(tree.root), /Question 2 of 6/);
  await press(tree, 'Back');
  assert.ok(button(tree, '✓ ' + qs[0].options[1].label));
  assert.ok(button(tree, '✓ ' + qs[0].options[2].label));
  await press(tree, '✓ ' + qs[0].options[2].label);
  assert.match(text(tree.root), /Question 1 of 6/);
  await press(tree, 'Continue');
  for (const q of qs.slice(1, 5)) {
    await press(tree, q.options[0].label);
    assert.ok(button(tree, 'Continue'));
    await press(tree, 'Continue');
  }
  assert.match(text(tree.root), /Question 6 of 6/);
  await press(tree, qs[5].options[0].label);
  assert.ok(tree.root.findByType('TextInput'));
  assert.equal(writes.length, 0);
  await press(tree, 'Back');
  assert.ok(button(tree, '✓ ' + qs[5].options[0].label));
  // A radio selection, including reaffirming an existing choice, advances.
  await press(tree, '✓ ' + qs[5].options[0].label);
  assert.ok(tree.root.findByType('TextInput'));
  await press(tree, 'Back');
  await press(tree, qs[5].options[1].label);
  assert.equal(writes.length, 0);
  await press(tree, 'See my Purpose Direction');
  assert.equal(writes.length, 1);
  assert.deepEqual(writes[0].answers.q1, [qs[0].options[1].id]);
  assert.deepEqual(writes[0].answers.q6, [qs[5].options[1].id]);
  await act(async () => tree.unmount());
});

test('every approved Purpose signal has a complete profile without changing audience, impact, direction, or scoring', () => {
  const h = harness(); const { SIGNALS, PURPOSE_QUESTIONS } = h.load('lib/purposeCheckCopy.ts');
  const { PURPOSE_SIGNAL_PROFILES, purposeProfileDetails } = h.load('lib/purposeProfiles.ts');
  assert.deepEqual(Object.keys(PURPOSE_SIGNAL_PROFILES).sort(), [...SIGNALS].sort());
  for (const signal of SIGNALS) {
    const answers = Object.fromEntries(PURPOSE_QUESTIONS.map(q => [q.id, [q.options.find(o => o.signals.includes(signal))?.id || q.options[0].id]]));
    const math = h.load('lib/purposeCheck.ts'); const saved = math.generatePurposeProfile(math.buildPurposePayload(answers, '', false));
    assert.ok(saved.signals.some(s => s.signal === signal));
    const before = JSON.stringify(saved); const full = purposeProfileDetails(saved);
    const content = full.signals.find(s => s.name === signal);
    assert.ok(content.direction && content.interpretation && content.strengths.length >= 3);
    assert.deepEqual(full.audience, saved.audience); assert.equal(full.direction, saved.direction); assert.equal(full.impact, saved.impact.label);
    assert.equal(JSON.stringify(saved), before);
  }
});

for (const atmosphere of [false, true]) test(`Purpose summary ${atmosphere ? 'Home' : 'Account'} uses actual provider and responds to save, retake, deletion, fresh reads`, async () => {
  const h = harness(); let saved = null; let context;
  const math = h.load('lib/purposeCheck.ts');
  const first = math.buildPurposePayload({ q1: ['explain'], q2: ['learn'], q3: ['learn'], q4: ['young'], q5: ['learn'], q6: ['understand'] }, '', false);
  const retake = math.buildPurposePayload({ q1: ['untangle'], q2: ['freedom'], q3: ['fix'], q4: ['building'], q5: ['solve'], q6: ['works'] }, '', false);
  h.mocks['./AuthContext'] = { useAuth: () => ({ user: { uid: 'account' } }) };
  h.mocks['../lib/api'] = { getPurposeResults: async () => ({ purposeProfile: saved, identityType: null }), putPurposeResults: async body => (saved = math.generatePurposeProfile(body)), deletePurposeResults: async () => { saved = null; } };
  const provider = h.load('context/PurposeCheckContext.tsx');
  h.mocks['../context/PurposeCheckContext'] = provider;
  function Probe() { context = provider.usePurposeCheck(); return null; }
  const Summary = h.load('components/PurposeSummary.tsx').PurposeSummary;
  const tree = await render(React.createElement(provider.PurposeCheckProvider, null, React.createElement(Probe), React.createElement(Summary, { atmosphere })));
  await press(tree, 'Take the Purpose Check'); assert.deepEqual(h.routes, ['/purpose']);
  await act(async () => context.save(first)); assert.match(text(tree.root), /Teaching/); assert.ok(text(tree.root).includes(saved.direction));
  await act(async () => context.save(retake)); assert.match(text(tree.root), /Problem solving/); assert.doesNotMatch(text(tree.root), /Teaching/);
  await press(tree, 'View my full Purpose profile');
  await act(async () => context.clear()); assert.ok(button(tree, 'Take the Purpose Check')); assert.doesNotMatch(text(tree.root), /Problem solving/);
  await act(async () => context.save(first)); saved = null; await act(async () => context.refresh()); assert.ok(button(tree, 'Take the Purpose Check'));
  await act(async () => tree.unmount());
});

test('verification control resends through Firebase, refreshes status/token on return, handles throttling, and does not grant marketing consent', async () => {
  const h = harness(); const user = { uid: 'person', emailVerified: false, getIdToken: async force => { assert.equal(force, true); return 'renewed'; } };
  let sends = 0; let throttle = false; let syncs = 0;
  h.mocks['firebase/auth'] = { reload: async () => {}, sendEmailVerification: async () => { sends++; if (throttle) throw { code: 'auth/too-many-requests' }; } };
  h.mocks['../lib/api'] = { refreshEmailStatus: async () => { syncs++; return user.emailVerified; } };
  const Component = h.load('components/EmailVerificationControls.tsx').EmailVerificationControls;
  const tree = await render(React.createElement(Component, { user }));
  assert.match(text(tree.root), /Not verified/);
  await press(tree, 'Send verification email'); assert.equal(sends, 1); assert.match(text(tree.root), /email sent/);
  throttle = true; await press(tree, 'Resend verification email'); assert.match(text(tree.root), /wait a few minutes/);
  user.emailVerified = true; await press(tree, 'I’ve verified my email'); assert.match(text(tree.root), /Verified/);
  assert.equal(button(tree, 'Send verification email'), undefined); assert.ok(syncs >= 4);
  assert.equal(user.marketingConsent, undefined);
  await act(async () => tree.unmount());
});

for (const screenName of ['index', 'account']) test(`actual ${screenName === 'index' ? 'Home' : 'Account'} screen mounts Purpose summary from canonical provider and reflects retake/delete`, async () => {
  const h = harness(); const user = { uid: 'person', email: 'person@example.test', providerData: [{ providerId: 'password' }] };
  const api = { getPurposeResults: async () => ({ purposeProfile: saved, identityType: null }), putPurposeResults: async body => (saved = math.generatePurposeProfile(body)), deletePurposeResults: async () => { saved = null; }, getCompanionProfile: async () => ({ focusAreas: [] }), getConversations: async () => [] };
  h.mocks['expo-linear-gradient'] = { LinearGradient: 'LinearGradient' }; h.mocks['expo-blur'] = { BlurView: 'BlurView' };
  h.mocks['../../../components/BrandHeader'] = { BrandHeader: 'BrandHeader' };
  h.mocks['../../../components/IntroReplay'] = { IntroReplay: 'IntroReplay' };
  const firstRun = { stage: 'experience', choice: 'clarity' };
  h.mocks['../../../context/OnboardingContext'] = { useOnboarding: () => ({ onboarding: { status: 'complete' } }) };
  h.mocks['../../../context/FirstRunContext'] = { useFirstRun: () => ({ state: firstRun }) };
  h.mocks['expo-router'].Link = 'Link';
  h.mocks['../../../components/VisualEnvironmentPicker'] = { VisualEnvironmentPicker: 'VisualEnvironmentPicker' };
  h.mocks['../../../components/EmailVerificationControls'] = { EmailVerificationControls: 'EmailVerificationControls' };
  h.mocks['./AuthContext'] = h.mocks['../../../context/AuthContext'] = { useAuth: () => ({ user }) };
  h.mocks['../lib/api'] = h.mocks['../../../lib/api'] = api;
  const math = h.load('lib/purposeCheck.ts'); let saved = null; let context;
  const provider = h.load('context/PurposeCheckContext.tsx'); h.mocks['../context/PurposeCheckContext'] = provider;
  function Probe() { context = provider.usePurposeCheck(); return null; }
  const Screen = h.load(`app/(app)/(tabs)/${screenName}.tsx`).default;
  const screen = () => React.createElement(provider.PurposeCheckProvider, null,
    React.createElement(Probe), React.createElement(Screen));
  const tree = await render(screen());
  if (screenName === 'index') {
    const clarityLink = () => tree.root.findAllByType('Link').find(link => text(link) === 'Clarity Check');
    assert.equal(clarityLink().props.href, '/onboarding');
    firstRun.stage = 'complete';
    await act(async () => tree.update(screen()));
    assert.equal(clarityLink().props.href, '/clarity-check');
  }
  assert.ok(button(tree, 'Take the Purpose Check'));
  const first = math.buildPurposePayload({ q1: ['explain'], q2: ['learn'], q3: ['learn'], q4: ['young'], q5: ['learn'], q6: ['understand'] }, '', false);
  await act(async () => context.save(first)); assert.ok(button(tree, 'View my full Purpose profile')); assert.ok(text(tree.root).includes(saved.direction));
  const retake = math.buildPurposePayload({ q1: ['make'], q2: ['beauty'], q3: ['ideas'], q4: ['community'], q5: ['real'], q6: ['beauty'] }, '', false);
  await act(async () => context.save(retake)); assert.match(text(tree.root), /Creative expression/); assert.doesNotMatch(text(tree.root), /Teaching/);
  await act(async () => context.clear()); assert.ok(button(tree, 'Take the Purpose Check')); assert.doesNotMatch(text(tree.root), /Creative expression/);
  await act(async () => tree.unmount());
});

test('actual account creation retries a failed name or disclosure save before opening the first-run flow', async () => {
  const h = harness();
  const firebaseAuth = { currentUser: null };
  let observer;
  let context;
  let creations = 0;
  let consentWrites = 0;
  let failNameSave = true;
  let failAdmission = true;
  let failSend = false;
  const admissions = [];
  const verificationNames = [];
  h.mocks['../lib/firebase'] = { auth: firebaseAuth };
  h.mocks['firebase/auth'] = {
    onAuthStateChanged: (_auth, callback) => { observer = callback; callback(firebaseAuth.currentUser); return () => {}; },
    createUserWithEmailAndPassword: async (_auth, email) => {
      const user = { uid: String(++creations), email, emailVerified: false, displayName: null };
      firebaseAuth.currentUser = user;
      observer(user);
      return { user };
    },
    updateProfile: async (user, { displayName }) => {
      if (failNameSave) throw new Error('Temporarily offline');
      user.displayName = displayName;
    },
    sendEmailVerification: async user => {
      verificationNames.push(user.displayName);
      if (failSend) throw { code: 'auth/too-many-requests' };
    },
  };
  h.mocks['../lib/api'] = {
    acknowledgeSignupDisclosure: async (uid, name) => {
      admissions.push({ uid, ...name });
      if (failAdmission) throw new Error('Temporarily offline');
    },
    saveMarketingConsent: async () => { consentWrites++; },
  };
  const auth = h.load('context/AuthContext.tsx'); function Probe() { context = auth.useAuth(); return null; }
  const tree = await render(React.createElement(auth.AuthProvider, null, React.createElement(Probe)));
  await act(async () => assert.rejects(
    context.createAccount('Person@Example.test', 'password', {
      firstName: 'Tara', lastName: 'Rivera', disclosureAcknowledged: false, marketingOptIn: true,
    }),
    /review the AI-powered features disclosure/i,
  ));
  assert.equal(creations, 0);
  const signup = () => context.createAccount(' Person@Example.test ', 'password', {
    firstName: '  Tara  ', lastName: ' Rivera ',
    disclosureAcknowledged: true, marketingOptIn: false,
  });
  await act(async () => assert.rejects(
    signup(), /save your name/,
  ));
  assert.equal(context.user, null);
  assert.deepEqual(admissions, []);
  assert.deepEqual(verificationNames, []);
  failNameSave = false;
  await act(async () => assert.rejects(signup(), /save your acknowledgment/));
  assert.equal(context.user, null);
  const expectedAdmission = { uid: '1', firstName: 'Tara', lastName: 'Rivera' };
  assert.deepEqual(admissions, [expectedAdmission]);
  assert.deepEqual(verificationNames, []);
  failAdmission = false;
  await act(async () => signup());
  assert.equal(creations, 1);
  assert.deepEqual(admissions, [expectedAdmission, expectedAdmission]);
  assert.equal(context.user.email, 'Person@Example.test');
  assert.equal(context.user.displayName, 'Tara Rivera');
  assert.deepEqual(verificationNames, ['Tara Rivera']);
  assert.equal(consentWrites, 0);
  failSend = true;
  await act(async () => context.createAccount('second@example.test', 'password', {
    firstName: 'Alex', lastName: 'Quinn', disclosureAcknowledged: true, marketingOptIn: true,
  }));
  assert.deepEqual(verificationNames, ['Tara Rivera', 'Alex Quinn']);
  assert.equal(consentWrites, 1);
  assert.equal(context.user.emailVerified, false);
  await act(async () => tree.unmount());
});

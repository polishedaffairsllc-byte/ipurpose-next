const assert = require('node:assert/strict');
const { test } = require('node:test');
const { harness, React, act, render, press, button, text } = require('./helpers/native-harness.cjs');

function apiHarness() {
 const h = harness(); const refreshes = [];
 h.mocks['./analyticsEvents'] = { logLaunchEvent: () => {} };
 h.mocks['./firebase'] = { auth: { currentUser: { uid: 'test', getIdToken: async force => { refreshes.push(force); return force ? 'renewed-token' : 'initial-token'; } } } };
 return { h, api: h.load('lib/api.ts'), refreshes };
}
test('Purpose API supplies native bearer token and refreshes a rejected token once; null means first-time user', async () => {
 const { h, api, refreshes } = apiHarness(); const requests = [];
 h.mocks.fetch = async (url, init) => { requests.push({ url, init }); return requests.length === 1 ? Response.json({ error: { message: 'expired' } }, { status: 401 }) : Response.json({ purposeProfile: null, identityType: null }); };
 assert.deepEqual(await api.getPurposeResults(), { purposeProfile: null, identityType: null });
 assert.deepEqual(refreshes, [false, true]); assert.equal(requests[0].url, 'https://ipurposesoul.com/api/ai/purpose');
 assert.equal(requests[1].init.headers.get('Authorization'), 'Bearer renewed-token');
});
for (const status of [401, 404, 500]) test(`Purpose HTTP ${status} remains a failure, never an empty profile`, async () => {
 const { h, api, refreshes } = apiHarness(); h.mocks.fetch = async () => Response.json({ error: { message: 'request rejected' } }, { status });
 await assert.rejects(api.getPurposeResults(), new RegExp(String(status))); assert.equal(refreshes.length, status === 401 ? 2 : 1);
});
test('Purpose malformed success and network failures remain errors; missing auth makes no request', async () => {
 const { h, api } = apiHarness(); h.mocks.fetch = async () => Response.json({}); await assert.rejects(api.getPurposeResults(), /Invalid Purpose response/);
 h.mocks.fetch = async () => { throw new TypeError('Network request failed'); }; await assert.rejects(api.getPurposeResults(), /Network/);
 h.mocks['./firebase'].auth.currentUser = null; await assert.rejects(api.getPurposeResults(), /sign in/);
});
for (const existing of [false, true]) test(`actual Purpose provider + API + screen: ${existing ? 'existing results and retake' : 'first-time start'} reaches all six questions and saves`, async () => {
 const { h } = apiHarness(); const math = h.load('lib/purposeCheck.ts'); const writes = [];
 let profile = existing ? math.generatePurposeProfile(math.buildPurposePayload({ q1: ['explain'], q2: ['learn'], q3: ['learn'], q4: ['young'], q5: ['learn'], q6: ['understand'] }, '', false)) : null;
 h.mocks['./AuthContext'] = { useAuth: () => ({ user: { uid: 'test' } }) };
 const context = h.load('context/PurposeCheckContext.tsx'); h.mocks['../../../context/PurposeCheckContext'] = context;
 h.mocks.fetch = async (url, init) => {
  assert.equal(url, 'https://ipurposesoul.com/api/ai/purpose'); assert.ok(init.headers.get('Authorization').startsWith('Bearer '));
  if (init.method === 'PUT') { const body = JSON.parse(init.body); writes.push(body); profile = math.generatePurposeProfile(body); }
  return Response.json({ purposeProfile: profile, identityType: null });
 };
 const Screen = h.load('app/(app)/(tabs)/purpose.tsx').default;
 const tree = await render(React.createElement(context.PurposeCheckProvider, null, React.createElement(Screen)));
 assert.doesNotMatch(text(tree.root), /could not be loaded/);
 await press(tree, existing ? 'Retake the Purpose Check' : 'Take the Purpose Check');
 const qs = h.load('lib/purposeCheckCopy.ts').PURPOSE_QUESTIONS; assert.equal(qs.length, 6);
 for (const q of qs) { assert.match(text(tree.root), new RegExp(q.prompt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))); await press(tree, q.options[0].label); if (q.max > 1) await press(tree, 'Continue'); }
 await press(tree, 'See my Purpose Direction'); assert.equal(writes.length, 1); assert.equal(Object.keys(writes[0].answers).length, 6);
 assert.ok(button(tree, 'Retake the Purpose Check')); assert.equal(button(tree, 'Continue to the Purpose Path').props.disabled, true);
 await act(async () => tree.unmount());
});
test('Purpose provider exposes genuine failure and retry recovers to first-time start', async () => {
 const { h } = apiHarness(); h.mocks['./AuthContext'] = { useAuth: () => ({ user: { uid: 'test' } }) };
 const context = h.load('context/PurposeCheckContext.tsx'); h.mocks['../../../context/PurposeCheckContext'] = context;
 let failed = true; h.mocks.fetch = async () => failed ? Response.json({ error: 'database unavailable' }, { status: 500 }) : Response.json({ purposeProfile: null, identityType: null });
 const tree = await render(React.createElement(context.PurposeCheckProvider, null, React.createElement(h.load('app/(app)/(tabs)/purpose.tsx').default)));
 assert.ok(button(tree, 'Try again')); assert.equal(button(tree, 'Take the Purpose Check'), undefined);
 failed = false; await press(tree, 'Try again'); assert.ok(button(tree, 'Take the Purpose Check')); await act(async () => tree.unmount());
});

test('Account environment saves propagate into mounted Clarity intro/questions and persist on remount through Depth → Renewal → Warmth → Depth', async () => {
 const h = harness(); let saved = { mode: 'manual', manualTheme: 'depth' }; const writes = [];
 h.mocks['./AuthContext'] = { useAuth: () => ({ user: { uid: 'test' }, loading: false }) };
 h.mocks['../context/AuthContext'] = { useAuth: () => ({ signOut: async () => {} }) };
 h.mocks['../context/OnboardingContext'] = { useOnboarding: () => ({ onboarding: null, refresh: async () => {} }) };
 h.mocks['../lib/api'] = { getCompanionProfile: async () => ({ visualEnvironmentPreference: saved }), updateVisualEnvironmentPreference: async pref => { saved = pref; writes.push(pref); return { visualEnvironmentPreference: pref }; }, createClarityRequestId: () => 'stable-attempt' };
 h.mocks['expo-linear-gradient'] = { LinearGradient: 'LinearGradient' }; h.mocks['./BrandHeader'] = { BrandHeader: 'BrandHeader' };
 const env = h.load('context/VisualEnvironmentContext.tsx'); h.mocks['../context/VisualEnvironmentContext'] = env;
 const Picker = h.load('components/VisualEnvironmentPicker.tsx').VisualEnvironmentPicker;
 const Flow = h.load('components/ClarityCheckFlow.tsx').ClarityCheckFlow;
 const app = () => React.createElement(env.VisualEnvironmentProvider, null, React.createElement(Picker), React.createElement(Flow, { mode: 'retake' }));
 let tree = await render(app()); const tokens = h.load('theme.ts').visualEnvironments;
 const check = name => {
  assert.deepEqual(tree.root.findByType('LinearGradient').props.colors, tokens[name].atmosphereGradient.colors);
  const b = button(tree, 'Begin again'); const style = b.props.style({ pressed: false }); assert.equal(style[0].backgroundColor, tokens[name].buttonBackground);
 };
 check('depth');
 for (const name of ['renewal', 'warmth', 'depth']) {
  const label = name[0].toUpperCase() + name.slice(1);
  const option = tree.root.findAllByType('Pressable').find(n => n.props.accessibilityRole === 'radio' && n.props.accessibilityLabel.startsWith(label + '.'));
  await act(async () => option.props.onPress()); await press(tree, 'Use this environment'); check(name);
  await act(async () => tree.unmount()); tree = await render(app()); check(name);
 }
 assert.deepEqual(writes.map(p => p.manualTheme), ['renewal', 'warmth', 'depth']);
 await press(tree, 'Begin again');
 await act(async () => { const context = tree.root.findAllByType('Pressable').find(n => n.props.accessibilityRole === 'radio' && n.props.accessibilityLabel.startsWith('Renewal.')); context.props.onPress(); });
 await press(tree, 'Use this environment'); assert.deepEqual(tree.root.findByType('LinearGradient').props.colors, tokens.renewal.atmosphereGradient.colors);
 // Theme change does not remount or reset the current assessment question.
 assert.match(text(tree.root), /CLARITY · 1 OF/); await act(async () => tree.unmount());
});

test('signup visibility toggles are independent and preserve values, validation, default-off consent and submission', async () => {
 const h = harness(); const calls = [];
 h.mocks['../context/AuthContext'] = { useAuth: () => ({ user: null, loading: false, createAccount: async (...a) => calls.push(a) }) };
 h.mocks['../components/AuthScaffold'] = { AuthScaffold: 'AuthScaffold', AuthPanel: 'AuthPanel', authStyles: {} };
 h.mocks['firebase/app'] = { FirebaseError: class extends Error {} };
 const tree = await render(React.createElement(h.load('app/create-account.tsx').default));
 const input = label => tree.root.findAllByType('TextInput').find(n => n.props.accessibilityLabel === label);
 const toggle = async label => { const b = tree.root.findAllByType('Pressable').find(n => n.props.accessibilityLabel === label); assert.ok(b); await act(async () => b.props.onPress()); };
 const box = tree.root.findAllByType('Pressable').find(n => n.props.accessibilityRole === 'checkbox'); assert.equal(box.props.accessibilityState.checked, false);
 assert.equal(input('Password').props.secureTextEntry, true); assert.equal(input('Confirm password').props.secureTextEntry, true);
 await act(async () => { input('Email').props.onChangeText(' person@example.test '); input('Password').props.onChangeText('secret123'); input('Confirm password').props.onChangeText('mismatch'); });
 assert.equal(button(tree, 'Create Account').props.disabled, true);
 await toggle('Show password'); assert.equal(input('Password').props.secureTextEntry, false); assert.equal(input('Confirm password').props.secureTextEntry, true);
 await toggle('Show confirm password'); assert.equal(input('Confirm password').props.secureTextEntry, false); assert.equal(input('Password').props.value, 'secret123');
 await toggle('Hide password'); await toggle('Hide confirm password'); assert.equal(input('Password').props.secureTextEntry, true);
 await act(async () => input('Confirm password').props.onChangeText('secret123')); await press(tree, 'Create Account');
 assert.deepEqual(calls, [['person@example.test', 'secret123', false]]); await act(async () => tree.unmount());
});

test('Clarity retake reaches every unchanged question, retries with the same attempt ID and displays the server result', async () => {
 const h = harness(); const submissions = []; let nextId = 0;
 h.mocks['../context/AuthContext'] = { useAuth: () => ({ signOut: async () => {} }) };
 h.mocks['../context/OnboardingContext'] = { useOnboarding: () => ({ onboarding: null, refresh: async () => {} }) };
 h.mocks['expo-linear-gradient'] = { LinearGradient: 'LinearGradient' }; h.mocks['./BrandHeader'] = { BrandHeader: 'BrandHeader' };
 const result = { success: true, submissionId: 'saved', identityType: 'Visionary', resultSummary: 'Approved server summary', nextStep: 'Approved server next step', scores: { internalClarity: 8, readinessForSupport: 8, frictionBetweenInsightAndAction: 8, integrationAndMomentum: 4, totalScore: 28 } };
 h.mocks['../lib/api'] = { createClarityRequestId: () => `attempt-${++nextId}`, submitClarityCheck: async body => { submissions.push(body); if (submissions.length === 1) throw new Error('Temporary request failure'); return result; } };
 const tree = await render(React.createElement(h.load('components/ClarityCheckFlow.tsx').ClarityCheckFlow, { mode: 'retake' }));
 const { CLARITY_QUESTIONS, IDENTITY_QUESTIONS } = h.load('lib/onboarding.ts');
 await press(tree, 'Begin again');
 for (const question of CLARITY_QUESTIONS) {
  assert.ok(text(tree.root).includes(question)); const choice = tree.root.findAllByType('Pressable').find(n => n.props.accessibilityLabel === '4 out of 5');
  await act(async () => choice.props.onPress());
 }
 const chooseIdentity = async question => { assert.ok(text(tree.root).includes(question.text)); const choice = tree.root.findAllByType('Pressable').find(n => text(n).endsWith(question.options.A)); await act(async () => choice.props.onPress()); };
 for (const question of IDENTITY_QUESTIONS) await chooseIdentity(question);
 assert.match(text(tree.root), /Temporary request failure/); await chooseIdentity(IDENTITY_QUESTIONS.at(-1));
 assert.equal(submissions.length, 2); assert.deepEqual(submissions[0], submissions[1]);
 assert.deepEqual(submissions[1].responses, Object.fromEntries(CLARITY_QUESTIONS.map((_, i) => [String(i + 1), 4])));
 assert.deepEqual(submissions[1].identityResponses, IDENTITY_QUESTIONS.map(() => 'A')); assert.equal(submissions[1].onboarding, false);
 assert.ok(button(tree, 'Return to Account')); assert.match(text(tree.root), /Approved server summary/); assert.match(text(tree.root), /Approved server next step/);
 assert.equal(h.events.filter(name => name === 'clarity_check_complete').length, 1);
 await act(async () => tree.unmount());
});

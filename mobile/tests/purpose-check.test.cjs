/* global __dirname */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const testRequire = process.env.MOBILE_TEST_RUNTIME ? createRequire(path.join(process.env.MOBILE_TEST_RUNTIME, 'package.json')) : require;
const React = testRequire('react');
const { act, create } = testRequire('react-test-renderer');
const ts = require('typescript');
global.IS_REACT_ACT_ENVIRONMENT = true;
function harness() {
 const cache = new Map(); const routes = []; const events = [];
 const native = { ...Object.fromEntries(['ActivityIndicator', 'KeyboardAvoidingView', 'Pressable', 'Text', 'TextInput', 'View', 'Modal'].map(s => [s, s])), ScrollView: React.forwardRef(function TestScrollView(props, ref) { React.useImperativeHandle(ref, () => ({ scrollTo() {} })); return React.createElement('ScrollView', props); }), Platform: { OS: 'ios' }, useWindowDimensions: () => ({ width: 320, height: 640, fontScale: 1 }), StyleSheet: { create: s => s } };
 const Tabs = props => React.createElement('Tabs', props); Tabs.Screen = 'TabScreen';
 const mocks = { react: React, 'react/jsx-runtime': testRequire('react/jsx-runtime'), 'react-native': native, '@expo/vector-icons/Ionicons': 'Icon', 'react-native-safe-area-context': { SafeAreaView: 'SafeAreaView', useSafeAreaInsets: () => ({ bottom: 34 }) }, 'expo-router': { Tabs, useRouter: () => ({ push: route => routes.push(route) }), useFocusEffect: fn => React.useEffect(fn, [fn]) } };
 function load(relative) {
  const filename = path.resolve(__dirname, '../src', relative); if (cache.has(filename)) return cache.get(filename).exports;
  const module = { exports: {} }; cache.set(filename, module);
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, target: ts.ScriptTarget.ES2022 }, fileName: filename }).outputText;
  function localRequire(id) { if (Object.hasOwn(mocks, id)) return mocks[id]; if (id.startsWith('.')) { const base = path.resolve(path.dirname(filename), id); const file = ['.tsx', '.ts'].map(ext => base + ext).find(fs.existsSync); if (file) return load(path.relative(path.resolve(__dirname, '../src'), file)); } return require(id); }
  new Function('require', 'module', 'exports', output)(localRequire, module, module.exports); return module.exports;
 }
 const tokens = load('theme.ts').visualEnvironments.depth;
 for (const prefix of ['../', '../../../']) { mocks[prefix + 'context/VisualEnvironmentContext'] = { useVisualEnvironment: () => ({ tokens }) }; mocks[prefix + 'lib/analyticsEvents'] = { logLaunchEvent: name => events.push(name) }; }
 const state = { profile: null, identityType: null, loading: false, error: null, refresh: async () => {}, save: async () => {}, clear: async () => {} };
 for (const prefix of ['../', '../../../']) mocks[prefix + 'context/PurposeCheckContext'] = { usePurposeCheck: () => state };
 return { load, mocks, routes, events, state, native };
}
const text = node => typeof node === 'string' ? node : (node.children || []).map(text).join('');
const button = (tree, label) => tree.root.findAllByType('Pressable').find(n => text(n) === label);
async function press(tree, label) { const node = button(tree, label); assert.ok(node, label); assert.ok(!node.props.disabled, label); await act(async () => { await node.props.onPress(); }); }
async function render(element) { let tree; await act(async () => { tree = create(element); }); return tree; }
async function answerAll(h, tree) { const { PURPOSE_QUESTIONS } = h.load('lib/purposeCheckCopy.ts'); for (const q of PURPOSE_QUESTIONS) { await press(tree, q.options[0].label); await press(tree, 'Continue'); } }
for (const saveReflection of [false, true]) test(`actual six-question flow sends reflection only when save is ${saveReflection}`, async () => {
 const h = harness(); const writes = []; h.state.save = async body => { writes.push(body); h.state.profile = h.load('lib/purposeCheck.ts').generatePurposeProfile(body); };
 const Screen = h.load('app/(app)/(tabs)/purpose.tsx').default; const tree = await render(React.createElement(Screen));
 await press(tree, 'Take the Purpose Check');
 assert.equal(button(tree, 'Continue').props.disabled, true);
 const q1 = h.load('lib/purposeCheckCopy.ts').PURPOSE_QUESTIONS[0];
 await press(tree, q1.options[0].label); await press(tree, q1.options[1].label); assert.equal(button(tree, q1.options[2].label).props.disabled, true);
 await press(tree, '✓ ' + q1.options[1].label); await press(tree, 'Continue');
 for (const q of h.load('lib/purposeCheckCopy.ts').PURPOSE_QUESTIONS.slice(1)) { await press(tree, q.options[0].label); await press(tree, 'Continue'); }
 const input = tree.root.findByType('TextInput'); await act(async () => input.props.onChangeText('private words'));
 const checkbox = tree.root.findAllByType('Pressable').find(n => n.props.accessibilityRole === 'checkbox'); assert.equal(checkbox.props.accessibilityState.checked, false);
 if (saveReflection) await act(async () => checkbox.props.onPress());
 await press(tree, 'See my Purpose Direction'); assert.equal(writes.length, 1);
 assert.equal(writes[0].reflection, saveReflection ? 'private words' : undefined); assert.equal(JSON.stringify(writes[0]).includes('private words'), saveReflection);
 assert.equal(button(tree, 'Continue to the Purpose Path').props.disabled, true);
 await press(tree, 'Talk it through in Compass'); assert.deepEqual(h.routes, ['/mentor']); assert.deepEqual(h.events, ['purpose_check_start', 'purpose_check_complete']);
 await press(tree, 'Retake the Purpose Check'); await answerAll(h, tree); assert.equal(tree.root.findByType('TextInput').props.value, '');
 assert.equal(tree.root.findAllByType('Pressable').find(n => n.props.accessibilityRole === 'checkbox').props.accessibilityState.checked, false);
 await act(async () => tree.unmount());
});
test('failed Purpose save keeps draft, retries once, and does not claim completion', async () => {
 const h = harness(); let fail = true; let calls = 0; h.state.save = async body => { calls++; if (fail) throw Error('offline'); h.state.profile = h.load('lib/purposeCheck.ts').generatePurposeProfile(body); };
 const tree = await render(React.createElement(h.load('app/(app)/(tabs)/purpose.tsx').default)); await press(tree, 'Take the Purpose Check'); await answerAll(h, tree); await press(tree, 'See my Purpose Direction');
 assert.match(text(tree.root), /could not be saved/); assert.deepEqual(h.events, ['purpose_check_start']); fail = false; await press(tree, 'See my Purpose Direction'); assert.equal(calls, 2); assert.deepEqual(h.events, ['purpose_check_start', 'purpose_check_complete']); await act(async () => tree.unmount());
});
test('Account control requires confirmation, cancellation does not delete, successful deletion clears profile', async () => {
 const h = harness(); let deletes = 0; h.state.profile = {}; h.state.clear = async () => { deletes++; h.state.profile = null; };
 const tree = await render(React.createElement(h.load('components/PurposeDeletionControl.tsx').PurposeDeletionControl));
 const getModal = () => tree.root.findByType('Modal'); assert.equal(getModal().props.visible, false);
 await press(tree, 'Delete my Purpose results'); assert.equal(getModal().props.visible, true); assert.equal(deletes, 0);
 await press(tree, 'Cancel'); assert.equal(getModal().props.visible, false); assert.equal(deletes, 0);
 await press(tree, 'Delete my Purpose results');
 const confirm = tree.root.findAllByType('Pressable').filter(n => text(n) === 'Delete my Purpose results').at(-1); await act(async () => confirm.props.onPress());
 assert.equal(deletes, 1); assert.equal(h.state.profile, null); assert.equal(getModal().props.visible, false); assert.match(text(tree.root), /have been deleted/); await act(async () => tree.unmount());
});
test('five tabs retain required order and reserve the bottom safe area', async () => {
 const h = harness(); const tree = await render(React.createElement(h.load('app/(app)/(tabs)/_layout.tsx').default));
 assert.deepEqual(tree.root.findAllByType('TabScreen').map(n => n.props.name), ['index', 'clarity-check', 'purpose', 'mentor', 'account']);
 const style = tree.root.findByType('Tabs').props.screenOptions.tabBarStyle; assert.equal(style.paddingBottom, 34); assert.equal(style.height, 98); await act(async () => tree.unmount());
});
test('Purpose provider prevents late previous-account results and stale refresh after deletion', async () => {
 const h = harness(); let user = { uid: 'a' }; let release;
 h.mocks['./AuthContext'] = { useAuth: () => ({ user }) };
 const profile = h.load('lib/purposeCheck.ts').generatePurposeProfile(h.load('lib/purposeCheck.ts').buildPurposePayload({ q1: ['explain'], q2: ['learn'], q3: ['learn'], q4: ['young'], q5: ['learn'], q6: ['understand'] }, 'private A', true));
 let read = 0; h.mocks['../lib/api'] = { getPurposeResults: async () => { read++; return read === 1 ? new Promise(resolve => { release = resolve; }) : { purposeProfile: null, identityType: null }; }, deletePurposeResults: async () => {}, putPurposeResults: async () => profile };
 const { PurposeCheckProvider, usePurposeCheck } = h.load('context/PurposeCheckContext.tsx'); let context; function Probe() { context = usePurposeCheck(); return null; }
 const element = () => React.createElement(PurposeCheckProvider, null, React.createElement(Probe)); const tree = await render(element());
 user = { uid: 'b' }; await act(async () => tree.update(element())); await act(async () => release({ purposeProfile: profile, identityType: 'Builder' })); assert.equal(context.profile, null);
 await act(async () => context.save({})); assert.ok(context.profile); await act(async () => context.clear()); assert.equal(context.profile, null); await act(async () => tree.unmount());
});
test('completed Clarity pairs its existing identity, and one positive signal stays one chip', async () => {
 const h = harness(); const math = h.load('lib/purposeCheck.ts'); h.state.profile = math.generatePurposeProfile(math.buildPurposePayload({ q1: ['explain'], q2: ['learn'], q3: ['learn'], q4: ['young'], q5: ['learn'], q6: ['understand'] }, '', false)); h.state.identityType = 'Builder';
 const tree = await render(React.createElement(h.load('app/(app)/(tabs)/purpose.tsx').default)); assert.match(text(tree.root), /You tend to move like a Builder/); assert.equal(button(tree, 'Take the Clarity Check'), undefined); assert.equal(h.state.profile.signals.length, 1); await act(async () => tree.unmount());
});
test('Purpose deletion waits for a pending save and subsequent refresh reads the deleted record', async () => {
 const h = harness(); let context; let release; let saved = null; const writes = [];
 h.mocks['./AuthContext'] = { useAuth: () => ({ user: { uid: 'a' } }) };
 const profile = h.load('lib/purposeCheck.ts').generatePurposeProfile(h.load('lib/purposeCheck.ts').buildPurposePayload({ q1: ['explain'], q2: ['learn'], q3: ['learn'], q4: ['young'], q5: ['learn'], q6: ['understand'] }, '', false));
 h.mocks['../lib/api'] = { getPurposeResults: async () => ({ purposeProfile: saved, identityType: null }), putPurposeResults: async () => { await new Promise(resolve => { release = resolve; }); saved = profile; writes.push('save'); return profile; }, deletePurposeResults: async () => { saved = null; writes.push('delete'); } };
 const { PurposeCheckProvider, usePurposeCheck } = h.load('context/PurposeCheckContext.tsx'); function Probe() { context = usePurposeCheck(); return null; }
 const tree = await render(React.createElement(PurposeCheckProvider, null, React.createElement(Probe))); let saving; let deleting; let refreshing;
 await act(async () => { saving = context.save({}); }); await act(async () => { deleting = context.clear(); refreshing = context.refresh(); });
 assert.deepEqual(writes, []); await act(async () => { release(); await Promise.all([saving, deleting, refreshing]); }); assert.deepEqual(writes, ['save', 'delete']); assert.equal(context.profile, null); assert.equal(saved, null); await act(async () => tree.unmount());
});

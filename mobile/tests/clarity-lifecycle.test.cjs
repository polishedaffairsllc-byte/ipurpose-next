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
 const native = { ...Object.fromEntries(['ActivityIndicator', 'KeyboardAvoidingView', 'Pressable', 'Text', 'TextInput', 'View', 'Modal'].map(s => [s, s])), ScrollView: React.forwardRef((props, ref) => { React.useImperativeHandle(ref, () => ({ scrollTo() {} })); return React.createElement('ScrollView', props); }), Platform: { OS: 'ios' }, useWindowDimensions: () => ({ width: 320, height: 640, fontScale: 1 }), StyleSheet: { create: s => s } };
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
for (const optIn of [false, true]) test(`marketing checkbox defaults off; create account passes explicit choice ${optIn}`, async () => {
 const h = harness(); const calls = [];
 h.mocks['../context/AuthContext'] = { useAuth: () => ({ user: null, loading: false, createAccount: async (...args) => calls.push(args) }) };
 h.mocks['../components/AuthScaffold'] = { AuthScaffold: 'AuthScaffold', AuthPanel: 'AuthPanel', authStyles: {} };
 h.mocks['firebase/app'] = { FirebaseError: class FirebaseError extends Error {} };
 const tree = await render(React.createElement(h.load('app/create-account.tsx').default));
 const box = tree.root.findAllByType('Pressable').find(n => n.props.accessibilityRole === 'checkbox'); assert.equal(box.props.accessibilityState.checked, false);
 const inputs = tree.root.findAllByType('TextInput');
 await act(async () => { inputs[0].props.onChangeText('person@example.test'); inputs[1].props.onChangeText('password'); inputs[2].props.onChangeText('password'); });
 if (optIn) await act(async () => box.props.onPress());
 await press(tree, 'Create Account'); assert.deepEqual(calls, [['person@example.test', 'password', optIn]]); assert.equal(h.events.includes('email_signup'), false);
 await act(async () => tree.unmount());
});

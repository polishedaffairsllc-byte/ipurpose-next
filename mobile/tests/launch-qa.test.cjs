const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const { act, create } = require('react-test-renderer');

global.IS_REACT_ACT_ENVIRONMENT = true;
global.requestAnimationFrame = (callback) => callback();

// Execute the actual mobile components with native host controls and API boundaries
// replaced. These are interaction tests, not Android layout/device simulations.
function harness(overrides = {}) {
  const cache = new Map();
  const focusEffects = [];
  const appListeners = new Set();
  const statusStyles = [];
  const scrolls = [];
  const keyboardListeners = new Map();
  const native = {
    ...Object.fromEntries(['ActivityIndicator', 'KeyboardAvoidingView', 'Pressable', 'ScrollView', 'Text', 'TextInput', 'View', 'Image', 'ImageBackground', 'Modal'].map((name) => [name, name])),
    FlatList: React.forwardRef((props, ref) => {
      React.useImperativeHandle(ref, () => ({ scrollToEnd: (options) => scrolls.push(options) }));
      return React.createElement('FlatList', props);
    }),
    StyleSheet: { create: (styles) => styles, hairlineWidth: 1 },
    Platform: { OS: 'android' },
    Keyboard: { addListener: (name, callback) => {
      if (!keyboardListeners.has(name)) keyboardListeners.set(name, new Set());
      keyboardListeners.get(name).add(callback);
      return { remove: () => keyboardListeners.get(name).delete(callback) };
    } },
    useWindowDimensions: () => ({ width: 360, height: 640, fontScale: 1 }),
    AppState: { addEventListener: (_, callback) => {
      appListeners.add(callback);
      return { remove: () => appListeners.delete(callback) };
    } },
  };
  const Tabs = (props) => React.createElement('Tabs', props);
  Tabs.Screen = 'TabScreen';
  const mocks = {
    'react-native': native,
    '../lib/analyticsEvents': { logLaunchEvent() {} },
    '@expo/vector-icons/Ionicons': 'Icon',
    'expo-linear-gradient': { LinearGradient: 'LinearGradient' },
    'expo-blur': { BlurView: 'BlurView' },
    'expo-status-bar': { StatusBar: 'StatusBar', setStatusBarStyle: (style) => statusStyles.push(style) },
    'react-native-safe-area-context': { SafeAreaProvider: 'SafeAreaProvider', SafeAreaView: 'SafeAreaView', useSafeAreaInsets: () => ({ top: 24, bottom: 24, left: 0, right: 0 }) },
    'expo-router': {
      Tabs,
      Redirect: 'Redirect',
      useRouter: () => ({ replace() {}, back() {}, push() {} }),
      useLocalSearchParams: () => ({}),
      useFocusEffect: (effect) => {
        React.useEffect(() => {
          focusEffects.push(effect);
          return effect();
        }, [effect]);
      },
    },
    ...overrides,
  };
  function load(relativePath) {
    const filename = path.resolve(__dirname, '../src', relativePath);
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, target: ts.ScriptTarget.ES2022 },
      fileName: filename,
    }).outputText;
    function localRequire(id) {
      if (Object.hasOwn(mocks, id)) return mocks[id];
      if (/\.(png|jpg)$/.test(id)) return id;
      if (id.startsWith('.')) {
        const base = path.resolve(path.dirname(filename), id);
        const resolved = ['.tsx', '.ts'].map((extension) => base + extension).find(fs.existsSync);
        if (resolved) return load(path.relative(path.resolve(__dirname, '../src'), resolved));
      }
      return require(id);
    }
    new Function('require', 'module', 'exports', output)(localRequire, module, module.exports);
    return module.exports;
  }
  return { load, native, mocks, appListeners, statusStyles, scrolls, keyboardListeners };
}
async function render(element, options) {
  let tree;
  await act(async () => { tree = create(element, options); });
  return tree;
}
const unmount = (tree) => act(async () => tree.unmount());
const allText = (node) => typeof node === 'string' ? node : (node.children || []).map(allText).join('');
function button(tree, text) {
  return tree.root.findAllByType('Pressable').find((node) => node.props.accessibilityLabel === text || allText(node) === text);
}
async function press(tree, text) {
  const target = button(tree, text);
  assert.ok(target, `Missing button: ${text}`);
  assert.ok(!target.props.disabled, `Disabled button: ${text}`);
  await act(async () => { await target.props.onPress(); });
}
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function environmentHarness(overrides = {}) {
  const h = harness(overrides);
  const tokens = h.load('theme.ts').visualEnvironments.depth;
  const preference = { mode: 'manual', manualTheme: 'depth' };
  const state = { tokens, savedPreference: preference, autoResolvedEnvironment: 'depth', loading: false, error: null, previewPreference() {}, cancelPreview() {}, confirmPreference: async () => {}, retryLoad() {} };
  const hook = { useVisualEnvironment: () => state };
  for (const prefix of ['../context/', '../../../context/']) h.mocks[`${prefix}VisualEnvironmentContext`] = hook;
  return { ...h, state };
}

test('tab bar reserves gesture/three-button insets and scaled labels; safe-area ownership stays separate', async () => {
  const h = environmentHarness();
  let metrics = { bottom: 0, fontScale: 1 };
  h.native.useWindowDimensions = () => ({ width: 360, height: 640, fontScale: metrics.fontScale });
  h.mocks['react-native-safe-area-context'].useSafeAreaInsets = () => ({ top: 48, bottom: metrics.bottom, left: 0, right: 0 });
  const Tabs = h.load('app/(app)/(tabs)/_layout.tsx').default;
  for (const bottom of [0, 24, 48]) {
    for (const fontScale of [1, 1.3, 2]) {
      metrics = { bottom, fontScale };
      const tree = await render(React.createElement(Tabs));
      const options = tree.root.findByType('Tabs').props.screenOptions;
      assert.ok(options.tabBarStyle.height >= 72 + bottom);
      assert.equal(options.tabBarStyle.paddingBottom, 8 + bottom);
      assert.equal(options.tabBarHideOnKeyboard, true);
      assert.deepEqual(tree.root.findAllByType('TabScreen').map((node) => node.props.name), ['index', 'clarity-check', 'mentor', 'account']);
      await unmount(tree);
    }
  }
  const { ScreenSafeArea } = h.load('components/ScreenSafeArea.tsx');
  const scene = await render(React.createElement(ScreenSafeArea, { dark: true, hasTabBar: true }));
  assert.deepEqual(scene.root.findByType('SafeAreaView').props.edges, ['top', 'left', 'right']);
  assert.equal(h.statusStyles.at(-1), 'light');
  await act(async () => scene.update(React.createElement(ScreenSafeArea, { dark: false })));
  assert.deepEqual(scene.root.findByType('SafeAreaView').props.edges, ['top', 'left', 'right', 'bottom']);
  assert.equal(h.statusStyles.at(-1), 'dark');
  await unmount(scene);
});

test('Begin again preserves analytics and clears only local answers; retakes never write focus/onboarding/preferences', async () => {
  const events = [];
  const h = environmentHarness({ '../lib/analyticsEvents': { logLaunchEvent: (name) => events.push(name) } });
  const writes = [];
  h.mocks['../context/AuthContext'] = { useAuth: () => ({ signOut() {} }) };
  h.mocks['../context/OnboardingContext'] = { useOnboarding: () => ({ onboarding: { status: 'complete' }, refresh: async () => { writes.push('refresh'); } }) };
  h.mocks['../lib/api'] = {
    saveOnboardingDraft: async () => writes.push('draft'),
    initializeCompanionFocusAreas: async () => writes.push('focus'),
    completeOnboarding: async () => writes.push('complete'),
    submitClarityCheck: async (body) => {
      writes.push(body);
      return { submissionId: 'qa-result', scores: { totalScore: 12 }, identityType: 'Visionary', resultSummary: 'Saved', nextStep: 'Continue' };
    },
  };
  const { ClarityCheckFlow } = h.load('components/ClarityCheckFlow.tsx');
  const tree = await render(React.createElement(ClarityCheckFlow, { mode: 'retake' }));
  await press(tree, 'Begin again');
  await press(tree, '4 out of 5');
  await press(tree, 'Go back');
  assert.equal(button(tree, '4 out of 5').props.accessibilityState.selected, true);
  await press(tree, 'Go back');
  await press(tree, 'Begin again');
  assert.equal(button(tree, '4 out of 5').props.accessibilityState.selected, false);
  assert.deepEqual(writes, []);
  assert.deepEqual(events, ['clarity_check_start']);
  const { CLARITY_QUESTIONS, IDENTITY_QUESTIONS } = h.load('lib/onboarding.ts');
  for (const _ of CLARITY_QUESTIONS) await press(tree, '3 out of 5');
  for (const question of IDENTITY_QUESTIONS) await press(tree, `A${question.options.A}`);
  assert.equal(writes.length, 1);
  assert.equal(writes[0].onboarding, false);
  assert.deepEqual(Object.keys(writes[0]).sort(), ['identityResponses', 'onboarding', 'responses']);
  await press(tree, 'Return to Account');
  assert.ok(button(tree, 'Begin again'));
  await press(tree, 'Begin again');
  assert.equal(button(tree, '3 out of 5').props.accessibilityState.selected, false);
  assert.equal(writes.length, 1);
  assert.deepEqual(events, ['clarity_check_start', 'clarity_check_complete']);
  await unmount(tree);
});

test('environment selection locks during save and reports failed loads instead of claiming persistence', async () => {
  const h = environmentHarness();
  const pending = deferred();
  const previews = [];
  h.state.previewPreference = (preference) => previews.push(preference);
  h.state.confirmPreference = () => pending.promise;
  const { VisualEnvironmentPicker } = h.load('components/VisualEnvironmentPicker.tsx');
  const tree = await render(React.createElement(VisualEnvironmentPicker));
  const radios = () => tree.root.findAllByType('Pressable').filter((node) => node.props.accessibilityRole === 'radio');
  await act(async () => radios()[2].props.onPress());
  let saving;
  await act(async () => { saving = button(tree, 'Use this visual environment').props.onPress(); });
  assert.ok(radios().every((node) => node.props.disabled));
  await act(async () => radios()[3].props.onPress());
  assert.equal(previews.length, 1);
  await act(async () => { pending.reject(new Error('Save failed')); await saving; });
  assert.match(allText(tree.root), /Save failed/);
  assert.equal(h.state.savedPreference.manualTheme, 'depth');
  h.state.error = 'Offline';
  await act(async () => tree.update(React.createElement(VisualEnvironmentPicker)));
  assert.match(allText(tree.root), /Environment unavailable/);
  assert.ok(radios().every((node) => node.props.disabled));
  assert.ok(button(tree, 'Try again'));
  await unmount(tree);
});

test('saved environments survive provider remount; previews and failed saves do not change stored profile', async () => {
  const h = harness();
  let profile = { visualEnvironmentPreference: { mode: 'manual', manualTheme: 'depth' }, timezone: 'UTC', focusAreas: ['Keep focus'], identityAnchor: 'Keep identity' };
  let fail = false;
  let user = { uid: 'qa-user' };
  const pending = deferred();
  let hold = false;
  h.mocks['./AuthContext'] = { useAuth: () => ({ user, loading: false }) };
  h.mocks['../lib/api'] = {
    getCompanionProfile: async () => structuredClone(profile),
    updateVisualEnvironmentPreference: async (preference) => {
      if (fail) throw new Error('Offline');
      if (hold) return pending.promise;
      profile = { ...profile, visualEnvironmentPreference: preference };
      return structuredClone(profile);
    },
    updateCompanionTimezone: async () => profile,
  };
  const { VisualEnvironmentProvider, useVisualEnvironment } = h.load('context/VisualEnvironmentContext.tsx');
  let context;
  function Probe() { context = useVisualEnvironment(); return null; }
  const element = () => React.createElement(VisualEnvironmentProvider, null, React.createElement(Probe));
  let tree = await render(element());
  await act(async () => context.previewPreference({ mode: 'manual', manualTheme: 'warmth' }));
  assert.equal(context.resolvedEnvironment, 'warmth');
  assert.equal(profile.visualEnvironmentPreference.manualTheme, 'depth');
  await act(async () => context.cancelPreview());
  assert.equal(context.resolvedEnvironment, 'depth');
  await act(async () => context.confirmPreference({ mode: 'manual', manualTheme: 'renewal' }));
  await unmount(tree);
  tree = await render(element());
  assert.equal(context.savedPreference.manualTheme, 'renewal');
  assert.deepEqual(profile.focusAreas, ['Keep focus']);
  assert.equal(profile.identityAnchor, 'Keep identity');
  assert.equal(context.savedTimezone, 'UTC');
  fail = true;
  await act(async () => {
    await assert.rejects(context.confirmPreference({ mode: 'manual', manualTheme: 'warmth' }), /Offline/);
  });
  assert.equal(context.savedPreference.manualTheme, 'renewal');
  fail = false;
  hold = true;
  let saving;
  await act(async () => { saving = context.confirmPreference({ mode: 'manual', manualTheme: 'warmth' }); });
  user = null;
  await act(async () => tree.update(element()));
  await act(async () => {
    pending.resolve({ ...profile, visualEnvironmentPreference: { mode: 'manual', manualTheme: 'warmth' } });
    await saving;
  });
  assert.equal(context.savedPreference.manualTheme, 'depth');
  await unmount(tree);
});

test('verification offers resend, handles throttling, and refreshes verified status without sending on mount', async () => {
  const h = environmentHarness();
  let sends = 0;
  let throttle = false;
  const user = { uid: 'qa-user', emailVerified: false };
  h.mocks['firebase/auth'] = {
    reload: async () => {},
    sendEmailVerification: async () => { sends++; if (throttle) throw { code: 'auth/too-many-requests' }; },
  };
  const { EmailVerificationControls } = h.load('components/EmailVerificationControls.tsx');
  const tree = await render(React.createElement(EmailVerificationControls, { user }));
  assert.equal(sends, 0);
  await press(tree, 'Send verification email');
  assert.equal(sends, 1);
  assert.ok(button(tree, 'Resend verification email'));
  throttle = true;
  await press(tree, 'Resend verification email');
  assert.match(allText(tree.root), /wait a few minutes/);
  await press(tree, 'I’ve verified my email');
  assert.match(allText(tree.root), /not verified yet/);
  user.emailVerified = true;
  await act(async () => { for (const listener of h.appListeners) listener('active'); });
  assert.equal(allText(tree.root), 'Verified');
  assert.equal(sends, 2);
  await unmount(tree);
});

test('Compass follows new messages but preserves scroll position while reading older history', async () => {
  const h = environmentHarness();
  h.mocks['../../../lib/api'] = {
    getConversations: async () => [{ id: 'history', title: 'Earlier conversation' }],
    getConversation: async () => [{ id: 'first', role: 'assistant', content: 'First message' }],
    sendMentorMessage: async () => ({ conversationId: 'history', response: 'Reply', responseMode: 'balanced' }),
  };
  h.mocks['../../../components/ConversationList'] = { ConversationList: 'ConversationList' };
  h.mocks['../../../components/MessageBubble'] = { MessageBubble: 'MessageBubble' };
  const Mentor = h.load('app/(app)/(tabs)/mentor.tsx').default;
  const tree = await render(React.createElement(Mentor));
  const list = () => tree.root.findByType('FlatList');
  assert.equal(list().props.removeClippedSubviews, false);
  assert.equal(tree.root.findByType('KeyboardAvoidingView').props.behavior, 'height');
  assert.equal(tree.root.findByType('KeyboardAvoidingView').props.keyboardVerticalOffset, 24);
  assert.equal(tree.root.findByType('TextInput').props.accessibilityLabel, 'Message to Compass');
  assert.ok(!list().findAllByType('TextInput').length);
  list().props.onContentSizeChange();
  assert.equal(h.scrolls.length, 1);
  list().props.onScroll({ nativeEvent: { contentOffset: { y: 0 }, contentSize: { height: 1200 }, layoutMeasurement: { height: 300 } } });
  list().props.onContentSizeChange();
  list().props.onLayout();
  assert.equal(h.scrolls.length, 1);
  await act(async () => tree.root.findByType('TextInput').props.onChangeText('Test message'));
  await press(tree, 'Send message');
  list().props.onContentSizeChange();
  assert.equal(h.scrolls.length, 2);
  assert.deepEqual(list().props.data.map((message) => message.content), ['First message', 'Test message', 'Reply']);
  assert.equal(tree.root.findByType('TextInput').props.value, '');
  await unmount(tree);
});

test('secondary and disabled text meets 4.5:1 contrast on the light card surfaces', () => {
  const h = harness();
  const { theme } = h.load('theme.ts');
  const luminance = (hex) => {
    const channels = hex.slice(1).match(/../g).map((part) => parseInt(part, 16) / 255)
      .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);
  for (const surface of ['#FFFFFF', '#F5F7FA', '#E7E3FB', '#E7F0DE', '#FBE0D8']) {
    assert.ok(contrast(theme.colors.muted, surface) >= 4.5, `Secondary text on ${surface}`);
  }
  assert.ok(contrast(theme.colors.deepIndigo, theme.colors.line) >= 4.5, 'Environment in use');
});

function passwordInput(tree, label) {
  return tree.root.findAllByType('TextInput').find((node) => node.props.accessibilityLabel === label);
}
function assertPasswordConfiguration(input, purpose) {
  assert.equal(input.props.autoCapitalize, 'none');
  assert.equal(input.props.autoCorrect, false);
  assert.equal(input.props.autoComplete, purpose === 'new' ? 'new-password' : 'current-password');
  assert.equal(input.props.importantForAutofill, 'yes');
  assert.equal(input.props.secureTextEntry, true);
}

test('Create Account independently shows both passwords and submits exact matching credentials', async () => {
  const h = harness();
  const calls = [];
  h.mocks['../context/AuthContext'] = { useAuth: () => ({ user: null, loading: false, createAccount: async (...args) => calls.push(args) }) };
  const Screen = h.load('app/create-account.tsx').default;
  const tree = await render(React.createElement(Screen));
  for (const label of ['Password', 'Confirm password']) assertPasswordConfiguration(passwordInput(tree, label), 'new');
  const credential = 'lowerCASE ! 123';
  await act(async () => {
    passwordInput(tree, 'Email').props.onChangeText(' qa@example.com ');
    passwordInput(tree, 'Password').props.onChangeText(credential);
    passwordInput(tree, 'Confirm password').props.onChangeText('different');
  });
  assert.equal(button(tree, 'Create Account').props.disabled, true);
  await press(tree, 'Show password');
  assert.equal(passwordInput(tree, 'Password').props.secureTextEntry, false);
  assert.equal(passwordInput(tree, 'Confirm password').props.secureTextEntry, true);
  await press(tree, 'Show confirm password');
  assert.equal(passwordInput(tree, 'Confirm password').props.secureTextEntry, false);
  await press(tree, 'Hide password');
  assert.equal(passwordInput(tree, 'Confirm password').props.secureTextEntry, false);
  await act(async () => passwordInput(tree, 'Confirm password').props.onChangeText(credential));
  await press(tree, 'Hide confirm password');
  assert.equal(passwordInput(tree, 'Password').props.value, credential);
  assert.equal(passwordInput(tree, 'Confirm password').props.value, credential);
  await press(tree, 'Create Account');
  assert.deepEqual(calls, [['qa@example.com', credential]]);
  await unmount(tree);
});

test('Sign In retains exact typed/autofilled credentials through visibility toggles', async () => {
  const h = harness();
  const calls = [];
  h.mocks['../context/AuthContext'] = { useAuth: () => ({ user: null, loading: false, signIn: async (...args) => calls.push(args) }) };
  const Screen = h.load('app/sign-in.tsx').default;
  const tree = await render(React.createElement(Screen));
  assertPasswordConfiguration(passwordInput(tree, 'Password'), 'current');
  assert.equal(passwordInput(tree, 'Email').props.autoComplete, 'username');
  const credential = 'lowerCASE ! 123';
  await act(async () => {
    passwordInput(tree, 'Email').props.onChangeText('qa@example.com');
    passwordInput(tree, 'Password').props.onChangeText(credential);
  });
  await press(tree, 'Show password');
  assert.equal(passwordInput(tree, 'Password').props.secureTextEntry, false);
  assert.equal(passwordInput(tree, 'Password').props.autoComplete, 'current-password');
  await press(tree, 'Hide password');
  await press(tree, 'Sign In');
  assert.deepEqual(calls, [['qa@example.com', credential]]);
  await unmount(tree);
});

test('deletion password supports visibility/autofill and resets when the confirmation is reopened', async () => {
  const h = environmentHarness();
  const calls = [];
  h.mocks['../../../context/AuthContext'] = { useAuth: () => ({
    user: { email: 'qa@example.com', emailVerified: true, providerData: [{ providerId: 'password' }] },
    deleteAccount: async (password) => { calls.push(password); throw new Error('Controlled test failure'); },
    signOut: async () => {},
  }) };
  h.mocks['../../../lib/api'] = { getCompanionProfile: async () => ({ focusAreas: [] }) };
  h.mocks['../../../components/EmailVerificationControls'] = { EmailVerificationControls: 'Verification' };
  h.mocks['../../../components/VisualEnvironmentPicker'] = { VisualEnvironmentPicker: 'EnvironmentPicker' };
  const Screen = h.load('app/(app)/(tabs)/account.tsx').default;
  const tree = await render(React.createElement(Screen));
  await press(tree, 'Delete account');
  const label = 'Password to confirm account deletion';
  assertPasswordConfiguration(passwordInput(tree, label), 'current');
  await act(async () => passwordInput(tree, label).props.onChangeText('exact Password!'));
  await press(tree, 'Show password to confirm account deletion');
  assert.equal(passwordInput(tree, label).props.secureTextEntry, false);
  await press(tree, 'Permanently delete account');
  assert.deepEqual(calls, ['exact Password!']);
  await press(tree, 'Cancel account deletion');
  await press(tree, 'Delete account');
  assert.equal(passwordInput(tree, label).props.value, '');
  assert.equal(passwordInput(tree, label).props.secureTextEntry, true);
  await unmount(tree);
});

test('small-screen keyboard geometry reveals Confirm Password on opening and switching focus', async () => {
  // Native measurement doubles exercise the real focus/keyboard/layout callbacks.
  // They cannot certify Android IME rendering or password-manager integration.
  const h = harness();
  h.mocks['../context/AuthContext'] = { useAuth: () => ({ user: null, loading: false, createAccount: async () => {} }) };
  const Screen = h.load('app/create-account.tsx').default;
  const geometry = { top: 24, height: 592, keyboardTop: 360, scrollY: 0, fieldHeight: 112, confirmTop: 950 };
  const scrollCalls = [];
  let tree;
  tree = await render(React.createElement(Screen), { createNodeMock: (element) => {
    if (element.type === 'ScrollView') return {
      getNativeScrollRef: () => ({ measureInWindow: (callback) => callback(0, geometry.top, 360, geometry.height) }),
      scrollTo: ({ y }) => {
        geometry.scrollY = y;
        scrollCalls.push(y);
        tree.root.findByType('ScrollView').props.onScroll({ nativeEvent: { contentOffset: { y } } });
      },
    };
    if (element.type === 'View' && element.props.collapsable === false) return {
      measureInWindow: (callback) => {
        const confirm = element.props.children[0].props.accessibilityLabel === 'Confirm password';
        callback(0, (confirm ? geometry.confirmTop : 780) - geometry.scrollY, 260, geometry.fieldHeight);
      },
    };
    return null;
  } });
  const scroll = tree.root.findByType('ScrollView');
  assert.equal(scroll.props.keyboardShouldPersistTaps, 'handled');
  assert.equal(tree.root.findByType('KeyboardAvoidingView').props.behavior, 'height');
  assert.ok(button(tree, 'Create Account').findAllByType('Text').length);
  assert.ok(scroll.findAllByType('Pressable').includes(button(tree, 'Create Account')));
  await act(async () => passwordInput(tree, 'Confirm password').props.onFocus({}));
  assert.ok(scrollCalls.length > 0); // focus also reveals fields before the IME opens
  geometry.height = 336;
  // Android may resize without emitting keyboardDidShow: layout alone must work.
  await act(async () => scroll.props.onLayout({}));
  assert.ok(geometry.confirmTop - geometry.scrollY + geometry.fieldHeight <= 348);
  await act(async () => {
    for (const listener of h.keyboardListeners.get('keyboardDidShow')) listener({ endCoordinates: { screenY: geometry.keyboardTop } });
  });
  const assertVisible = (fieldTop) => {
    assert.ok(fieldTop - geometry.scrollY >= geometry.top + 12);
    assert.ok(fieldTop - geometry.scrollY + geometry.fieldHeight <= geometry.keyboardTop - 12);
  };
  assertVisible(geometry.confirmTop);
  await act(async () => passwordInput(tree, 'Password').props.onFocus({}));
  assertVisible(780);
  await act(async () => passwordInput(tree, 'Confirm password').props.onFocus({}));
  assertVisible(geometry.confirmTop);
  geometry.keyboardTop = 280; // a larger keyboard on the same small screen
  geometry.height = 256;
  geometry.fieldHeight = 180; // increased text scale
  await act(async () => {
    for (const listener of h.keyboardListeners.get('keyboardDidShow')) listener({ endCoordinates: { screenY: geometry.keyboardTop } });
    scroll.props.onLayout({});
  });
  assertVisible(geometry.confirmTop);
  const beforeBlur = scrollCalls.length;
  await act(async () => passwordInput(tree, 'Confirm password').props.onBlur({}));
  await act(async () => scroll.props.onLayout({}));
  assert.equal(scrollCalls.length, beforeBlur);
  await unmount(tree);
  assert.equal(h.keyboardListeners.get('keyboardDidShow').size, 0);
  assert.equal(h.keyboardListeners.get('keyboardDidHide').size, 0);
});

test('approved copy, product/experience/guide hierarchy and existing emblem remain consistent', async () => {
  const h = environmentHarness();
  h.mocks['../context/AuthContext'] = { useAuth: () => ({ user: null, loading: false }) };
  const Welcome = h.load('app/welcome.tsx').default;
  const tree = await render(React.createElement(Welcome));
  const text = allText(tree.root);
  for (const approved of [
    'Welcome, Beautiful Soul',
    'A grounded companion for finding clarity, building what supports you, and moving with intention.',
    'Begin where you are.',
    'Soul → Systems → AI',
  ]) assert.ok(text.includes(approved), approved);
  assert.ok(!text.includes('iPurpose Compass'));
  const approvedImage = '../../assets/release/adaptive-icon-foreground.png';
  assert.equal(tree.root.findByType('Image').props.source, approvedImage);
  assert.equal(tree.root.findByType('ImageBackground').props.source, '../../assets/brand/welcome-atmosphere.jpg');
  await unmount(tree);
  const { BrandHeader } = h.load('components/BrandHeader.tsx');
  for (const guidedExperience of [false, true]) {
    const header = await render(React.createElement(BrandHeader, { guidedExperience }));
    assert.equal(allText(header.root), guidedExperience ? 'iPurpose Compass' : 'iPurpose');
    assert.equal(header.root.findByType('Image').props.source, approvedImage);
    await unmount(header);
  }
  const { MessageBubble } = h.load('components/MessageBubble.tsx');
  const message = await render(React.createElement(MessageBubble, { message: { role: 'assistant', content: 'A response' } }));
  assert.ok(allText(message.root).startsWith('Compass'));
  await unmount(message);
  const src = path.resolve(__dirname, '../src');
  function checkDirectory(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const filename = path.join(directory, entry.name);
      if (entry.isDirectory()) checkDirectory(filename);
      else if (/\.tsx?$/.test(filename)) {
        const source = fs.readFileSync(filename, 'utf8');
        assert.doesNotMatch(source, /\bnorth\b|iPurpose Mentor|assets\/brand\/compass-logo\.png/i, filename);
      }
    }
  }
  checkDirectory(src);

});


test('Android QA config composes with native Firebase enabled and disabled and fails closed without its file', () => {
  const configure = require('../app.config.js');
  const config = require('../app.json').expo;
  const keys = ['EXPO_PUBLIC_LAUNCH_ANALYTICS_ENABLED', 'GOOGLE_SERVICES_JSON', 'GOOGLE_SERVICE_INFO_PLIST', 'EAS_BUILD_PLATFORM'];
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  try {
    process.env.EAS_BUILD_PLATFORM = 'android';
    process.env.EXPO_PUBLIC_LAUNCH_ANALYTICS_ENABLED = 'true';
    process.env.GOOGLE_SERVICES_JSON = '/test-only/google-services.json';
    delete process.env.GOOGLE_SERVICE_INFO_PLIST;
    const enabled = configure({ config });
    assert.equal(enabled.android.package, 'com.ipurpose.mobile');
    assert.ok(enabled.android.versionCode >= 5);
    assert.equal(enabled.android.softwareKeyboardLayoutMode, 'resize');
    assert.equal(enabled.android.googleServicesFile, '/test-only/google-services.json');
    assert.equal(enabled.extra.launchAnalyticsEnabled, true);
    assert.ok(enabled.android.blockedPermissions.includes('com.google.android.gms.permission.AD_ID'));
    const plugins = enabled.plugins.map((plugin) => Array.isArray(plugin) ? plugin[0] : plugin);
    for (const plugin of ['expo-router', 'expo-font', 'expo-splash-screen', '@react-native-firebase/app', '@react-native-firebase/analytics', 'expo-build-properties']) assert.ok(plugins.includes(plugin));
    delete process.env.GOOGLE_SERVICES_JSON;
    assert.throws(() => configure({ config }), /requires native Firebase configuration/);
    process.env.EXPO_PUBLIC_LAUNCH_ANALYTICS_ENABLED = 'false';
    const disabled = configure({ config });
    assert.equal(disabled.extra.launchAnalyticsEnabled, false);
    assert.equal(disabled.android.googleServicesFile, undefined);
    assert.equal(disabled.android.softwareKeyboardLayoutMode, 'resize');
    assert.deepEqual(disabled.plugins, config.plugins);
  } finally {
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
});

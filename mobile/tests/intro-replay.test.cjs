const assert = require('node:assert/strict');
const { test } = require('node:test');
const { harness, React, act, render, press } = require('./helpers/native-harness.cjs');

function setup(kind = 'compass', label = 'Compass') {
  const h = harness();
  const saved = new Map();
  const profiles = new Set();
  const writes = [];
  const flag = h.load('lib/introVideos.ts').INTRO_FLAGS[kind];
  const state = { uid: 'first-account', failWrite: false };
  h.mocks['@react-native-async-storage/async-storage'] = {
    getItem: async key => saved.get(key) ?? null,
    setItem: async (key, value) => { saved.set(key, value); },
  };
  h.mocks['../context/AuthContext'] = { useAuth: () => ({ user: { uid: state.uid } }) };
  h.mocks['./IntroVideo'] = {
    IntroVideo: 'IntroVideo',
    INTRO_VIDEOS: { [kind]: { label } },
  };
  h.mocks['../lib/api'] = {
    getCompanionProfile: async uid => ({ introVideos: { [flag]: profiles.has(uid) } }),
    markIntroCompleted: async (kind, uid) => {
      writes.push({ kind, uid });
      if (state.failWrite) throw new Error('Network unavailable');
      profiles.add(uid);
      return { introVideos: { [flag]: true } };
    },
  };
  const { IntroReplay } = h.load('components/IntroReplay.tsx');
  const screen = () => React.createElement(IntroReplay,
    { kind, returnLabel: `Return to ${label}`, autoShowOnFirstVisit: true });
  return { screen, profiles, state, writes };
}

for (const [kind, label] of [['compass', 'Compass'], ['clarity', 'Clarity Check']]) {
  test(`${label} shows once even when dismissed and saving to the account fails`, async () => {
    const { screen, state, writes } = setup(kind, label);
    state.failWrite = true;
    const first = await render(screen());
    assert.equal(first.root.findByType('IntroVideo').props.replay, false);
    assert.deepEqual(writes, [{ kind, uid: state.uid }]);
    await act(async () => first.root.findByType('Modal').props.onRequestClose());
    assert.equal(first.root.findByType('Modal').props.visible, false);
    await act(async () => first.unmount());

    state.failWrite = false;
    const returning = await render(screen());
    assert.equal(returning.root.findByType('Modal').props.visible, false);
    assert.equal(writes.length, 2, 'The pending account update is retried without showing the video.');
    await press(returning, `About ${label}`);
    const replay = returning.root.findByType('IntroVideo');
    assert.equal(replay.props.replay, true);
    assert.equal(replay.props.returnLabel, `Return to ${label}`);
    await act(async () => replay.props.onContinue());
    assert.equal(returning.root.findByType('Modal').props.visible, false);
    assert.equal(writes.length, 2);
    await act(async () => returning.unmount());

    const synced = await render(screen());
    assert.equal(synced.root.findByType('Modal').props.visible, false);
    assert.equal(writes.length, 2);
    await act(async () => synced.unmount());
  });
}

test('Compass respects an account that already saw the intro and treats another account independently', async () => {
  const { screen, profiles, state, writes } = setup();
  profiles.add(state.uid);
  const tree = await render(screen());
  assert.equal(tree.root.findByType('Modal').props.visible, false);
  assert.deepEqual(writes, []);
  state.uid = 'second-account';
  await act(async () => tree.update(screen()));
  assert.equal(tree.root.findByType('IntroVideo').props.replay, false);
  assert.deepEqual(writes, [{ kind: 'compass', uid: 'second-account' }]);
  await act(async () => tree.unmount());
});

test('Clarity Check respects an intro already completed during signup', async () => {
  const { screen, profiles, state, writes } = setup('clarity', 'Clarity Check');
  profiles.add(state.uid);
  const tree = await render(screen());
  assert.equal(tree.root.findByType('Modal').props.visible, false);
  await press(tree, 'About Clarity Check');
  assert.equal(tree.root.findByType('IntroVideo').props.replay, true);
  assert.deepEqual(writes, []);
  await act(async () => tree.unmount());
});

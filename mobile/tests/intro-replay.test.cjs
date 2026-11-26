const assert = require('node:assert/strict');
const { test } = require('node:test');
const { harness, React, act, render, press } = require('./helpers/native-harness.cjs');

const labels = { compass: 'Compass', clarity: 'Clarity Check', purpose: 'Purpose' };

function setup() {
  const h = harness();
  const saved = new Map();
  const profiles = new Map();
  const writes = [];
  const { INTRO_FLAGS } = h.load('lib/introVideos.ts');
  const state = { uid: 'first-account', failWrite: false };
  const markSeen = (kind, uid) => {
    const introVideos = { ...profiles.get(uid), [INTRO_FLAGS[kind]]: true };
    profiles.set(uid, introVideos);
    return introVideos;
  };
  h.mocks['@react-native-async-storage/async-storage'] = {
    getItem: async key => saved.get(key) ?? null,
    setItem: async (key, value) => { saved.set(key, value); },
  };
  h.mocks['../context/AuthContext'] = { useAuth: () => ({ user: { uid: state.uid } }) };
  h.mocks['../../context/AuthContext'] = h.mocks['../context/AuthContext'];
  h.mocks['./IntroVideo'] = {
    IntroVideo: 'IntroVideo',
    INTRO_VIDEOS: Object.fromEntries(Object.entries(labels).map(([kind, label]) => [kind, { label }])),
  };
  h.mocks['../../components/IntroVideo'] = h.mocks['./IntroVideo'];
  const api = {
    getCompanionProfile: async uid => ({ introVideos: profiles.get(uid) ?? {} }),
    markIntroCompleted: async (kind, uid) => {
      writes.push({ kind, uid });
      if (state.failWrite) throw new Error('Network unavailable');
      return { introVideos: markSeen(kind, uid) };
    },
  };
  h.mocks['../lib/api'] = api;
  h.mocks['../../lib/api'] = api;
  const { IntroReplay } = h.load('components/IntroReplay.tsx');
  const screen = kind => React.createElement(IntroReplay,
    { kind, returnLabel: `Return to ${labels[kind]}`, autoShowOnFirstVisit: true });
  return { h, screen, markSeen, state, writes };
}

for (const [kind, label] of Object.entries(labels)) {
  test(`${label} shows once even when dismissed and saving to the account fails`, async () => {
    const { screen, state, writes } = setup();
    state.failWrite = true;
    const first = await render(screen(kind));
    assert.equal(first.root.findByType('IntroVideo').props.replay, false);
    assert.deepEqual(writes, [{ kind, uid: state.uid }]);
    await act(async () => first.root.findByType('Modal').props.onRequestClose());
    assert.equal(first.root.findByType('Modal').props.visible, false);
    await act(async () => first.unmount());

    state.failWrite = false;
    const returning = await render(screen(kind));
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

    const synced = await render(screen(kind));
    assert.equal(synced.root.findByType('Modal').props.visible, false);
    assert.equal(writes.length, 2);
    await act(async () => synced.unmount());
  });
}

test('Compass respects an account that already saw the intro and treats another account independently', async () => {
  const { screen, markSeen, state, writes } = setup();
  markSeen('compass', state.uid);
  const tree = await render(screen('compass'));
  assert.equal(tree.root.findByType('Modal').props.visible, false);
  assert.deepEqual(writes, []);
  state.uid = 'second-account';
  await act(async () => tree.update(screen('compass')));
  assert.equal(tree.root.findByType('IntroVideo').props.replay, false);
  assert.deepEqual(writes, [{ kind: 'compass', uid: 'second-account' }]);
  await act(async () => tree.unmount());
});

for (const [chosen, other] of [['clarity', 'purpose'], ['purpose', 'clarity']]) {
  test(`Choosing ${labels[chosen]} during signup leaves ${labels[other]} and Compass ready for their first visits`, async () => {
    const { h, screen, state, writes } = setup();
    const advances = [];
    h.mocks['../../context/FirstRunContext'] = {
      useFirstRun: () => ({ state: { stage: 'intro', choice: chosen }, advance: async next => advances.push(next) }),
    };
    const StartingIntro = h.load('app/(app)/starting-intro.tsx').default;
    const signup = await render(React.createElement(StartingIntro));
    const initialVideo = signup.root.findByType('IntroVideo');
    assert.equal(initialVideo.props.kind, chosen);
    await act(async () => initialVideo.props.onContinue());
    assert.deepEqual(advances, [{ stage: 'experience', choice: chosen }]);
    await act(async () => signup.unmount());

    const chosenTab = await render(screen(chosen));
    assert.equal(chosenTab.root.findByType('Modal').props.visible, false);
    await act(async () => chosenTab.unmount());

    for (const kind of [other, 'compass']) {
      const first = await render(screen(kind));
      const video = first.root.findByType('IntroVideo');
      assert.equal(video.props.kind, kind);
      assert.equal(video.props.replay, false);
      await act(async () => video.props.onContinue());
      await act(async () => first.unmount());

      const returning = await render(screen(kind));
      assert.equal(returning.root.findByType('Modal').props.visible, false);
      await act(async () => returning.unmount());
    }
    assert.deepEqual(writes, [chosen, other, 'compass'].map(kind => ({ kind, uid: state.uid })));
  });
}

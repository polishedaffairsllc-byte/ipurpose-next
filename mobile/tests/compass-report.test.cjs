const assert = require('node:assert/strict');
const { test } = require('node:test');
const { harness, React, render, press, button, text, act } = require('./helpers/native-harness.cjs');

function apiHarness() {
  const h = harness();
  h.mocks['./analyticsEvents'] = { logLaunchEvent: () => {} };
  h.mocks['./firebase'] = { auth: { currentUser: { uid: 'owner-a', getIdToken: async () => 'dummy-token' } } };
  return { h, api: h.load('lib/api.ts') };
}

test('Compass report API posts only canonical identifiers, selected reason and optional details using Firebase bearer', async () => {
  const { h, api } = apiHarness();
  const calls = [];
  h.mocks.fetch = async (url, init) => {
    calls.push({ url, init });
    return Response.json({ reported: true, reportId: 'report-1' });
  };
  const outcome = await api.reportAiResponse({
    conversationId: 'conversation-1',
    messageId: 'message-1',
    reason: 'inaccurate',
    details: '   Incorrect answer   ',
  });
  assert.deepEqual(outcome, { reported: true, reportId: 'report-1' });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://ipurposesoul.com/api/ai/reports');
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.headers.get('Authorization'), 'Bearer dummy-token');
  assert.deepEqual(JSON.parse(calls[0].init.body), {
    conversationId: 'conversation-1',
    messageId: 'message-1',
    reason: 'inaccurate',
    details: 'Incorrect answer',
  });
  assert.doesNotMatch(calls[0].init.body, /owner-a|content|password/i);
});

test('Compass report API preserves the server rejection and can retry without creating provider requests', async () => {
  const { h, api } = apiHarness();
  const urls = []; let failed = true;
  h.mocks.fetch = async (url) => {
    urls.push(url);
    return failed
      ? Response.json({ error: 'AI response not found in your conversation.' }, { status: 404 })
      : Response.json({ reported: true, reportId: 'report-1' });
  };
  const payload = { conversationId: 'owned-conversation', messageId: 'saved-response', reason: 'unsafe' };
  await assert.rejects(api.reportAiResponse(payload), /not found.*404/i);
  failed = false;
  assert.deepEqual(await api.reportAiResponse(payload), { reported: true, reportId: 'report-1' });
  assert.deepEqual(urls, [
    'https://ipurposesoul.com/api/ai/reports',
    'https://ipurposesoul.com/api/ai/reports',
  ]);
});

test('Compass report modal requires a selected reason and keeps details after failed save', async () => {
  const h = harness();
  const tokens = {
    surface: '#fff', surfaceBorder: '#ccc', accentStrong: '#4B4E6D',
    buttonBackground: '#4B4E6D', buttonText: '#fff',
  };
  h.mocks['../context/VisualEnvironmentContext'] = { useVisualEnvironment: () => ({ tokens }) };
  let shouldFail = true; const calls = [];
  const Modal = h.load('components/ReportResponseModal.tsx').ReportResponseModal;
  const tree = await render(React.createElement(Modal, {
    visible: true,
    onClose: () => {},
    onSubmit: async (reason, details) => {
      calls.push({ reason, details });
      if (shouldFail) throw new Error('Try again later');
    },
  }));
  assert.equal(button(tree, 'Submit report').props.disabled, true);
  await press(tree, 'Inaccurate or misleading');
  assert.equal(button(tree, 'Submit report').props.disabled, false);
  const input = tree.root.findAllByType('TextInput').find(n => n.props.accessibilityLabel === 'Report details');
  await act(async () => input.props.onChangeText('  Please check  '));
  await press(tree, 'Submit report');
  assert.match(text(tree.root), /Try again later/);
  assert.equal(tree.root.findAllByType('TextInput')[0].props.value, '  Please check  ');
  shouldFail = false;
  await press(tree, 'Submit report');
  assert.match(text(tree.root), /saved for iPurpose review/);
  assert.deepEqual(calls, [
    { reason: 'inaccurate', details: 'Please check' },
    { reason: 'inaccurate', details: 'Please check' },
  ]);
  await act(async () => tree.unmount());
});

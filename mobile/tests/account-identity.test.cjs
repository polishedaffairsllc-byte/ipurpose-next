const assert = require('node:assert/strict');
const { test } = require('node:test');
const { harness, React, render, act } = require('./helpers/native-harness.cjs');

test('Account saves a display name and shows an email change only after Firebase verifies it', async () => {
  const h = harness();
  const account = {
    uid: 'account',
    email: 'old@example.test',
    emailVerified: true,
    displayName: 'Old Name',
    providerData: [{ providerId: 'password' }],
  };
  let pendingEmail;
  let verifiedEmail;
  const calls = [];
  h.mocks['@react-native-async-storage/async-storage'] = {};
  h.mocks['../lib/firebase'] = { auth: { currentUser: account } };
  h.mocks['../lib/api'] = {};
  h.mocks['../lib/purposeStorage'] = {};
  h.mocks['firebase/auth'] = {
    onAuthStateChanged: (_auth, listener) => { listener(account); return () => {}; },
    updateProfile: async (user, edits) => { Object.assign(user, edits); },
    EmailAuthProvider: { credential: (email, password) => ({ email, password }) },
    reauthenticateWithCredential: async (_user, credential) => {
      assert.equal(credential.email, 'old@example.test');
      if (credential.password !== 'test-password') throw { code: 'auth/invalid-credential' };
      calls.push('password confirmed');
    },
    verifyBeforeUpdateEmail: async (_user, email) => {
      calls.push('verification sent');
      pendingEmail = email;
    },
    reload: async (user) => { if (verifiedEmail) user.email = verifiedEmail; },
  };
  const { AuthProvider, useAuth } = h.load('context/AuthContext.tsx');
  let session;
  function Probe() { session = useAuth(); return null; }
  const tree = await render(React.createElement(AuthProvider, null, React.createElement(Probe)));
  await act(async () => { await session.updateDisplayName('New Name'); });
  assert.equal(session.identity.displayName, 'New Name');

  await assert.rejects(session.requestEmailChange('new@example.test', 'wrong'), { code: 'auth/invalid-credential' });
  assert.deepEqual(calls, []);
  await act(async () => { await session.requestEmailChange('new@example.test', 'test-password'); });
  assert.deepEqual(calls, ['password confirmed', 'verification sent']);
  assert.equal(session.identity.email, 'old@example.test');

  verifiedEmail = pendingEmail;
  await act(async () => { await session.refreshIdentity(); });
  assert.equal(session.identity.email, 'new@example.test');
  await act(async () => tree.unmount());
});

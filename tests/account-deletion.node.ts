import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  getAccountDeletionPlan,
  isRecentAuthentication,
} from '../lib/accountDeletion';

test('account deletion requires a genuinely recent Firebase sign-in', () => {
  const now = 2_000_000;
  assert.equal(isRecentAuthentication(now - 60, now), true);
  assert.equal(isRecentAuthentication(now - 300, now), true);
  assert.equal(isRecentAuthentication(now - 301, now), false);
  assert.equal(isRecentAuthentication(now + 1, now), false);
  assert.equal(isRecentAuthentication(undefined, now), false);
});

test('account deletion plan covers mobile profile, Compass, onboarding, and legacy user data', () => {
  const plan = getAccountDeletionPlan('user-123', ' Person@Example.com ');
  const directCollections = new Set(plan.directDocuments.map((target) => target.collection));
  const queryCollections = new Set(plan.fieldQueries.map((target) => target.collection));

  for (const collection of [
    'users',
    'user-preferences',
    'identity_maps',
    'meaning_maps',
    'agency_maps',
    'rate-limits',
  ]) {
    assert.equal(directCollections.has(collection), true, `${collection} should be directly deleted`);
  }
  for (const collection of [
    'clarityCheckSubmissions',
    'workflowSystems',
    'conversation-sessions',
    'conversation-memory',
    'emailTasks',
    'leads',
  ]) {
    assert.equal(queryCollections.has(collection), true, `${collection} should be queried for deletion`);
  }
  assert.equal(
    plan.fieldQueries.some((target) => target.field === 'email' && target.value === 'person@example.com'),
    true
  );
  assert.deepEqual(
    plan.directDocuments.filter((target) => target.collection === 'lab_completion').map((target) => target.id),
    ['user-123_identity', 'user-123_meaning', 'user-123_agency']
  );
});

test('mobile deletion reauthenticates before the server removes data and auth', async () => {
  const [authSource, routeSource, accountSource] = await Promise.all([
    readFile(new URL('../mobile/src/context/AuthContext.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../app/api/account/route.ts', import.meta.url), 'utf8'),
    readFile(new URL('../mobile/src/app/(app)/(tabs)/account.tsx', import.meta.url), 'utf8'),
  ]);

  assert.match(authSource, /reauthenticateWithCredential/);
  assert.ok(authSource.indexOf('reauthenticateWithCredential') < authSource.indexOf('deleteIPurposeAccount()'));
  assert.match(
    routeSource,
    /await deleteAccountData\([\s\S]*await firebaseAdmin\.auth\(\)\.deleteUser/
  );
  assert.match(routeSource, /RECENT_AUTHENTICATION_REQUIRED/);
  assert.match(accountSource, /Delete account/);
  assert.match(accountSource, /cannot be undone/);
});

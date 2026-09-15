import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initializeApp, deleteApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { initializeApp as clientApp, deleteApp as deleteClient } from 'firebase/app';
import { getAuth as clientAuth, connectAuthEmulator, signInWithEmailAndPassword } from 'firebase/auth';
import { createMetricsService } from '../../src/job';
import { emptyPlatforms } from '../../src/model';
import type { Caller } from '../../src/lib/auth';
import { enrollNurture } from '../../../lib/launch-metrics/enrollNurture';

test('real Firestore/Auth emulators: immutable jobs, event correctness and administrator security', async t => {
  const projectId = 'demo-ipurpose-metrics';
  assert.match(process.env.FIRESTORE_EMULATOR_HOST || '', /^(127\.0\.0\.1|localhost):8181$/);
  assert.match(process.env.FIREBASE_AUTH_EMULATOR_HOST || '', /^(127\.0\.0\.1|localhost):9199$/);
  const app = initializeApp({ projectId });
  const db = getFirestore(app);
  const auth = getAuth(app);
  const rules = await initializeTestEnvironment({ projectId, firestore: { host: '127.0.0.1', port: 8181, rules: readFileSync('test/firestore.rules', 'utf8') } });
  const client = clientApp({ projectId, apiKey: 'demo-key' });
  const login = clientAuth(client);
  connectAuthEmulator(login, 'http://127.0.0.1:9199', { disableWarnings: true });
  const byPlatform = emptyPlatforms();
  byPlatform.Android = { first_open: 10, sign_up: 5, clarity_check_start: 4, clarity_check_complete: 2, email_signup: 0 };
  byPlatform.iOS.clarity_check_start = 3; // No completion: it must stay zero.
  byPlatform.web.sign_up = 100; // Must not inflate install→registration.
  let queries = 0;
  const fetchCounts = async () => { queries++; return { byPlatform, property: 'properties/514773870' }; };
  const deps = { db, fetchCounts, now: () => new Date('2026-09-15T00:00:00Z'), lookupUser: (uid: string) => auth.getUser(uid) };
  const service = createMetricsService(deps);
  const caller = async (email: string): Promise<Caller> => {
    const credential = await signInWithEmailAndPassword(login, email, 'Emulator-only-password1!');
    const token = await auth.verifyIdToken(await credential.user.getIdToken(true));
    return { uid: token.uid, token };
  };
  try {
    await rules.clearFirestore();
    await auth.createUser({ uid: 'metrics-admin', email: 'admin@example.test', password: 'Emulator-only-password1!' });
    await auth.setCustomUserClaims('metrics-admin', { admin: true });
    await auth.createUser({ uid: 'metrics-member', email: 'member@example.test', password: 'Emulator-only-password1!' });
    const admin = await caller('admin@example.test');
    const member = await caller('member@example.test');

    await t.test('non-admin and anonymous callers cannot read or manually trigger a job', async () => {
      for (const identity of [undefined, member, { ...member, token: { admin: 'true' } }]) {
        const code = identity ? 'permission-denied' : 'unauthenticated';
        await assert.rejects(service.read(identity), { code });
        await assert.rejects(service.manual(identity, {}), { code });
      }
      assert.equal(queries, 0);
    });

    await t.test('actual admin can run/read; a repeat preserves the exact existing document', async () => {
      assert.deepEqual(await service.manual(admin, {}), { skipped: false, weekEnding: '2026-09-13' });
      const original = (await service.read(admin))[0];
      assert.equal(original.counts.sign_up, 105);
      assert.equal(original.rates.installToRegistration, 50);
      assert.equal(original.counts.clarity_check_start, 7);
      assert.equal(original.counts.clarity_check_complete, 2);
      assert.equal(original.counts.email_signup, 0);
      assert.equal(original.byPlatform.iOS.clarity_check_complete, 0);
      assert.deepEqual(await service.manual(admin, {}), { skipped: true, weekEnding: '2026-09-13' });
      assert.equal(queries, 1);
      assert.deepEqual((await service.read(admin))[0], original);
    });

    await t.test('two real concurrent creates produce exactly one immutable snapshot', async () => {
      let release!: () => void;
      const gate = new Promise<void>(resolve => { release = resolve; });
      let arrivals = 0;
      const concurrent = createMetricsService({ ...deps, fetchCounts: async () => {
        if (++arrivals === 2) release();
        await gate;
        return { byPlatform, property: 'properties/514773870' };
      } });
      const results = await Promise.all([concurrent.run('2026-09-06'), concurrent.run('2026-09-06')]);
      assert.equal(results.filter(result => result.skipped).length, 1);
      assert.equal((await db.collection('analytics_weekly').get()).size, 2);
    });

    await t.test('future/incomplete weeks and malformed callable payloads do not query GA4', async () => {
      const before = queries;
      for (const payload of [[], '2026-09-13', { weekEnding: 1 }, { weekEnding: '2026-09-14' }, { weekEnding: '2026-09-20' }]) await assert.rejects(service.manual(admin, payload), { code: 'invalid-argument' });
      assert.equal(queries, before);
    });

    await t.test('revoked and disabled admins are denied even with an old admin token', async () => {
      await auth.setCustomUserClaims(admin.uid, {});
      await assert.rejects(service.read(admin), { code: 'permission-denied' });
      await assert.rejects(service.manual(admin, {}), { code: 'permission-denied' });
      await auth.setCustomUserClaims(admin.uid, { admin: true });
      await auth.updateUser(admin.uid, { disabled: true });
      await assert.rejects(service.read(admin), { code: 'permission-denied' });
      await auth.updateUser(admin.uid, { disabled: false });
    });

    await t.test('Firestore rules permit only admin reads and prohibit every client write', async () => {
      const adminDb = rules.authenticatedContext('metrics-admin', { admin: true }).firestore();
      const memberDb = rules.authenticatedContext('metrics-member').firestore();
      const anonDb = rules.unauthenticatedContext().firestore();
      await assertSucceeds(getDoc(doc(adminDb, 'analytics_weekly/2026-09-13')));
      for (const clientDb of [memberDb, anonDb]) await assertFails(getDoc(doc(clientDb, 'analytics_weekly/2026-09-13')));
      for (const clientDb of [adminDb, memberDb, anonDb]) {
        await assertFails(setDoc(doc(clientDb, 'analytics_weekly/2026-09-13'), { counts: {} }));
        await assertFails(setDoc(doc(clientDb, 'analytics_weekly/2026-08-30'), { counts: {} }));
        await assertFails(deleteDoc(doc(clientDb, 'analytics_weekly/2026-09-13')));
      }
    });

    await t.test('email subscription is credited only after a committed queue, with concurrent retries deduped', async () => {
      const input = { name: 'Emulator Test', email: 'queue@example.test', submissionId: 'lead-1', totalScore: 0 };
      const results = await Promise.all([enrollNurture(db, input), enrollNurture(db, input)]);
      assert.deepEqual(results.sort(), ['duplicate', 'enrolled']);
      const tasks = await db.collection('emailTasks').where('submissionId', '==', input.submissionId).get();
      assert.equal(tasks.size, 6);
      assert.equal(tasks.docs[0].data().totalScore, 0);
      const optedOut = { ...input, email: 'opted-out@example.test', submissionId: 'lead-2' };
      await db.collection('email_opt_outs').doc(Buffer.from(optedOut.email).toString('base64')).set({ optedOut: true });
      assert.equal(await enrollNurture(db, optedOut), 'opted_out');
      assert.equal((await db.collection('emailTasks').where('submissionId', '==', optedOut.submissionId).get()).size, 0);
    });
  } finally {
    await Promise.all([auth.deleteUser('metrics-admin'), auth.deleteUser('metrics-member')]);
    await rules.cleanup();
    await deleteClient(client);
    await db.terminate();
    await deleteApp(app);
  }
});

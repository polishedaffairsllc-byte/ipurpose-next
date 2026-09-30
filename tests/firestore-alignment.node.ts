import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { Firestore, Timestamp } from 'firebase-admin/firestore';
import { completeLab, getLabCompletion, mergeProgress, updateOrientationProgress } from '../lib/labs/completion';
import { getLatestQuestionnaire } from '../lib/clarity/latestQuestionnaire';
import { createSaveQueue } from '../lib/serializedSave';

const emulator = process.env.FIRESTORE_EMULATOR_HOST;
if (!emulator || !/^(localhost|127\.0\.0\.1):\d+$/.test(emulator)) {
  throw new Error('Run these tests against a localhost Firestore emulator only.');
}
const db = new Firestore({ projectId: 'demo-data-alignment' });
after(() => db.terminate());
const uid = () => `alignment-test-${randomUUID()}`;

test('completion keeps non-lab progress and synchronizes both readers', async () => {
  const user = uid();
  await db.doc(`learning_path_progress/${user}`).set({ completedSteps: ['orientation_intro', 'integration_reflection'], currentStep: 'agency_lab' });
  await db.doc(`labCompletion/${user}`).set({ meaning: true });
  await completeLab(db, user, 'identity', 'threshold');
  const flags = await getLabCompletion(db, user);
  assert.deepEqual(flags, { identity: true, meaning: true, agency: false });
  const progress = (await db.doc(`learning_path_progress/${user}`).get()).data()!;
  assert.deepEqual(new Set(progress.completedSteps), new Set(['orientation_intro', 'integration_reflection', 'identity_lab', 'meaning_lab']));
  assert.equal(progress.percentComplete, 67);
  assert.equal(progress.currentStep, 'agency_lab');
  const legacy = (await db.doc(`labCompletion/${user}`).get()).data()!;
  assert.equal(legacy.identity, true);
  assert.equal(legacy.meaning, true);
  const migrated = (await db.doc(`lab_completion/${user}_meaning`).get()).data()!;
  assert.equal(migrated.method, 'legacy');
  assert.equal(migrated.completedAt, undefined);
});

test('concurrent completions and reflection progress cannot overwrite each other', async () => {
  const user = uid();
  await Promise.all([
    completeLab(db, user, 'identity', 'threshold'),
    completeLab(db, user, 'meaning', 'threshold'),
    completeLab(db, user, 'agency', 'checkbox'),
    updateOrientationProgress(db, user, ['orientation_intro', 'integration_reflection', 'community_reflection']),
  ]);
  const progress = (await db.doc(`learning_path_progress/${user}`).get()).data()!;
  assert.equal(progress.completedSteps.length, 6);
  assert.equal(progress.percentComplete, 100);
  assert.deepEqual(await getLabCompletion(db, user), { identity: true, meaning: true, agency: true });
});

test('repeating completion preserves the original completion timestamp', async () => {
  const user = uid();
  await completeLab(db, user, 'agency', 'checkbox');
  const first = (await db.doc(`lab_completion/${user}_agency`).get()).data()!;
  await completeLab(db, user, 'agency', 'threshold');
  const repeated = (await db.doc(`lab_completion/${user}_agency`).get()).data()!;
  assert.ok(first.completedAt.isEqual(repeated.completedAt));
  assert.equal(repeated.method, 'checkbox');
});

test('progress updates are additive and percentages are derived from known steps', async () => {
  const user = uid();
  await updateOrientationProgress(db, user, ['identity_lab', 'orientation_intro']);
  await updateOrientationProgress(db, user, ['orientation_intro']);
  const progress = (await db.doc(`learning_path_progress/${user}`).get()).data()!;
  assert.equal(progress.percentComplete, 33);
  assert.equal(progress.completedSteps.length, 2);
  assert.deepEqual(mergeProgress(['future_step'], ['identity_lab', 'identity_lab']), {
    completedSteps: ['future_step', 'identity_lab'], percentComplete: 17,
  });
});

function questionnaire(user: string, time: number, extra = {}) {
  return { uid: user, createdAt: Timestamp.fromMillis(time), scores: { totalScore: 42 }, resultSummary: 'Test result', identityType: 'Builder', ...extra };
}

test('UID questionnaire survives more than one page of newer conversations', async () => {
  const user = uid();
  const batch = db.batch();
  batch.set(db.collection('clarityCheckSubmissions').doc(), questionnaire(user, 1000));
  for (let i = 0; i < 30; i++) batch.set(db.collection('clarityCheckSubmissions').doc(), {
    uid: user, createdAt: Timestamp.fromMillis(2000 + i), conversationSummary: 'Test conversation',
  });
  await batch.commit();
  assert.equal((await getLatestQuestionnaire(db, user))?.identityType, 'Builder');
});

test('UID takes precedence and email fallback excludes another account', async () => {
  const user = uid(), email = `${user}@example.test`;
  await db.collection('clarityCheckSubmissions').add(questionnaire(user, 1000, { identityType: 'UID result' }));
  await db.collection('clarityCheckSubmissions').add(questionnaire('another-user', 3000, { email, identityType: 'Wrong owner' }));
  await db.collection('clarityCheckSubmissions').add({ ...questionnaire('', 2000, { email, identityType: 'Legacy result' }), uid: null });
  assert.equal((await getLatestQuestionnaire(db, user, email))?.identityType, 'UID result');
  assert.equal((await getLatestQuestionnaire(db, uid(), email))?.identityType, 'Legacy result');
  assert.equal(await getLatestQuestionnaire(db, uid()), undefined);
});

test('save queue rejects HTTP failures, then allows retry', async () => {
  const save = createSaveQueue();
  await assert.rejects(save(async () => new Response('{}', { status: 401 })), /could not be saved/);
  await assert.rejects(save(async () => { throw new Error('Network unavailable'); }), /Network unavailable/);
  await save(async () => new Response('{"success":true}', { status: 200 }));
});

test('a slow save cannot finish after a newer save and overwrite its data', async () => {
  const save = createSaveQueue();
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const writes: string[] = [];
  const first = save(async () => { await gate; writes.push('first'); return new Response(); });
  const second = save(async () => { writes.push('latest'); return new Response(); });
  await Promise.resolve();
  assert.deepEqual(writes, []);
  release();
  await Promise.all([first, second]);
  assert.deepEqual(writes, ['first', 'latest']);
});

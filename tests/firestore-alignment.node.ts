import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { Firestore, Timestamp } from 'firebase-admin/firestore';
import { completeLab, getLabCompletion, mergeProgress, updateOrientationProgress } from '../lib/labs/completion';
import { getLatestQuestionnaire, legacyAccountEmail } from '../lib/clarity/latestQuestionnaire';
import { isQuestionnaire, submissionType } from '../lib/clarity/submissionType';
import { createSaveQueue } from '../lib/serializedSave';

const emulator = process.env.FIRESTORE_EMULATOR_HOST;
if (!emulator || !/^(localhost|127\.0\.0\.1):\d+$/.test(emulator)) {
  throw new Error('Run these tests against a localhost Firestore emulator only.');
}
const db = new Firestore({ projectId: 'demo-data-alignment' });
after(() => db.terminate());
const uid = () => `alignment-test-${randomUUID()}`;

test('canonical completion preserves Orientation, Integration, Community and leaves legacy data untouched', async () => {
  const user = uid();
  const existing = ['orientation_intro', 'integration_reflection', 'community_reflection'];
  await db.doc(`learning_path_progress/${user}`).set({ completedSteps: existing, currentStep: 'agency_lab' });
  await db.doc(`labCompletion/${user}`).set({ meaning: true });
  await completeLab(db, user, 'identity', 'threshold');
  assert.deepEqual(await getLabCompletion(db, user), { identity: true, meaning: false, agency: false });
  const progress = (await db.doc(`learning_path_progress/${user}`).get()).data()!;
  assert.deepEqual(new Set(progress.completedSteps), new Set([...existing, 'identity_lab']));
  assert.equal(progress.percentComplete, 67);
  assert.equal(progress.currentStep, 'agency_lab');
  assert.deepEqual((await db.doc(`labCompletion/${user}`).get()).data(), { meaning: true });
  assert.equal((await db.doc(`lab_completion/${user}_meaning`).get()).exists, false);
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


test('explicit types are authoritative and ambiguous legacy shapes are not questionnaires', async () => {
  assert.equal(submissionType({ messageCount: 2 }), 'conversation');
  assert.equal(isQuestionnaire(questionnaire('u', 1, { type: 'conversation' })), false);
  assert.equal(isQuestionnaire(questionnaire('u', 1, { conversationHistory: [] })), false);
  assert.equal(isQuestionnaire(questionnaire('u', 1, { type: 'unknown' })), false);
  assert.equal(isQuestionnaire(questionnaire('u', 1, { type: 'questionnaire' })), true);
  const user = uid();
  await db.collection('clarityCheckSubmissions').add(questionnaire(user, 1000));
  await db.collection('clarityCheckSubmissions').add(questionnaire(user, 2000, { type: 'conversation', identityType: 'wrong' }));
  assert.equal((await getLatestQuestionnaire(db, user))?.identityType, 'Builder');
});

test('save → reload → dashboard → Integration uses canonical maps for all three labs', async () => {
  const { loadRoute } = await import('./alignmentRoutes');
  const { summarizeLabMap } = await import('../lib/labs/mapSummary');
  const user = uid();
  const dashboard = await loadRoute('app/api/dashboard/route.ts', db, user);
  const labs = {
    identity: { selfPerceptionMap: 'I listen carefully.', selfConceptMap: 'I build useful tools.', selfNarrativeMap: 'I choose a steady direction.' },
    meaning: { valueStructure: 'Care and honesty.', coherenceStructure: 'My work reflects my values.', directionStructure: 'Make the next useful thing.' },
    agency: { awarenessPatterns: 'Notice when I pause.', decisionPatterns: 'Choose one small next step.', actionPatterns: 'Make time every morning.' },
  };
  for (const lab of ['identity', 'meaning', 'agency'] as const) {
    // Contradictory legacy text must neither win nor be modified.
    await db.doc(`users/${user}/labs/${lab}`).set({ text: 'Legacy text must stay untouched' });
    const save = await loadRoute(`app/api/labs/${lab}/save/route.ts`, db, user);
    const active = await loadRoute(`app/api/labs/${lab}/active/route.ts`, db, user);
    const complete = await loadRoute(`app/api/labs/${lab}/complete/route.ts`, db, user);
    const saved = await save.POST(new Request('http://localhost/save', { method: 'POST', body: JSON.stringify({ ...labs[lab], completeEnough: true }) }));
    assert.equal(saved.status, 201);
    const reloaded = await (await active.GET()).json();
    for (const [field, value] of Object.entries(labs[lab])) assert.equal(reloaded.data.map[field], value);
    let status = await (await dashboard.GET()).json();
    assert.equal(status.data[`${lab}Status`], 'in_progress');
    assert.equal((await complete.POST()).status, 200);
    status = await (await dashboard.GET()).json();
    assert.equal(status.data[`${lab}Status`], 'complete');
    // Integration uses this exact active endpoint and shared summary formatter.
    const integrationMap = (await (await active.GET()).json()).data.map;
    const summary = summarizeLabMap(lab, integrationMap);
    for (const value of Object.values(labs[lab])) assert.ok(summary.includes(value));
    assert.ok(!summary.includes(user) && !summary.includes('mvp_v1') && !summary.includes('Legacy'));
    assert.deepEqual((await db.doc(`users/${user}/labs/${lab}`).get()).data(), { text: 'Legacy text must stay untouched' });
  }
  assert.equal((await db.doc(`labCompletion/${user}`).get()).exists, false);
});


test('legacy matching requires verified email and never selects unowned anonymous questionnaires', async () => {
  const email = `${uid()}@example.test`;
  assert.equal(legacyAccountEmail({ email, emailVerified: false }), undefined);
  assert.equal(legacyAccountEmail({ email }), undefined);
  assert.equal(legacyAccountEmail({ email, emailVerified: true }), email);
  await db.collection('clarityCheckSubmissions').add(questionnaire('', 5000, { email: null }));
  assert.equal(await getLatestQuestionnaire(db, uid(), email), undefined);
});

test('founder intake pages past conversations to find compatible questionnaires', async () => {
  const { loadRoute } = await import('./alignmentRoutes');
  const user = uid();
  await db.doc(`users/${user}`).set({ isFounder: true });
  const batch = db.batch();
  const expected = db.collection('clarityCheckSubmissions').doc();
  const now = Date.now();
  batch.set(expected, questionnaire(user, now, { type: 'questionnaire' }));
  for (let i = 0; i < 101; i++) batch.set(db.collection('clarityCheckSubmissions').doc(), {
    type: 'conversation', createdAt: Timestamp.fromMillis(now + 1 + i), messageCount: 1,
  });
  await batch.commit();
  const route = await loadRoute('app/api/deepen/admin/intake/clarity-checks/route.ts', db, user);
  const response = await route.GET();
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.ok(body.data.some((d: { id: string }) => d.id === expected.id));
  assert.ok(body.data.every((d: { type: string }) => d.type === 'questionnaire'));
});

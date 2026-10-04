import test from 'node:test';
import assert from 'node:assert/strict';
import { FakeFirestore } from './fakes/firestore';
import { resolveContact, emailKey } from '../lib/clarity/contacts';
import { deliverOnce, retryTransactionalDeliveries } from '../lib/clarity/delivery';
import { runClarityLifecycle, type LifecycleInput } from '../lib/clarity/lifecycle';
import { saveNativeSubmission } from '../lib/clarity/nativeSubmission';
import { enrollNurture } from '../lib/launch-metrics/enrollNurture';
import { marketingSuppressed } from '../lib/clarity/suppression';
import { recordMobileMarketingConsent } from '../lib/clarity/marketingConsent';
import { CLARITY_LIFECYCLE_COPY as COPY } from '../mobile/src/lib/clarityLifecycleCopy';

const input: LifecycleInput = { platform: 'mobile', uid: 'account', email: ' Person@Example.test ',
  quizSubmissionId: 'quiz-123', identityType: 'Builder', totalScore: 21,
  scores: { internalClarity: 6, readinessForSupport: 6, frictionBetweenInsightAndAction: 6, integrationAndMomentum: 3 },
  resultSummary: 'Saved summary', nextStep: 'Saved next step' };
function setup() {
  const db = new FakeFirestore(); db.documents.set('users/account', {}); const sent: { text: string; key: string; subject: string }[] = [];
  const deps = { db: db.asFirestore(), send: async (message: { text: string; subject: string }, key: string) => {
    sent.push({ ...message, key }); return `provider-${sent.length}`;
  }, enroll: (data: Parameters<typeof enrollNurture>[1]) => enrollNurture(db.asFirestore(), data), webResults: async () => true };
  return { db, sent, deps };
}
test('new unnamed mobile user: transactional results and neutral welcome, no marketing', async () => {
  const { db, sent, deps } = setup();
  const result = await runClarityLifecycle(input, deps);
  assert.equal(result.enrollment, 'not_consented'); assert.equal(sent.length, 2);
  assert.ok(sent.every(message => message.text.includes('Hi there')));
  assert.ok(sent[0].text.includes('/clarity-check/results/quiz-123'));
  assert.ok(!sent[0].text.includes(result.contactId));
  assert.ok(!sent.some(message => /Starter Pack|founder.s rate|Buy|sale/i.test(message.text)));
  assert.equal([...db.documents.keys()].filter(key => key.startsWith('emailTasks/')).length, 0);
});
test('an existing web lead older than seven days is reused; prior web welcome is not repeated', async () => {
  const { db, sent, deps } = setup();
  db.documents.set('leads/old-web', { email: 'person@example.test', source: 'clarity-check', createdAt: new Date(0),
    consent: { legacy: true }, subscriptionStatus: 'active' });
  db.documents.set('emailTasks/old-task', { email: 'person@example.test', submissionId: 'old-web', status: 'completed' });
  await runClarityLifecycle(input, deps);
  assert.equal([...db.documents.keys()].filter(key => key.startsWith('leads/')).length, 1);
  assert.deepEqual(db.documents.get('leads/old-web')!.consent, { legacy: true });
  assert.equal(db.documents.get('leads/old-web')!.subscriptionStatus, 'active');
  assert.equal(sent.length, 1);
});
test('repeat and concurrent submits send one result and one welcome; retake sends a new result only', async () => {
  const { db, sent, deps } = setup();
  await recordMobileMarketingConsent(db.asFirestore(), 'account', 'person@example.test', { granted: true, copyVersion: COPY.consentVersion });
  await Promise.all([runClarityLifecycle(input, deps), runClarityLifecycle(input, deps)]);
  await runClarityLifecycle(input, deps);
  assert.equal(sent.length, 2);
  assert.equal([...db.documents.keys()].filter(key => key.startsWith('emailTasks/')).length, 6);
  const dates = [...db.documents].filter(([key]) => key.startsWith('emailTasks/')).map(([, data]) => data.scheduledFor);
  await runClarityLifecycle({ ...input, quizSubmissionId: 'quiz-retake' }, deps);
  assert.equal(sent.length, 3); assert.equal(sent.filter(message => message.subject === COPY.welcomeSubject).length, 1);
  assert.deepEqual([...db.documents].filter(([key]) => key.startsWith('emailTasks/')).map(([, data]) => data.scheduledFor), dates);
});
test('normalized email resolution is transactional across sources and reports legacy duplicates without merging', async () => {
  const { db } = setup();
  const contacts = await Promise.all(Array.from({ length: 10 }, (_, i) => resolveContact(db.asFirestore(), {
    email: i % 2 ? ' PERSON@example.test ' : 'person@example.test', source: i % 2 ? 'workshop' : 'clarity-check', name: 'Person',
  })));
  assert.equal(new Set(contacts.map(contact => contact.id)).size, 1);
  db.documents.set('leads/legacy-duplicate', { email: 'person@example.test', source: 'workshop', emailOptOut: true });
  const result = await resolveContact(db.asFirestore(), { email: 'person@example.test', source: 'clarity-check' });
  assert.deepEqual(result.legacyDuplicateIds, ['legacy-duplicate']);
  assert.equal(db.documents.get('leads/legacy-duplicate')!.emailOptOut, true);
  assert.equal(db.documents.get(`leadEmailKeys/${emailKey(input.email)}`)!.leadId, contacts[0].id);
});
test('explicit app consent records copy/source/time and never clears opt-out or subscription state', async () => {
  const { db, deps, sent } = setup();
  db.documents.set('users/account', { emailOptOut: true, subscriptionStatus: 'unsubscribed' });
  await assert.rejects(recordMobileMarketingConsent(db.asFirestore(), 'account', input.email, { granted: false, copyVersion: COPY.consentVersion }));
  await recordMobileMarketingConsent(db.asFirestore(), 'account', input.email, { granted: true, copyVersion: COPY.consentVersion }, new Date(1000));
  const before = db.documents.get('users/account')!;
  assert.equal(before.marketingConsent.source, COPY.consentSource);
  assert.equal(before.marketingConsent.copyVersion, COPY.consentVersion);
  assert.equal(before.marketingConsent.grantedAt.getTime(), 1000);
  assert.equal(before.emailOptOut, true); assert.equal(before.subscriptionStatus, 'unsubscribed');
  assert.equal((await runClarityLifecycle(input, deps)).enrollment, 'opted_out'); assert.equal(sent.length, 2);
});
test('individual marketing suppression fails closed on lookup failure and honors lead/user flags', async () => {
  const { db } = setup(); db.failReads = true;
  assert.equal(await marketingSuppressed(db.asFirestore(), input.email), true);
  db.failReads = false; db.documents.set('leads/old', { email: 'person@example.test', subscriptionStatus: 'suppressed' });
  assert.equal(await marketingSuppressed(db.asFirestore(), input.email), true);
});
test('provider retry reuses immutable payload/key; sent records and expired uncertain deliveries never resend', async () => {
  const { db } = setup(); const keys: string[] = []; let fail = true;
  const send = async (_message: unknown, key: string) => { keys.push(key); if (fail) throw new Error('uncertain'); return 'provider-1'; };
  const message = { to: 'person@example.test', subject: 'One result', text: 'Original' };
  assert.equal(await deliverOnce(db.asFirestore(), 'delivery-1', message, 'account', send, new Date(1000)), 'retry_pending');
  fail = false;
  await deliverOnce(db.asFirestore(), 'delivery-1', { ...message, text: 'Changed' }, 'account', send, new Date(2000));
  assert.equal(db.documents.get('clarityDeliveries/delivery-1')!.message.text, 'Original');
  assert.deepEqual(keys, ['clarity/delivery-1', 'clarity/delivery-1']);
  await deliverOnce(db.asFirestore(), 'delivery-1', message, 'account', send, new Date(3000)); assert.equal(keys.length, 2);
  fail = true; await deliverOnce(db.asFirestore(), 'delivery-2', message, 'account', send, new Date(1000));
  fail = false; await deliverOnce(db.asFirestore(), 'delivery-2', message, 'account', send, new Date(25 * 3600000));
  assert.equal(db.documents.get('clarityDeliveries/delivery-2')!.status, 'needs_review'); assert.equal(keys.length, 3);
});
test('saved native attempt is stable across concurrency/retry, rejects different answers, allows genuine retake', async () => {
  const { db } = setup();
  const data = { responses: { '1': 3, '2': 3, '3': 3, '4': 3, '5': 3, '6': 3, '7': 3 },
    identityResponses: ['B', 'B', 'B', 'B', 'B'], identityType: 'Builder', resultSummary: 'Saved' };
  const ids = await Promise.all([1,2,3].map(() => saveNativeSubmission(db.asFirestore(), 'account', 'attempt-one', data, true, new Date())));
  assert.equal(new Set(ids).size, 1);
  assert.equal([...db.documents.keys()].filter(key => key.startsWith('clarityCheckSubmissions/')).length, 1);
  await assert.rejects(saveNativeSubmission(db.asFirestore(), 'account', 'attempt-one', { ...data, responses: { ...data.responses, '1': 4 } }, true, new Date()), /CONFLICT/);
  assert.notEqual(await saveNativeSubmission(db.asFirestore(), 'account', 'attempt-two', data, false, new Date()), ids[0]);
});
test('web helper preserves legacy enrollment without fabricating consent and carries the quiz ID separately', async () => {
  const { db, deps } = setup(); let webQuiz = '';
  const result = await runClarityLifecycle({ ...input, platform: 'web', name: 'Person' }, { ...deps,
    webResults: async data => { webQuiz = data.quizSubmissionId; return true; } });
  assert.equal(result.enrollment, 'enrolled'); assert.equal(webQuiz, 'quiz-123');
  assert.ok([...db.documents].filter(([key]) => key.startsWith('emailTasks/')).every(([, task]) => task.quizSubmissionId === 'quiz-123'));
  assert.equal(db.documents.get('users/account')?.marketingConsent, undefined);
});

test('transactional recovery drains recorded pending deliveries without backfilling older mobile results', async () => {
  const { db } = setup(); let sent = 0;
  db.documents.set('clarityCheckSubmissions/historical', { uid: 'account', email: 'person@example.test' });
  await deliverOnce(db.asFirestore(), 'retry', { to: 'person@example.test', subject: 'Result', text: 'Saved' },
    'account', async () => { throw new Error('provider failure'); }, new Date(1000));
  const send = async () => { sent++; return 'provider-recovered'; };
  assert.equal(await retryTransactionalDeliveries(db.asFirestore(), send, new Date(2000)), 1);
  assert.equal(await retryTransactionalDeliveries(db.asFirestore(), send, new Date(3000)), 0);
  assert.equal(sent, 1); assert.equal(db.documents.has('clarityDeliveries/results_historical'), false);
});

test('transactional retry cannot send or recreate work after its account is deleted', async () => {
 const { db } = setup(); let sends = 0;
 await deliverOnce(db.asFirestore(), 'deleted-account', { to: 'person@example.test', subject: 'Result', text: 'Saved' }, 'account', async () => { throw new Error('failure'); }, new Date(1000));
 db.documents.delete('users/account'); db.documents.delete('clarityDeliveries/deleted-account');
 await deliverOnce(db.asFirestore(), 'deleted-account', { to: 'person@example.test', subject: 'Result', text: 'Saved' }, 'account', async () => { sends++; return 'provider'; }, new Date(2000));
 assert.equal(sends, 0); assert.equal(db.documents.has('clarityDeliveries/deleted-account'), false);
});

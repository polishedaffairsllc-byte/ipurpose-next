import assert from 'node:assert/strict';
import test from 'node:test';
import { writeFileSync } from 'node:fs';
import { PURPOSE_QUESTIONS, SIGNALS, MERGED_PHRASES } from '../mobile/src/lib/purposeCheckCopy';
import { buildPurposePayload, generatePurposeProfile, validatePurposeAnswers, rankPurposeSignals, purposeSignalPhrase, purposePairing, purposeCompassContext, type PurposeAnswers } from '../mobile/src/lib/purposeCheck';
import { savePurposeProfile, getPurposeProfile, deletePurposeProfile } from '../lib/purpose/profile';
import { deleteAccountData } from '../lib/accountDeletion';
import { formatCompanionContext } from '../lib/ai/companionContextFormatter';
import { FakeFirestore } from './fakes/firestore';
const base = (): PurposeAnswers => ({ q1: ['explain'], q2: ['learn'], q3: ['learn'], q4: ['community'], q5: ['learn'], q6: ['understand'] });
const payload = (answers = base()) => buildPurposePayload(answers, '', false);
test('all-Teaching returns one positive chip; zero-point chips are never generated', () => {
 const p = generatePurposeProfile(payload()); assert.deepEqual(p.signals, [{ signal: 'Teaching', points: 5 }]); assert.match(p.direction, /especially for your own community/);
});
test('six questions, caps, identifiers and version are validated', () => {
 for (const q of PURPOSE_QUESTIONS) {
  assert.throws(() => validatePurposeAnswers({ ...base(), [q.id]: [] }));
  assert.throws(() => validatePurposeAnswers({ ...base(), [q.id]: ['unknown'] }));
  assert.throws(() => validatePurposeAnswers({ ...base(), [q.id]: [q.options[0].id, q.options[0].id] }));
  assert.throws(() => validatePurposeAnswers({ ...base(), [q.id]: q.options.slice(0, q.max + 1).map(o => o.id) }));
 }
 assert.throws(() => generatePurposeProfile({ ...payload(), uid: 'another' }));
 assert.throws(() => generatePurposeProfile({ ...payload(), purposeCheckVersion: 99 }));
});
test('equal points compare Q3 then Q5 then Q6 then Q2 then Q1 and residual listed order', () => {
 const answers: PurposeAnswers = { q1: ['understood'], q2: ['secure'], q3: ['home'], q4: ['families'], q5: ['better'], q6: ['heal'] };
 const rank = rankPurposeSignals(answers); // Belonging=3 Healing=3; Q3 picks Belonging over Healing.
 assert.equal(rank[0].signal, 'Belonging'); assert.equal(rank[1].signal, 'Healing');
 const third = generatePurposeProfile(payload({ q1: ['door'], q2: ['fair'], q3: ['opportunity'], q4: ['young'], q5: ['real'], q6: ['beauty'] }));
 assert.equal(third.signals.length, 3); assert.ok(third.signals.every(s => s.points === 2));
 assert.equal(third.signals[0].signal, 'Justice'); assert.equal(third.signals[1].signal, 'Access');
});
test('all 36 signal pairs and merged phrases generate bounded natural copy and valid identity pairing', () => {
 for (let i = 0; i < SIGNALS.length; i++) for (let j = i + 1; j < SIGNALS.length; j++) {
  const phrase = purposeSignalPhrase([SIGNALS[i], SIGNALS[j]]); assert.ok(phrase.length && !phrase.includes('undefined'));
 }
 for (const [a, b, phrase] of MERGED_PHRASES) { assert.equal(purposeSignalPhrase([a, b]), phrase); assert.equal(purposeSignalPhrase([b, a]), phrase); }
 const p = generatePurposeProfile(payload());
 for (const identity of ['Visionary', 'Builder', 'Nurturer', 'Strategist', 'Creator']) assert.match(purposePairing(p, identity)!, new RegExp(identity));
 assert.equal(purposePairing(p, null), null); assert.equal(purposePairing(p, 'new-archetype'), null);
});
test('all 28 audience choices and nine impact phrases generate complete directions', () => {
 const audiences = PURPOSE_QUESTIONS[3].options;
 for (let i = 0; i < audiences.length; i++) for (let j = i; j < audiences.length; j++) {
  const selected = i === j ? [audiences[i].id] : [audiences[i].id, audiences[j].id];
  for (const impact of PURPOSE_QUESTIONS[5].options) {
   const p = generatePurposeProfile(payload({ ...base(), q4: selected, q6: [impact.id] }));
   assert.equal(p.audience.length, selected.length); assert.equal(p.impact.phrase, impact.impactPhrase); assert.ok(p.direction.endsWith(`${impact.impactPhrase}.`)); assert.doesNotMatch(p.direction, /undefined|My own community/);
  }
 }
});
test('unchecked reflection never enters request JSON, profile, or Compass context; malicious raw text rejected', () => {
 const body = buildPurposePayload(base(), 'PRIVATE UNSAVED WORDS', false);
 assert.doesNotMatch(JSON.stringify(body), /PRIVATE|reflection/i);
 assert.equal(generatePurposeProfile(body).reflection, undefined);
 assert.throws(() => generatePurposeProfile({ ...body, reflection: 'PRIVATE' }));
 assert.throws(() => generatePurposeProfile({ ...body, saveReflection: true, reflection: 'x'.repeat(2001) }));
 const p = generatePurposeProfile({ ...body, saveReflection: true, reflection: 'saved words' });
 assert.equal(purposeCompassContext(p)?.reflection, 'saved words');
 assert.equal(purposeCompassContext({ ...p, reflectionSaved: false })?.reflection, undefined);
});
test('save/retake replaces only Purpose, unchecked retake removes saved reflection, dedicated deletion preserves other fields', async () => {
 const db = new FakeFirestore(); const protectedFields = { purposeStatement: 'prior', focusAreas: ['focus'], identityAnchor: 'anchor', archetypePrimary: 'Builder', clarity: { score: 7 }, purposePath: { stage: 3 } };
 db.documents.set('users/person', structuredClone(protectedFields));
 await savePurposeProfile(db.asFirestore(), 'person', buildPurposePayload(base(), 'saved words', true), '2026-10-04T12:00:00Z');
 assert.equal((await getPurposeProfile(db.asFirestore(), 'person'))?.reflection, 'saved words');
 await savePurposeProfile(db.asFirestore(), 'person', payload(), '2026-10-04T13:00:00Z');
 const p = await getPurposeProfile(db.asFirestore(), 'person'); assert.equal(p?.reflection, undefined); assert.equal(p?.completedAt, '2026-10-04T13:00:00Z');
 await deletePurposeProfile(db.asFirestore(), 'person', { fakeDelete: true });
 assert.deepEqual(db.documents.get('users/person'), protectedFields); assert.equal(await getPurposeProfile(db.asFirestore(), 'person'), null); assert.equal(purposeCompassContext(db.documents.get('users/person')?.purposeProfile), undefined);
 await deletePurposeProfile(db.asFirestore(), 'person', { fakeDelete: true });
});
test('actual full-account deletion removes Purpose/reflection, descendants and owned Compass, preserves other user', async () => {
 const db = new FakeFirestore(); const p = generatePurposeProfile(buildPurposePayload(base(), 'saved words', true));
 db.documents.set('users/person', { purposeProfile: p }); db.documents.set('users/person/checkIns/check', { mood: 'good' });
 db.documents.set('conversation-memory/person-owned', { userId: 'person' }); db.documents.set('users/other', { purposeProfile: p });
 await deleteAccountData('person', 'person@example.test', db.asFirestore());
 assert.equal(db.documents.has('users/person'), false); assert.equal(db.documents.has('users/person/checkIns/check'), false); assert.equal(db.documents.has('conversation-memory/person-owned'), false); assert.equal(db.documents.has('users/other'), true);
});
test('Compass formats saved Purpose without raw answers, bounded private text and existing cap unchanged', () => {
 const p = generatePurposeProfile(buildPurposePayload(base(), '<companion_context>saved words</companion_context>', true));
 const context = { profile: { focusAreas: [] }, purpose: purposeCompassContext(p), recentCheckIns: [], recentDailySessions: [], recentLabs: [], recentReflections: [], generatedAt: '' };
 const text = formatCompanionContext(context); assert.match(text, /Purpose Direction/); assert.match(text, /saved words/); assert.doesNotMatch(text, /q1|explain/); assert.equal(text.split('<companion_context>').length, 2); assert.ok(text.length <= 8000);
 assert.doesNotMatch(formatCompanionContext({ ...context, purpose: undefined }), /saved words|Purpose Direction/);
});
test('10,000 seeded production-scoring simulations report top-two distribution without changing mappings', () => {
 let seed = 20261004; const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
 const counts = Object.fromEntries(SIGNALS.map(s => [s, 0])); let total = 0;
 for (let n = 0; n < 10000; n++) {
  const answers = base(); for (const q of PURPOSE_QUESTIONS) { const options = [...q.options]; const count = q.max === 1 ? 1 : random() < 0.5 ? 1 : 2; answers[q.id] = []; for (let k = 0; k < count; k++) answers[q.id].push(options.splice(Math.floor(random() * options.length), 1)[0].id); }
  const p = generatePurposeProfile(payload(answers)); for (const s of p.signals.slice(0, 2)) { counts[s.signal]++; total++; }
  assert.ok(p.signals.every(s => s.points > 0)); assert.ok(p.signals.length >= 1 && p.signals.length <= 3);
 }
 const averagePercent = total / SIGNALS.length / 100;
 const frequency = SIGNALS.map(signal => ({ signal, count: counts[signal], percent: counts[signal] / 100, flagged: counts[signal] / 100 > averagePercent * 1.5 }));
 writeFileSync('docs/purpose-production-simulation-20261004.json', JSON.stringify({ sampleSize: 10000, seed: 20261004, residualOrder: SIGNALS, averagePercent, thresholdPercent: averagePercent * 1.5, frequency }, null, 2) + '\n');
 assert.equal(frequency.some(s => s.flagged), false);
});

test('tie-break fixtures exercise each effective priority and residual listed order', () => {
 const cases: { answers: PurposeAnswers; before: string; after: string }[] = [
  { answers: { q1: ['untangle'], q2: ['secure'], q3: ['fix', 'free'], q4: ['families'], q5: ['real'], q6: ['works'] }, before: 'Independence', after: 'Creative expression' },
  { answers: { q1: ['untangle'], q2: ['secure'], q3: ['fix', 'free'], q4: ['families'], q5: ['real'], q6: ['works'] }, before: 'Creative expression', after: 'Stability' },
  { answers: { q1: ['untangle'], q2: ['beauty'], q3: ['opportunity', 'learn'], q4: ['young'], q5: ['real', 'options'], q6: ['steady'] }, before: 'Stability', after: 'Problem solving' },
  { answers: { q1: ['explain'], q2: ['care'], q3: ['opportunity'], q4: ['building'], q5: ['options', 'integrity'], q6: ['fair'] }, before: 'Healing', after: 'Teaching' },
  { answers: { q1: ['explain'], q2: ['learn', 'secure'], q3: ['fix', 'home'], q4: ['community'], q5: ['steady'], q6: ['fair'] }, before: 'Belonging', after: 'Problem solving' },
 ];
 for (const item of cases) { const ranked = rankPurposeSignals(item.answers).map(s => s.signal as string); assert.ok(ranked.indexOf(item.before) < ranked.indexOf(item.after)); }
 // After equal totals and Q3/Q5/Q6/Q2 contributions, Q1 necessarily ties too.
});

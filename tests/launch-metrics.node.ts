import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createClarityAttempt } from '../mobile/src/lib/analyticsCore';
import { emitLaunchEvent, trackConfirmedEmailSignup, trackNewClarityResult } from '../lib/launch-metrics/events';
import { weeklyMetricsCsv } from '../lib/launch-metrics/exportCsv';
import { computeRates, emptyCounts, emptyPlatforms, type WeeklyMetrics } from '../functions/src/model';
import { enrollNurture } from '../lib/launch-metrics/enrollNurture';
import type { Firestore } from 'firebase-admin/firestore';

test('native start alone, failed result, resumed draft and successful result have separate semantics', () => {
  const events: string[] = [];
  const attempt = createClarityAttempt(name => events.push(name));
  attempt.begin(); attempt.begin();
  attempt.result(null); attempt.result({ error: 'API failed' });
  assert.deepEqual(events, ['clarity_check_start']);
  const result = { scores: { totalScore: 0 }, resultSummary: 'Ready', submissionId: 'saved-result' };
  attempt.result(result); attempt.result(result);
  assert.deepEqual(events, ['clarity_check_start', 'clarity_check_complete']);
  const resumed = createClarityAttempt(name => events.push(name));
  resumed.resume(3); resumed.begin();
  assert.equal(events.length, 2);
  resumed.result(result);
  assert.equal(events.at(-1), 'clarity_check_complete');
  assert.ok(!events.includes('first_open'));
});

test('web credits only confirmed enrollment and newly computed valid results; no PII leaves the helper', () => {
  const events: unknown[][] = [];
  const storage = new Map<string, string>();
  const original = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', { configurable: true, value: {
    gtag: (...args: unknown[]) => events.push(args),
    sessionStorage: { getItem: (key: string) => storage.get(key), setItem: (key: string, value: string) => storage.set(key, value) },
  } });
  try {
    for (const payload of [null, { ok: false }, { ok: true, id: 'honeypot-dropped' }, ...['failed', 'duplicate', 'opted_out'].map(enrollment => ({ ok: true, id: 'lead', enrollment }))]) assert.equal(trackConfirmedEmailSignup(payload), false);
    assert.equal(events.length, 0);
    const response = { ok: true, id: 'lead-success', enrollment: 'enrolled', email: 'private@example.test' };
    assert.equal(trackConfirmedEmailSignup(response), true);
    assert.equal(trackConfirmedEmailSignup(response), false);
    assert.equal(trackNewClarityResult({ submissionId: 'bookmarked-result' }), false);
    const result = { analyticsAttemptId: 'fresh-attempt', scores: { totalScore: 3 }, resultSummary: 'Ready' };
    assert.equal(trackNewClarityResult(result), true);
    assert.equal(trackNewClarityResult(result), false);
    assert.equal(events.length, 2);
    assert.deepEqual(events.map(args => args[1]), ['email_signup', 'clarity_check_complete']);
    assert.ok(!JSON.stringify(events).includes('private@'));
    assert.ok(events.every(args => (args[2] as { send_to: string }).send_to === 'G-9D1QBMLNWK'));
    window.gtag = () => { throw new Error('blocked analytics'); };
    assert.equal(emitLaunchEvent('sign_up'), false);
  } finally {
    if (original) Object.defineProperty(globalThis, 'window', original);
    else Reflect.deleteProperty(globalThis, 'window');
  }
});

test('failed enrollment storage rejects; a caller cannot credit it as an enrollment', async () => {
  const db = { collection: () => ({ doc: () => ({}), where: () => ({ limit: () => ({}) }) }), runTransaction: async () => { throw new Error('database unavailable'); } } as unknown as Firestore;
  await assert.rejects(enrollNurture(db, { name: 'Test', email: 'test@example.test', submissionId: 'saved-lead' }), /database unavailable/);
});

test('CSV is actual UTF-8 CSV with null-safe ratios, all platforms and formula-safe strings', () => {
  const record: WeeklyMetrics = { schemaVersion: 1, weekStart: '2026-09-07', weekEnding: '2026-09-13', counts: emptyCounts(), byPlatform: emptyPlatforms(), rates: computeRates(emptyCounts()), computedAt: '2026-09-15T00:00:00Z', reportingTimezone: '=UNSAFE("x")', property: 'properties/514773870' };
  const csv = weeklyMetricsCsv([record]);
  assert.ok(csv.startsWith('\uFEFF"Week starting"'));
  assert.equal(csv.split('\r\n').length, 3);
  assert.ok(csv.includes('"Android: first_open"'));
  assert.ok(csv.includes('"web: email_signup"'));
  assert.ok(csv.includes('"\'=UNSAFE(""x"")"'));
  assert.ok(!csv.includes('NaN') && !csv.includes('null'));
});

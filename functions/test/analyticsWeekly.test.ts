import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeRates, emptyCounts, getPreviousWeekRange, rangeEnding, TIMEZONE } from '../src/model';
import { parseReport, propertyName } from '../src/lib/ga4';
import { createMetricsService } from '../src/job';
import type { Firestore } from 'firebase-admin/firestore';

test('completed Mon–Sun weeks are resolved in New York, including DST and year boundaries', () => {
  for (const [now, ending] of [
    ['2026-09-14T20:00:00-04:00', '2026-09-13'],
    ['2026-09-14T06:00:00-04:00', '2026-09-13'],
    ['2026-09-14T23:00:00-04:00', '2026-09-13'],
    ['2026-09-13T20:00:00-04:00', '2026-09-06'],
    ['2026-09-14T03:59:59Z', '2026-09-06'],
    ['2026-09-14T04:00:00Z', '2026-09-13'],
    ['2026-03-09T00:00:00-04:00', '2026-03-08'],
    ['2026-11-02T00:00:00-05:00', '2026-11-01'],
    ['2026-01-01T10:00:00Z', '2025-12-28'],
  ]) assert.deepEqual(getPreviousWeekRange(new Date(now)), rangeEnding(ending), now);
  assert.deepEqual(rangeEnding('2026-09-13'), { weekStart: '2026-09-07', weekEnding: '2026-09-13' });
});

test('invalid calendar dates, non-Sundays and timestamps are rejected', () => {
  for (const date of ['', '2026-02-30', '2026-09-14', '2026-9-13', '2026-09-13T00:00:00Z']) assert.throws(() => rangeEnding(date));
});

test('rates use null for absent denominators, retain genuine zero and do not claim cohort conversion', () => {
  assert.equal(computeRates(emptyCounts()).installToRegistration, null);
  assert.equal(computeRates({ ...emptyCounts(), first_open: 3 }).installToRegistration, 0);
  assert.equal(computeRates({ ...emptyCounts(), first_open: 3, sign_up: 4 }).installToRegistration, 133.3);
});

const row = (event: string, platform: string, count: string) => ({ dimensionValues: [{ value: event }, { value: platform }], metricValues: [{ value: count }] });
const metadata = { timeZone: TIMEZONE };
test('GA4 keeps native platforms separate from web and never infers missing completions', () => {
  const counts = parseReport({ metadata, rowCount: 3, rows: [row('first_open', 'Android', '4'), row('sign_up', 'web', '80'), row('clarity_check_start', 'iOS', '3')] });
  assert.equal(counts.Android.first_open, 4);
  assert.equal(counts.web.sign_up, 80);
  assert.equal(counts.iOS.clarity_check_complete, 0);
  assert.equal(counts.web.email_signup, 0);
  assert.deepEqual(parseReport({ metadata, rowCount: 0 }).web, emptyCounts());
});

test('GA4 rejects incomplete, uncertain or malformed reports instead of storing misleading zeros', () => {
  for (const report of [
    {}, { metadata: { timeZone: 'UTC' } },
    { metadata: { ...metadata, subjectToThresholding: true } },
    { metadata: { ...metadata, dataLossFromOtherRow: true } },
    { metadata: { ...metadata, samplingMetadatas: [{}] } },
    { metadata, rowCount: 2, rows: [row('first_open', 'Android', '1')] },
    ...['-1', '1.5', 'NaN', '', '9007199254740992'].map(value => ({ metadata, rows: [row('sign_up', 'web', value)] })),
    { metadata, rows: [row('unknown', 'web', '1')] },
    { metadata, rows: [row('sign_up', '(not set)', '1')] },
  ]) assert.throws(() => parseReport(report));
});

test('property accepts the supplied resource name but not a measurement ID', () => {
  assert.equal(propertyName('514773870'), 'properties/514773870');
  assert.equal(propertyName('properties/514773870'), 'properties/514773870');
  for (const value of [undefined, '', 'G-9D1QBMLNWK', 'properties/abc']) assert.throws(() => propertyName(value));
});

test('a failed report or a non-conflict write failure is surfaced and never called skipped', async () => {
  const byPlatform = parseReport({ metadata });
  for (const phase of ['report', 'write']) {
    const failure = Object.assign(new Error('permission denied'), { code: 7 });
    let writes = 0;
    const ref = { get: async () => ({ exists: false }), create: async () => { writes++; throw failure; } };
    const service = createMetricsService({
      db: { collection: () => ({ doc: () => ref }) } as unknown as Firestore,
      fetchCounts: async () => { if (phase === 'report') throw failure; return { byPlatform, property: 'properties/514773870' }; },
      lookupUser: async () => ({ customClaims: { admin: true } }), now: () => new Date('2026-09-15T00:00:00Z'),
    });
    await assert.rejects(service.run(), error => error === failure);
    assert.equal(writes, phase === 'report' ? 0 : 1);
  }
});

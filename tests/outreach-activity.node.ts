import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PROPOSALS } from '../lib/outreach/registry';
import { summarize, outreachSchema, eventLabel, type OutreachEvent, type ProposalSummary, type OutreachInput } from '../lib/outreach/model';
import { latestExternalInitiative, activityFields, activityStatus } from '../lib/outreach/activity';
import { sanitizeHistory, historyForFilters } from '../lib/outreach/history';
import { createOutreachLogger } from '../lib/outreach/client';

const stamp = '2026-10-28T16:00:00.000Z';
const blank = () => summarize([], false);
const summary = (id: string, overrides: Partial<ProposalSummary>) => ({ ...blank().find(row => row.proposal_id === id)!, ...overrides });
function event(id: string, type: OutreachEvent['event_type'], overrides: Partial<OutreachEvent> = {}): OutreachEvent {
  const proposal = PROPOSALS.find(item => item.id === id)!;
  return { proposal_id: id, proposal_family: proposal.family, organization: proposal.organization, recipient_id: proposal.recipientId, deck_variant: proposal.deckVariant,
    page_path: proposal.pagePath, source_event_name: Object.entries(proposal.events).find(([, value]) => value === type)![0], event_type: type,
    event_id: randomUUID(), session_id: 'visit-one', client_timestamp: stamp, timestamp: stamp, visit_number: 1, sequence: 1,
    traffic_type: 'external', debug_mode: false, environment: 'production', source: 'first-party', timestamp_precision: 'exact', ...overrides };
}

test('registry includes all four initiatives and exact Foundhers campaign metadata', () => {
  assert.deepEqual(PROPOSALS.map(item => item.label), ['Ghana', 'Africa', 'Global Partnership', 'Found(her)s Stage']);
  const foundhers = PROPOSALS.find(item => item.id === 'foundhers-stage')!;
  assert.deepEqual([foundhers.family, foundhers.campaign, foundhers.landingPath, foundhers.source, foundhers.medium], ['foundhers', 'foundhers_2026', '/foundhers-stage', 'foundhers_stage', 'pitch_deck']);
});
test('default follows the latest confirmed external activity, ignores internal traffic, and retains configured fallback', () => {
  assert.equal(latestExternalInitiative(blank()), PROPOSALS[0].id);
  assert.equal(latestExternalInitiative([summary(PROPOSALS[0].id, { mostRecentActivity: '2026-10-28T10:00:00Z' }), summary(PROPOSALS[1].id, { mostRecentActivity: stamp })]), PROPOSALS[1].id);
  assert.equal(latestExternalInitiative([summary(PROPOSALS[0].id, { mostRecentActivity: stamp, mostRecentExternalActivity: null }), summary(PROPOSALS[2].id, { mostRecentExternalActivity: '2026-10-28T12:00:00Z' })], false), PROPOSALS[2].id);
  assert.equal(latestExternalInitiative(blank(), true, PROPOSALS, [{ proposal_id: 'foundhers-stage', localMinute: '2026-10-28T12:01', timezone: 'America/New_York', traffic_type: 'unknown', count: 10 }]), PROPOSALS[0].id);
  assert.equal(latestExternalInitiative([summary(PROPOSALS[0].id, { mostRecentActivity: stamp })], true, PROPOSALS, [{ proposal_id: 'foundhers-stage', localMinute: '2026-10-28T12:01', timezone: 'America/New_York', traffic_type: 'external', count: 1 }]), 'foundhers-stage');
  const future = { ...PROPOSALS[1], id: 'future-outreach', label: 'Future' };
  assert.equal(latestExternalInitiative([summary(PROPOSALS[1].id, { proposal_id: future.id, mostRecentExternalActivity: stamp })], true, [...PROPOSALS, future]), future.id);
});
test('existing deck fields and metrics are preserved; companion card omits inapplicable deck fields', () => {
  const deck = activityFields(PROPOSALS[0], summary(PROPOSALS[0].id, { highestSlide: 9, completed: true, pdfDownloaded: true, visits: 3 }));
  assert.equal(deck.find(row => row.id === 'highestSlide')?.value, 9);
  assert.equal(deck.find(row => row.id === 'visits')?.value, 3);
  assert.equal(deck.find(row => row.id === 'completed')?.value, true);
  const companion = activityFields(PROPOSALS[3]);
  assert.deepEqual(companion.map(row => row.id), ['firstVisit', 'mostRecentActivity', 'visits', 'companionViews', 'compassClicks', 'clarityClicks', 'otherCtaClicks']);
  assert.equal(activityFields(PROPOSALS[3], undefined, { initiativeId: 'foundhers-stage', count: 2, events: { begin_checkout: 2 } }).at(-1)?.value, 2);
  assert.equal(activityFields(PROPOSALS[3], undefined, { initiativeId: 'foundhers-stage', count: 0, events: {} }).some(row => row.id === 'downstreamEngagement'), false);
  assert.deepEqual(activityFields({ ...PROPOSALS[0], id: 'future-page', events: { future_view: 'page_view' } }).map(row => row.id), ['firstVisit', 'mostRecentActivity', 'visits']);
});
test('Foundhers interaction categories aggregate existing controlled CTA IDs without inventing visits or deck metrics', () => {
  const rows = [event('foundhers-stage', 'page_view'), event('foundhers-stage', 'cta_click', { cta_id: 'journey_1' }), event('foundhers-stage', 'cta_click', { cta_id: 'hero_clarity_check' }), event('foundhers-stage', 'cta_click', { cta_id: 'final_explore' })];
  const result = summarize(rows, false).find(row => row.proposal_id === 'foundhers-stage')!;
  assert.deepEqual(result.metricCounts, { companionViews: 1, compassClicks: 1, clarityClicks: 1, otherCtaClicks: 1 });
  assert.equal(result.visits, 1); assert.equal(activityStatus(result), 'CTA clicked');
  assert.equal(eventLabel(rows[1]), 'Explore Compass clicked');
  assert.equal(eventLabel({ event_type: 'cta_click', proposal_id: 'foundhers-stage' }), 'CTA clicked');
  const data = { ...rows[1], session_id: randomUUID() }; const { proposal_family: _family, organization: _org, recipient_id: _recipient, deck_variant: _variant, event_type: _event, timestamp: _timestamp, environment: _environment, source: _source, timestamp_precision: _precision, ...input } = data;
  assert.equal(outreachSchema.safeParse(input).success, true);
  for (const changes of [{ cta_id: 'private@example.com' }, { cta_id: undefined }, { source_event_name: 'foundhers_pitch_view' }, { page_path: '/other' }]) assert.equal(outreachSchema.safeParse({ ...input, ...changes }).success, false);
});
test('status distinguishes actual contact, completion, CTA, engagement and a page load', () => {
  const viewed = summary(PROPOSALS[0].id, { mostRecentActivity: stamp });
  assert.equal(activityStatus(), 'No external activity yet');
  assert.equal(activityStatus(viewed), 'Viewed');
  assert.equal(activityStatus({ ...viewed, status: 'Engaged' }), 'Engaged');
  assert.equal(activityStatus({ ...viewed, visitIpurposeClicked: true }), 'CTA clicked');
  assert.equal(activityStatus({ ...viewed, completed: true }), 'Deck completed');
  assert.equal(activityStatus({ ...viewed, completed: true, contactClicked: true }), 'Contact initiated');
});
test('historical unclassified events remain separate; current period and attributed downstream events are scoped accurately', () => {
  const history = sanitizeHistory({ property: 'properties/1', date: '2026-10-27', endDate: '2026-10-28', timezone: 'America/New_York', dimensions: [], truncated: false,
    rows: [{ dateHourMinute: '202610281200', eventName: 'foundhers_pitch_view', pagePath: '/foundhers-stage', eventCount: 2 }, { dateHourMinute: '202610270900', eventName: 'sdsn_page_view', pagePath: PROPOSALS[0].pagePath, eventCount: 1, 'customEvent:traffic_type': 'external' }],
    engagement: [{ initiativeId: 'foundhers-stage', rows: [{ dateHourMinute: '202610281200', eventName: 'begin_checkout', eventCount: 1 }, { dateHourMinute: '202610270900', eventName: 'view_item', eventCount: 4 }] }],
  });
  const result = historyForFilters(history, { window: '24h', includeInternal: false }, new Date('2026-10-28T16:05:00Z'));
  assert.equal(result.available, true); if (!result.available) return;
  assert.equal(result.rows.length, 0); assert.equal(result.unclassifiedRows?.length, 1);
  assert.equal(result.engagement[0].count, 1); assert.deepEqual(result.engagement[0].events, { begin_checkout: 1 });
});
test('existing Foundhers events are delivered once to the first-party ledger, with no GA4 call or personal fields', () => {
  const descriptors = new Map(['window', 'navigator'].map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  const previousFetch = globalThis.fetch; const sent: OutreachInput[] = []; let gaCalls = 0;
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { location: { pathname: '/foundhers-stage', search: '' }, localStorage: { getItem: () => null }, gtag: () => gaCalls++ } });
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { sendBeacon: () => false } });
  globalThis.fetch = ((_url: string, options: RequestInit) => { sent.push(JSON.parse(options.body as string)); return Promise.resolve(new Response(null, { status: 204 })); }) as typeof fetch;
  try {
    const log = createOutreachLogger(); log('foundhers_pitch_view', {}); log('foundhers_cta_click', { cta_id: 'journey_1', email: 'must-not-persist@example.com' });
    assert.equal(sent.length, 2); assert.equal(sent[0].session_id, sent[1].session_id); assert.equal(sent[1].sequence, 2);
    assert.equal(sent[1].cta_id, 'journey_1'); assert.equal(Object.hasOwn(sent[1], 'email'), false); assert.equal(gaCalls, 0);
    assert.equal(outreachSchema.safeParse(sent[1]).success, true);
  } finally {
    globalThis.fetch = previousFetch;
    for (const [name, descriptor] of descriptors) { if (descriptor) Object.defineProperty(globalThis, name, descriptor); else Reflect.deleteProperty(globalThis, name); }
  }
});

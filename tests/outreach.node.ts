import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { Timestamp, type Firestore } from 'firebase-admin/firestore';
import type { Auth } from 'firebase-admin/auth';
import { outreachSchema, proposalMetadata, windowStart, type OutreachInput } from '../lib/outreach/model';
import { PROPOSALS } from '../lib/outreach/registry';
import { ingestionHandler, outreachAdminHandler } from '../lib/outreach/http';
import { storeOutreachEvent, readOutreach, cleanupOutreachEvents } from '../lib/outreach/service';
import { sanitizeHistory } from '../lib/outreach/history';
import { createOutreachLogger } from '../lib/outreach/client';
const now = new Date('2026-10-28T16:00:00Z');
function input(overrides: Partial<OutreachInput> = {}): OutreachInput {
  return { proposal_id: 'sdsn-ghana-jh', source_event_name: 'sdsn_page_view', event_id: randomUUID(), session_id: randomUUID(),
    client_timestamp: now.toISOString(), page_path: '/partnerships/sdsn/ghana-jh', visit_number: 1, sequence: 1, traffic_type: 'external', debug_mode: false, ...overrides };
}
function fakeDb() {
  const docs = new Map<string, Record<string, unknown>>(); let query: { field: string; op: string; value: Timestamp } | undefined; let maximum = Infinity;
  const db = { collection(collection: string) {
    const chain = {
      doc(id: string) { return { async create(data: Record<string, unknown>) { const key = `${collection}/${id}`; if (docs.has(key)) throw Object.assign(new Error(), { code: 6 }); docs.set(key, { ...data, timestamp: Timestamp.fromDate(now) }); }, async get() { return { data: () => docs.get(`${collection}/${id}`) }; } }; },
      where(field: string, op: string, value: Timestamp) { query = { field, op, value }; return chain; },
      orderBy() { return chain; }, limit(value: number) { maximum = value; return chain; },
      async get() { const rows = [...docs].filter(([key, data]) => key.startsWith(collection + '/') && (!query || (query.op === '<' ? (data[query.field] as Timestamp).toMillis() < query.value.toMillis() : (data[query.field] as Timestamp).toMillis() >= query.value.toMillis()))).slice(0, maximum).map(([key, data]) => ({ data: () => data, ref: key })); query = undefined; maximum = Infinity; return { docs: rows, size: rows.length, empty: !rows.length }; },
    }; return chain;
  }, batch() { const deletes: string[] = []; return { delete(key: string) { deletes.push(key); }, async commit() { deletes.forEach(key => docs.delete(key)); } }; } } as unknown as Firestore;
  return { db, docs };
}
test('registry owns generic metadata and strict schema rejects unknown routes, fields and inconsistent events', () => {
  const data = input(); assert.equal(outreachSchema.safeParse(data).success, true);
  assert.deepEqual(proposalMetadata(data), { proposal_family: 'sdsn', organization: 'SDSN Youth Ghana', recipient_id: 'ghana-jh', deck_variant: 'ghana', event_type: 'page_view' });
  for (const extra of [{ email: 'private@example.com' }, { proposal_id: 'ug-not-live' }, { source_event_name: 'purchase' }, { source_event_name: 'toString' }, { page_path: '/login' }, { slide_number: 1 }, { source_event_name: 'sdsn_slide_view', slide_number: 13 }, { organization: 'arbitrary' }, { full_user_agent: 'browser' }]) assert.equal(outreachSchema.safeParse({ ...data, ...extra }).success, false);
  for (const proposal of PROPOSALS) for (const [name, type] of Object.entries(proposal.events)) assert.equal(outreachSchema.safeParse(input({ proposal_id: proposal.id, page_path: proposal.pagePath, source_event_name: name, ...(type === 'slide_view' ? { slide_number: 12 } : {}), ...(type === 'deck_interaction' ? { interaction_type: 'progress-jump' } : {}) })).success, true);
});
test('ingestion rejects oversized, unknown-field and cross-origin input before storing; preview/debug coerces internal', async () => {
  const stored: OutreachInput[] = []; const handler = ingestionHandler(async data => { stored.push(data); });
  const req = (body: unknown, origin = 'https://example.com', extra = {}) => new Request('https://example.com/api/outreach/event', { method: 'POST', headers: { origin, 'content-type': 'application/json', ...extra }, body: typeof body === 'string' ? body : JSON.stringify(body) });
  assert.equal((await handler(req(input(), 'https://evil.com'))).status, 403);
  assert.equal((await handler(req('x'.repeat(5000)))).status, 413);
  assert.equal((await handler(req({ ...input(), ip: 'private' }))).status, 400);
  assert.equal((await handler(req(input(), 'https://example.com', { 'content-length': '9000' }))).status, 413);
  assert.equal(stored.length, 0);
  assert.equal((await handler(req(input(), 'https://example.com', { referer: 'https://example.com/partnerships/sdsn/ghana-jh?preview=1' }))).status, 204);
  assert.equal(stored[0].traffic_type, 'internal');
  assert.equal((await handler(req(input({ debug_mode: true })))).status, 204); assert.equal(stored[1].traffic_type, 'internal');
  assert.equal((await ingestionHandler(async () => { throw new Error('secret'); })(req(input()))).status, 503);
});
test('ledger deduplicates and stores only allowlisted anonymous fields with authoritative server time', async () => {
  const { db, docs } = fakeDb(); const event = input({ client_timestamp: '2020-01-01T00:00:00Z' });
  assert.deepEqual(await storeOutreachEvent(db, event, 'production'), { duplicate: false });
  assert.deepEqual(await storeOutreachEvent(db, event, 'production'), { duplicate: true }); assert.equal(docs.size, 1);
  const row = [...docs.values()][0]; assert.ok(row.timestamp instanceof Timestamp); assert.equal((row.timestamp as Timestamp).toDate().toISOString(), now.toISOString());
  assert.equal(JSON.stringify(row).includes('email'), false); assert.equal(JSON.stringify(row).includes('user_agent'), false);
  assert.deepEqual(Object.keys(row).sort(), [...Object.keys(event), ...Object.keys(proposalMetadata(event)), 'timestamp', 'environment'].sort());
});
test('external default, environment isolation, per-visit ordering and generic summaries use the same ledger', async () => {
  const { db, docs } = fakeDb(); const event = input();
  await storeOutreachEvent(db, event, 'production');
  await storeOutreachEvent(db, input({ ...event, event_id: randomUUID(), source_event_name: 'sdsn_slide_view', slide_number: 7, sequence: 2 }), 'production');
  await storeOutreachEvent(db, input({ ...event, event_id: randomUUID(), source_event_name: 'sdsn_deck_complete', sequence: 3 }), 'production');
  await storeOutreachEvent(db, input({ traffic_type: 'internal' }), 'production');
  await storeOutreachEvent(db, input(), 'preview');
  const report = await readOutreach(db, { window: 'today', includeInternal: false }, 'production', now);
  assert.equal(report.proposals[0].visits, 1); assert.equal(report.proposals[0].highestSlide, 7); assert.equal(report.proposals[0].status, 'Completed');
  assert.equal(report.recentEvents.length, 3); assert.deepEqual(report.recentEvents.map(e => e.sequence), [1, 2, 3]);
  assert.equal((await readOutreach(db, { window: 'today', includeInternal: true }, 'production', now)).recentEvents.length, 4);
  assert.equal((await readOutreach(db, { window: 'today', proposalId: 'sdsn-africa-lm', includeInternal: true }, 'production', now)).recentEvents.length, 0);
  for (const row of docs.values()) row.timestamp = Timestamp.fromMillis(now.getTime() - 181 * 86400000);
  assert.equal(await cleanupOutreachEvents(db, now), 5); assert.equal(docs.size, 0);
});
test('registered opaque links are proposal-scoped; arbitrary or expired tokens are never stored', async () => {
  const { db, docs } = fakeDb(); const token = 'x'.repeat(43); const { createHash } = await import('node:crypto'); const hash = createHash('sha256').update(token).digest('hex');
  await storeOutreachEvent(db, input({ outreach_id: token }), 'preview'); assert.equal([...docs.values()][0].outreach_id, undefined);
  docs.set(`proposalOutreachLinks/${hash}`, { enabled: true, proposal_id: 'sdsn-ghana-jh', expiresAt: Timestamp.fromMillis(Date.now() + 10000) });
  await storeOutreachEvent(db, input({ outreach_id: token }), 'preview'); assert.equal([...docs.values()].at(-1)?.outreach_id, hash);
});
test('admin endpoint rejects missing, invalid, revoked, disabled and non-admin access; filters are validated', async () => {
  let loads = 0; let actor = { customClaims: { admin: true }, disabled: false }; let claim = true;
  const auth = { async verifyIdToken(token: string, revoked: boolean) { assert.equal(revoked, true); if (token === 'bad') throw new Error(); return { uid: 'private-user', admin: claim }; }, async getUser() { return actor; } } as unknown as Auth;
  const handler = outreachAdminHandler(async () => { loads++; return { auth, read: async filters => filters }; });
  const req = (token = '', query = '') => new Request(`https://example.com/api/admin/proposal-outreach${query}`, { headers: token ? { authorization: `Bearer ${token}` } : {} });
  assert.equal((await handler(req())).status, 401); assert.equal(loads, 0);
  assert.equal((await handler(req('bad'))).status, 401);
  actor.disabled = true; assert.equal((await handler(req('ok'))).status, 403); actor.disabled = false;
  claim = false; assert.equal((await handler(req('ok'))).status, 403); claim = true;
  actor = { customClaims: { admin: false }, disabled: false }; assert.equal((await handler(req('ok'))).status, 403); actor.customClaims.admin = true;
  assert.equal((await handler(req('ok', '?proposal=unknown'))).status, 400);
  const response = await handler(req('ok')); assert.equal(response.status, 200); assert.equal(response.headers.get('cache-control'), 'private, no-store'); assert.equal((await response.json()).includeInternal, false);
});
test('New York day boundaries account for daylight saving; history does not fabricate external visits or seconds', () => {
  assert.equal(windowStart('today', new Date('2026-10-28T16:00:00Z')).toISOString(), '2026-10-28T04:00:00.000Z');
  assert.equal(windowStart('today', new Date('2026-11-01T20:00:00Z')).toISOString(), '2026-11-01T04:00:00.000Z');
  assert.equal(windowStart('today', new Date('2026-03-08T20:00:00Z')).toISOString(), '2026-03-08T05:00:00.000Z');
  const history = sanitizeHistory({ property: 'properties/1', date: '2026-10-28', timezone: 'America/New_York', dimensions: [], truncated: false, rows: [{ dateHourMinute: '202610280917', eventName: 'sdsn_page_view', pagePathPlusQueryString: '/partnerships/sdsn/ghana-jh?email=private', eventCount: 2 }, { dateHourMinute: '202610280918', eventName: 'sdsn_slide_view', pagePathPlusQueryString: '/partnerships/sdsn/ghana-jh?preview=1', eventCount: 1 }] });
  assert.equal(history.rows[0].timestamp_precision, 'minute'); assert.equal(history.rows[0].localMinute, '2026-10-28T09:17'); assert.equal(history.rows[0].traffic_type, 'unknown'); assert.equal(history.rows[1].traffic_type, 'internal'); assert.equal(JSON.stringify(history).includes('private'), false);
});
test('client beacon failure falls back to keepalive; GA readiness is irrelevant and QA signals persist classification', () => {
  const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'window'); const navigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator'); const oldFetch = globalThis.fetch;
  const bodies: any[] = []; let search = ''; const local = new Map();
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { location: { pathname: '/partnerships/sdsn/ghana-jh', get search() { return search; } }, localStorage: { getItem: (key: string) => local.get(key) } } });
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { sendBeacon: () => false } });
  globalThis.fetch = ((_url: string, options: RequestInit) => { assert.equal(options.keepalive, true); bodies.push(JSON.parse(options.body as string)); return Promise.resolve(new Response(null, { status: 204 })); }) as typeof fetch;
  try {
    const log = createOutreachLogger(); log('sdsn_page_view', { visit_number: 2 }); log('sdsn_slide_view', { slide_number: 3 });
    assert.equal(bodies[0].traffic_type, 'external'); assert.equal(bodies[1].sequence, 2); assert.equal(bodies[1].visit_number, 2); assert.equal(bodies[0].session_id, bodies[1].session_id);
    search = '?preview=1'; log('sdsn_page_view', {}); assert.equal(bodies[2].traffic_type, 'internal');
    search = ''; local.set('ipurpose_qa_traffic', '1'); log('sdsn_pdf_download', {}); assert.equal(bodies[3].traffic_type, 'internal');
    log('purchase', {}); assert.equal(bodies.length, 4);
  } finally { globalThis.fetch = oldFetch; if (windowDescriptor) Object.defineProperty(globalThis, 'window', windowDescriptor); else Reflect.deleteProperty(globalThis, 'window'); if (navigatorDescriptor) Object.defineProperty(globalThis, 'navigator', navigatorDescriptor); }
});

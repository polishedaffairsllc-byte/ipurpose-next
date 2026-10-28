import 'server-only';
import { createHash } from 'node:crypto';
import { FieldValue, Timestamp, type Firestore } from 'firebase-admin/firestore';
import { outreachSchema, proposalMetadata, OUTREACH_RETENTION_DAYS, OUTREACH_TIMEZONE, summarize, windowStart, type OutreachEvent, type OutreachFilters, type OutreachInput } from './model';

export const OUTREACH_COLLECTION = 'proposalOutreachEvents';
export const OUTREACH_LINKS_COLLECTION = 'proposalOutreachLinks';
const MAX_ROWS = 10000;
export function outreachEnvironment(): 'preview' | 'production' {
  return process.env.VERCEL_ENV === 'production' ? 'production' : 'preview';
}
export async function storeOutreachEvent(db: Firestore, input: OutreachInput, environment = outreachEnvironment()) {
  const parsed = outreachSchema.parse(input);
  // Only explicitly registered opaque tokens are retained; arbitrary query text never enters the ledger.
  const { outreach_id: token, ...event } = parsed;
  let outreachId: string | undefined;
  if (token) {
    const id = createHash('sha256').update(token).digest('hex');
    const link = await db.collection(OUTREACH_LINKS_COLLECTION).doc(id).get();
    const data = link.data();
    if (data?.enabled === true && data.proposal_id === event.proposal_id && data.expiresAt?.toMillis() > Date.now()) outreachId = id;
  }
  const document = db.collection(OUTREACH_COLLECTION).doc(`${environment}_${event.event_id}`);
  try {
    await document.create({ ...event, ...proposalMetadata(event), ...(outreachId ? { outreach_id: outreachId } : {}), environment, timestamp: FieldValue.serverTimestamp() });
    return { duplicate: false };
  } catch (error) {
    if ((error as { code?: number }).code === 6) return { duplicate: true };
    throw error;
  }
}
export async function cleanupOutreachEvents(db: Firestore, now = new Date(), limit = 200) {
  const cutoff = Timestamp.fromMillis(now.getTime() - OUTREACH_RETENTION_DAYS * 86400000);
  const expired = await db.collection(OUTREACH_COLLECTION).where('timestamp', '<', cutoff).orderBy('timestamp').limit(limit).get();
  if (expired.empty) return 0;
  const batch = db.batch();
  expired.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  return expired.size;
}
export async function readOutreach(db: Firestore, filters: OutreachFilters, environment = outreachEnvironment(), now = new Date()) {
  const start = windowStart(filters.window, now);
  // A single timestamp index avoids a production index migration. Filter before aggregation.
  // Surface the safety cap explicitly rather than silently treating partial results as complete.
  const snapshot = await db.collection(OUTREACH_COLLECTION).where('timestamp', '>=', Timestamp.fromDate(start))
    .orderBy('timestamp', 'desc').limit(MAX_ROWS + 1).get();
  const rows: OutreachEvent[] = [];
  for (const doc of snapshot.docs.slice(0, MAX_ROWS)) {
    const data = doc.data();
    const { timestamp, environment: storedEnvironment, proposal_family: _family, organization: _organization, recipient_id: _recipient, deck_variant: _variant, event_type: _type, ...raw } = data;
    const parsed = outreachSchema.safeParse(raw);
    // Stored outreach_id is a SHA-256 record ID, also valid under the opaque-ID allowlist.
    if (!parsed.success || storedEnvironment !== environment || !(timestamp instanceof Timestamp)) continue;
    if (timestamp.toMillis() > now.getTime()) continue;
    if (!filters.includeInternal && parsed.data.traffic_type !== 'external') continue;
    if (filters.proposalId && parsed.data.proposal_id !== filters.proposalId) continue;
    rows.push({ ...parsed.data, ...proposalMetadata(parsed.data), timestamp: timestamp.toDate().toISOString(), environment, source: 'first-party', timestamp_precision: 'exact' });
  }
  // Order by receipt time across visits; enforce the emitted sequence within each visit.
  // Keep actual server timestamps unchanged even when beacons arrive out of order.
  const visitRows = new Map<string, OutreachEvent[]>();
  for (const row of rows) {
    const group = visitRows.get(row.session_id) || []; group.push(row); visitRows.set(row.session_id, group);
  }
  const order = new Map<string, number>();
  for (const group of visitRows.values()) {
    let last = 0;
    for (const row of group.sort((a, b) => a.sequence - b.sequence)) {
      last = Math.max(last, Date.parse(row.timestamp)); order.set(row.event_id, last);
    }
  }
  rows.sort((a, b) => order.get(a.event_id)! - order.get(b.event_id)! || a.session_id.localeCompare(b.session_id) || a.sequence - b.sequence);
  return {
    generatedAt: now.toISOString(), timezone: OUTREACH_TIMEZONE, externalOnly: !filters.includeInternal,
    environment, window: filters.window, periodStart: start.toISOString(), periodEnd: now.toISOString(),
    proposals: summarize(rows, filters.includeInternal).filter(row => !filters.proposalId || row.proposal_id === filters.proposalId),
    recentEvents: rows, truncated: snapshot.size > MAX_ROWS, retentionDays: OUTREACH_RETENTION_DAYS,
    coverage: 'First-party ledger since installation. Page opened means a page load, not an email open. Visits are anonymous browser visits, not identified people. Summaries cover the selected period and environment only.',
  };
}
export type OutreachReport = Awaited<ReturnType<typeof readOutreach>>;

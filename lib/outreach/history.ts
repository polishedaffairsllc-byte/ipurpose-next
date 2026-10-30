import 'server-only';
import { queryProposalHistory } from '@/lib/launch-metrics/ga4Dashboard';
import { proposalByPath } from './registry';
import { activityMinute } from './activity';
import { windowStart, type OutreachFilters } from './model';
type HistoryQuery = Omit<Awaited<ReturnType<typeof queryProposalHistory>>, 'endDate' | 'engagement'> & Partial<Pick<Awaited<ReturnType<typeof queryProposalHistory>>, 'endDate' | 'engagement'>>;
export function sanitizeHistory(result: HistoryQuery) {
  const rows = result.rows.flatMap(row => {
    const location = String(row.pagePathPlusQueryString || row.pagePath || '');
    const url = new URL(location, 'https://ipurposesoul.com');
    const proposal = proposalByPath(url.pathname);
    if (!proposal || !Object.hasOwn(proposal.events, String(row.eventName))) return [];
    const traffic = row['customEvent:traffic_type'];
    const query = url.searchParams;
    const internal = traffic === 'internal' || query.get('preview') === '1' || query.get('ipurpose_qa') === '1' || query.get('utm_source')?.toLowerCase() === 'codex_qa';
    const trafficType = internal ? 'internal' : traffic === 'external' ? 'external' : 'unknown';
    const recipientKey = query.get('utm_content');
    const attributedRecipient = recipientKey && proposal.recipients && Object.hasOwn(proposal.recipients, recipientKey) ? recipientKey : undefined;
    // minute-level wall-clock value is deliberately NOT fabricated into an exact UTC timestamp.
    const minute = String(row.dateHourMinute);
    if (!/^\d{12}$/.test(minute)) return [];
    const slide = Number(row['customEvent:slide_number']);
    const interaction = row['customEvent:interaction_type'];
    return [{
      source: 'GA4 historical' as const, timestamp_precision: 'minute' as const,
      localMinute: `${minute.slice(0,4)}-${minute.slice(4,6)}-${minute.slice(6,8)}T${minute.slice(8,10)}:${minute.slice(10,12)}`,
      timezone: result.timezone, proposal_id: proposal.id, proposal_family: proposal.family, organization: proposal.organization, recipient_id: proposal.recipientId,
      source_event_name: String(row.eventName), event_type: proposal.events[String(row.eventName)], deck_variant: proposal.deckVariant, page_path: url.pathname,
      traffic_type: trafficType, count: Number(row.eventCount) || 0,
      ...(attributedRecipient ? { recipient_key: attributedRecipient } : {}),
      ...(Number.isInteger(slide) && slide >= 1 && slide <= 12 ? { slide_number: slide } : {}),
      ...(typeof interaction === 'string' && ['prev', 'next', 'pause', 'play', 'fullscreen', 'thumbnail', 'progress-jump', 'tap'].includes(interaction) ? { interaction_type: interaction } : {}),
      ...(typeof row['customEvent:cta_id'] === 'string' && Object.hasOwn(proposal.ctas || {}, row['customEvent:cta_id']) ? { cta_id: String(row['customEvent:cta_id']) } : {}),
    }];
  });
  return {
    available: true as const, date: result.date, endDate: result.endDate || result.date, property: result.property, timezone: result.timezone,
    dimensions: result.dimensions, rows, truncated: result.truncated,
    engagement: (result.engagement || []).map(item => {
      const buckets = item.rows.flatMap(row => {
        const minute = String(row.dateHourMinute);
        if (!/^\d{12}$/.test(minute)) return [];
        return [{ localMinute: `${minute.slice(0,4)}-${minute.slice(4,6)}-${minute.slice(6,8)}T${minute.slice(8,10)}:${minute.slice(10,12)}`, timezone: result.timezone, eventName: String(row.eventName), count: Number(row.eventCount) || 0 }];
      });
      return { initiativeId: item.initiativeId, buckets, ...engagementTotals(buckets) };
    }),
    limitation: 'GA4 rows are aggregate minute buckets, not individual visits. Missing or unset traffic_type cannot reliably separate outreach from QA and is labeled unknown. Historical rows are separate from first-party summaries to prevent double counting. GA4 processing may delay today’s data. No seconds, visit numbers or identities are inferred. Controlled recipient labels may be recovered from personalized link parameters when present.',
  };
}
function engagementTotals(buckets: Array<{ eventName: string; count: number }>) {
  const events: Record<string, number> = {};
  for (const row of buckets) events[row.eventName] = (events[row.eventName] || 0) + row.count;
  return { count: buckets.reduce((sum, row) => sum + row.count, 0), events };
}
const cache = new Map<string, { at: number; data: HistoryReport }>();
export type HistoryReport = (ReturnType<typeof sanitizeHistory> & { unclassifiedRows?: ReturnType<typeof sanitizeHistory>['rows'] }) | { available: false; date: string; rows: []; limitation: string };
export async function getOutreachHistory(filters: Pick<OutreachFilters, 'window'> = { window: '7d' }): Promise<HistoryReport> {
  const now = new Date();
  const date = activityMinute(windowStart(filters.window, now), 'America/New_York').slice(0, 10);
  const endDate = activityMinute(now, 'America/New_York').slice(0, 10);
  const key = filters.window + ':' + date + ':' + endDate;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < 300000) return cached.data;
  let data: HistoryReport;
  try { data = sanitizeHistory(await queryProposalHistory(date, endDate)); }
  catch { data = { available: false, date, rows: [], limitation: 'Historical GA4 recovery is unavailable. No external visits can be inferred from missing data.' }; }
  if (cache.size > 6) cache.clear();
  cache.set(key, { at: Date.now(), data });
  return data;
}

/** Apply the same external-only/proposal scope to historical details as to ledger reads. */
export function historyForFilters(history: HistoryReport, filters: { includeInternal: boolean; proposalId?: string; window?: OutreachFilters['window'] }, now = new Date()): HistoryReport {
  if (!history.available) return history;
  const inPeriod = (row: { localMinute: string; timezone: string | null }) => {
    if (!filters.window) return true;
    if (!row.timezone) return false;
    try { return row.localMinute >= activityMinute(windowStart(filters.window, now), row.timezone) && row.localMinute <= activityMinute(now, row.timezone); } catch { return false; }
  };
  const scoped = history.rows.filter(row => (!filters.proposalId || row.proposal_id === filters.proposalId) && inPeriod(row));
  return {
    ...history,
    rows: scoped.filter(row => filters.includeInternal || row.traffic_type === 'external'),
    unclassifiedRows: filters.includeInternal ? [] : scoped.filter(row => row.traffic_type === 'unknown'),
    engagement: history.engagement.filter(item => !filters.proposalId || item.initiativeId === filters.proposalId).map(item => {
      const buckets = item.buckets.filter(inPeriod);
      return { ...item, buckets, ...engagementTotals(buckets) };
    }),
    limitation: history.limitation + ' Unclassified aggregates, where shown, are labeled separately and never counted as confirmed external activity.',
  };
}

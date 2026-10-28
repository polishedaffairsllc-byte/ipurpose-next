import 'server-only';
import { queryProposalHistory } from '@/lib/launch-metrics/ga4Dashboard';
import { proposalByPath } from './registry';
export function sanitizeHistory(result: Awaited<ReturnType<typeof queryProposalHistory>>) {
  const rows = result.rows.flatMap(row => {
    const location = String(row.pagePathPlusQueryString || row.pagePath || '');
    const url = new URL(location, 'https://ipurposesoul.com');
    const proposal = proposalByPath(url.pathname);
    if (!proposal || !Object.hasOwn(proposal.events, String(row.eventName))) return [];
    const traffic = row['customEvent:traffic_type'];
    const query = url.searchParams;
    const internal = traffic === 'internal' || query.get('preview') === '1' || query.get('ipurpose_qa') === '1' || query.get('utm_source')?.toLowerCase() === 'codex_qa';
    const trafficType = internal ? 'internal' : traffic === 'external' ? 'external' : 'unknown';
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
      ...(Number.isInteger(slide) && slide >= 1 && slide <= 12 ? { slide_number: slide } : {}),
      ...(typeof interaction === 'string' && ['prev', 'next', 'pause', 'play', 'fullscreen', 'thumbnail', 'progress-jump', 'tap'].includes(interaction) ? { interaction_type: interaction } : {}),
    }];
  });
  return {
    available: true, date: result.date, property: result.property, timezone: result.timezone,
    dimensions: result.dimensions, rows, truncated: result.truncated,
    limitation: 'GA4 rows are aggregate minute buckets, not individual visits. Missing or unset traffic_type cannot reliably separate outreach from QA and is labeled unknown. Historical rows are separate from first-party summaries to prevent double counting. GA4 processing may delay today’s data. No seconds, visit numbers or identities are inferred.',
  };
}
let cached: { at: number; data: HistoryReport } | undefined;
export type HistoryReport = ReturnType<typeof sanitizeHistory> | { available: false; date: string; rows: []; limitation: string };
export async function getOutreachHistory(): Promise<HistoryReport> {
  if (cached && Date.now() - cached.at < 300000) return cached.data;
  let data: HistoryReport;
  try { data = sanitizeHistory(await queryProposalHistory()); }
  catch { data = { available: false, date: '2026-10-28', rows: [], limitation: 'Historical GA4 recovery is unavailable. No external visits can be inferred from missing data.' }; }
  cached = { at: Date.now(), data };
  return data;
}

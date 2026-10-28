import { z } from 'zod';
import { PROPOSALS, proposalById, type OutreachEventType } from './registry';
export const OUTREACH_TIMEZONE = 'America/New_York';
export const OUTREACH_RETENTION_DAYS = 180;
export const outreachSchema = z.object({
  proposal_id: z.string().max(100), source_event_name: z.string().max(80),
  event_id: z.uuid(), session_id: z.uuid(), client_timestamp: z.iso.datetime(), page_path: z.string().max(200),
  visit_number: z.number().int().min(1).max(1000000), sequence: z.number().int().min(1).max(1000000),
  slide_number: z.number().int().min(1).max(1000).optional(),
  interaction_type: z.enum(['prev', 'next', 'play', 'pause', 'fullscreen', 'tap', 'progress-jump', 'thumbnail']).optional(),
  method: z.literal('mailto').optional(), traffic_type: z.enum(['internal', 'external']), debug_mode: z.boolean(),
  outreach_id: z.string().regex(/^[A-Za-z0-9_-]{24,96}$/).optional(),
}).strict().superRefine((event, context) => {
  const proposal = proposalById(event.proposal_id);
  const type = proposal?.events[event.source_event_name];
  if (!proposal || !Object.hasOwn(proposal.events, event.source_event_name) || event.page_path !== proposal.pagePath) context.addIssue({ code: 'custom', message: 'Invalid controlled proposal.' });
  if ((type === 'slide_view') !== (event.slide_number !== undefined) || (event.slide_number || 0) > (proposal?.slideCount || 0)) context.addIssue({ code: 'custom', message: 'Invalid slide event.' });
  if ((type === 'deck_interaction') !== (event.interaction_type !== undefined)) context.addIssue({ code: 'custom', message: 'Invalid interaction event.' });
  if (event.method !== undefined && type !== 'contact_click') context.addIssue({ code: 'custom', message: 'Invalid method.' });
});
export type OutreachInput = z.infer<typeof outreachSchema>;
export function proposalMetadata(input: OutreachInput) {
  const proposal = proposalById(input.proposal_id)!;
  return { proposal_family: proposal.family, organization: proposal.organization, recipient_id: proposal.recipientId, deck_variant: proposal.deckVariant, event_type: proposal.events[input.source_event_name] };
}
export type OutreachEvent = OutreachInput & ReturnType<typeof proposalMetadata> & {
  timestamp: string; environment: 'production' | 'preview'; source: 'first-party'; timestamp_precision: 'exact';
};
export type OutreachWindow = 'today' | '24h' | '7d';
export type OutreachFilters = { window: OutreachWindow; proposalId?: string; includeInternal: boolean };
export type ProposalSummary = {
  proposal_id: string; proposal_family: string; organization: string; recipient_id: string; label: string;
  status: 'No external activity yet' | 'No activity yet' | 'Opened' | 'Engaged' | 'Completed';
  firstVisit: string | null; mostRecentActivity: string | null; visits: number; highestSlide: number;
  completed: boolean; pdfDownloaded: boolean; visitIpurposeClicked: boolean; contactClicked: boolean;
};
export function windowStart(window: OutreachWindow, now: Date) {
  if (window !== 'today') return new Date(now.getTime() - (window === '24h' ? 1 : 7) * 86400000);
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: OUTREACH_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const midnight = new Date(`${date}T00:00:00Z`);
  const offset = (at: Date) => {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: OUTREACH_TIMEZONE, timeZoneName: 'longOffset' }).formatToParts(at);
    const match = /GMT([+-])(\d{2}):(\d{2})/.exec(parts.find(p => p.type === 'timeZoneName')?.value || '');
    return match ? (match[1] === '+' ? 1 : -1) * (Number(match[2]) * 60 + Number(match[3])) * 60000 : 0;
  };
  const estimate = new Date(midnight.getTime() - offset(midnight));
  return new Date(midnight.getTime() - offset(estimate));
}
export function summarize(events: OutreachEvent[], includeInternal: boolean): ProposalSummary[] {
  return PROPOSALS.map(proposal => {
    const rows = events.filter(event => event.proposal_id === proposal.id);
    const opened = rows.filter(event => event.event_type === 'page_view');
    const has = (type: OutreachEventType) => rows.some(event => event.event_type === type);
    const completed = has('deck_complete');
    return {
      proposal_id: proposal.id, proposal_family: proposal.family, organization: proposal.organization, recipient_id: proposal.recipientId, label: proposal.label,
      status: completed ? 'Completed' : rows.some(event => ['deck_interaction', 'pdf_download', 'contact_click', 'visit_ipurpose_click', 'overview_download', 'video_click'].includes(event.event_type) || (event.slide_number || 0) > 1) ? 'Engaged' : rows.length ? 'Opened' : includeInternal ? 'No activity yet' : 'No external activity yet',
      firstVisit: opened.map(event => event.timestamp).sort()[0] || null,
      mostRecentActivity: rows.map(event => event.timestamp).sort().at(-1) || null,
      visits: new Set(opened.map(event => event.session_id)).size,
      highestSlide: Math.max(0, ...rows.map(event => event.slide_number || 0)), completed,
      pdfDownloaded: has('pdf_download'), visitIpurposeClicked: has('visit_ipurpose_click'), contactClicked: has('contact_click'),
    };
  });
}
export const eventLabel = (event: { event_type: string; slide_number?: number; interaction_type?: string }) => ({
  page_view: 'Page opened', deck_start: 'Deck started', slide_view: `Slide ${event.slide_number} viewed`,
  deck_interaction: `Deck interaction: ${event.interaction_type}`, deck_complete: 'Deck completed',
  pdf_download: 'PDF downloaded', visit_ipurpose_click: 'Visit iPurpose clicked', contact_click: 'Contact clicked',
  overview_download: 'Overview downloaded', video_click: 'Video clicked',
}[event.event_type] || event.event_type);

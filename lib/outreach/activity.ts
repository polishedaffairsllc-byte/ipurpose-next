import type { ProposalSummary } from './model';
import { DECK_METRICS, PROPOSALS, type OutreachMetric, type Proposal } from './registry';

export type ActivityField = { id: string; label: string; value: string | number | boolean | null; kind?: 'time' };
export type AttributedEngagement = { initiativeId: string; count: number; events: Record<string, number> };
export type HistoricalActivity = { proposal_id: string; localMinute: string; timezone: string | null; traffic_type: string; count: number };
export function activityMinute(date: Date, timezone: string): string {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date).map(part => [part.type, part.value]));
  return parts.year + '-' + parts.month + '-' + parts.day + 'T' + parts.hour + ':' + parts.minute;
}

/** Only confirmed external activity can determine the initial initiative. Ties retain registry order. */
export function latestExternalInitiative(summaries: readonly ProposalSummary[], externalOnly = true, initiatives: readonly Proposal[] = PROPOSALS, historical: readonly HistoricalActivity[] = []): string {
  let selected = initiatives[0]?.id || '';
  let latest = -Infinity;
  for (const initiative of initiatives) {
    const summary = summaries.find(row => row.proposal_id === initiative.id);
    const timestamp = summary?.mostRecentExternalActivity ?? (externalOnly ? summary?.mostRecentActivity : null);
    const time = timestamp ? Date.parse(timestamp) : NaN;
    if (Number.isFinite(time) && time > latest) { selected = initiative.id; latest = time; }
  }
  let historicalBest: HistoricalActivity | undefined;
  for (const initiative of initiatives) for (const row of historical) {
    if (row.proposal_id !== initiative.id || row.traffic_type !== 'external' || !row.timezone || row.count <= 0) continue;
    try {
      const reference = historicalBest?.localMinute || (Number.isFinite(latest) ? activityMinute(new Date(latest), row.timezone) : '');
      if (row.localMinute > reference) { historicalBest = row; selected = initiative.id; }
    } catch { /* An unknown property timezone cannot establish recency. */ }
  }
  return selected;
}

export function activityFields(initiative: Proposal, summary?: ProposalSummary, engagement?: AttributedEngagement): ActivityField[] {
  const counts = summary?.metricCounts;
  const deckEvents = { highestSlide: 'slide_view', completed: 'deck_complete', pdfDownloaded: 'pdf_download', visitIpurposeClicked: 'visit_ipurpose_click', contactClicked: 'contact_click' };
  const configured = initiative.metrics || DECK_METRICS.filter(metric => Object.values(initiative.events).some(type => type === deckEvents[metric as keyof typeof deckEvents]));
  const metricValues: Record<OutreachMetric, ActivityField> = {
    highestSlide: { id: 'highestSlide', label: 'Highest slide reached', value: summary?.highestSlide || null },
    completed: { id: 'completed', label: 'Deck completed', value: summary?.completed ?? false },
    pdfDownloaded: { id: 'pdfDownloaded', label: 'PDF downloaded', value: summary?.pdfDownloaded ?? false },
    visitIpurposeClicked: { id: 'visitIpurposeClicked', label: 'Visit iPurpose / CTA clicked', value: summary?.visitIpurposeClicked ?? false },
    contactClicked: { id: 'contactClicked', label: 'Contact clicked', value: summary?.contactClicked ?? false },
    companionViews: { id: 'companionViews', label: 'Companion page viewed', value: counts?.companionViews ?? 0 },
    compassClicks: { id: 'compassClicks', label: 'Explore Compass clicked', value: counts?.compassClicks ?? 0 },
    clarityClicks: { id: 'clarityClicks', label: 'Clarity Check clicked', value: counts?.clarityClicks ?? 0 },
    otherCtaClicks: { id: 'otherCtaClicks', label: 'Other CTA clicked', value: counts?.otherCtaClicks ?? 0 },
    downstreamEngagement: { id: 'downstreamEngagement', label: 'Downstream engagement (GA4 campaign events)', value: engagement?.count ?? null },
  };
  return [
    { id: 'firstVisit', label: 'First visit', value: summary?.firstVisit ?? null, kind: 'time' },
    { id: 'mostRecentActivity', label: 'Most recent activity', value: summary?.mostRecentActivity ?? null, kind: 'time' },
    { id: 'visits', label: 'Visits', value: summary?.visits ?? 0 },
    ...configured.filter(metric => metric !== 'downstreamEngagement' || !!engagement?.count).map(metric => metricValues[metric]),
  ];
}

export function activityStatus(summary?: ProposalSummary, includeInternal = false): string {
  if (!summary?.mostRecentActivity) return includeInternal ? 'No activity yet' : 'No external activity yet';
  if (summary.contactClicked) return 'Contact initiated';
  if (summary.completed) return 'Deck completed';
  if (summary.visitIpurposeClicked || (summary.metricCounts && summary.metricCounts.compassClicks + summary.metricCounts.clarityClicks + summary.metricCounts.otherCtaClicks > 0)) return 'CTA clicked';
  if (summary.status === 'Engaged') return 'Engaged';
  return 'Viewed';
}

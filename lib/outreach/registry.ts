/** Controlled proposal registry. Adding a family requires no new ledger, API, dashboard or MCP tool. */
export const EVENT_TYPES = ['page_view', 'deck_start', 'slide_view', 'deck_interaction', 'deck_complete', 'pdf_download', 'visit_ipurpose_click', 'contact_click', 'overview_download', 'video_click', 'cta_click'] as const;
export type OutreachEventType = typeof EVENT_TYPES[number];
export type OutreachMetric = 'highestSlide' | 'completed' | 'pdfDownloaded' | 'visitIpurposeClicked' | 'contactClicked' | 'companionViews' | 'compassClicks' | 'clarityClicks' | 'otherCtaClicks' | 'downstreamEngagement';
export type Proposal = {
  id: string; family: string; organization: string; label: string; recipientId: string;
  deckVariant: string; pagePath: string; slideCount: number;
  events: Readonly<Record<string, OutreachEventType>>; internalStorageKeys?: readonly string[];
  campaign?: string; landingPath?: string; source?: string; medium?: string;
  metrics?: readonly OutreachMetric[];
  ctas?: Readonly<Record<string, 'compassClicks' | 'clarityClicks' | 'otherCtaClicks'>>;
};
const sdsnEvents = Object.fromEntries(EVENT_TYPES.filter(type => !['overview_download', 'video_click', 'cta_click'].includes(type)).map(type => [`sdsn_${type}`, type])) as Readonly<Record<string, OutreachEventType>>;
const ugEvents = Object.fromEntries(EVENT_TYPES.filter(type => type !== 'cta_click').map(type => [`ug_${type}`, type])) as Readonly<Record<string, OutreachEventType>>;
export const DECK_METRICS: readonly OutreachMetric[] = ['highestSlide', 'completed', 'pdfDownloaded', 'visitIpurposeClicked', 'contactClicked'];
export const PROPOSALS: readonly Proposal[] = [
  { id: 'sdsn-ghana-jh', family: 'sdsn', organization: 'SDSN Youth Ghana', label: 'Ghana', recipientId: 'ghana-jh', deckVariant: 'ghana', pagePath: '/partnerships/sdsn/ghana-jh', slideCount: 12, internalStorageKeys: ['sdsn_internal_v1'], events: sdsnEvents },
  { id: 'sdsn-africa-lm', family: 'sdsn', organization: 'SDSN Youth Africa', label: 'Africa', recipientId: 'africa-lm', deckVariant: 'africa', pagePath: '/partnerships/sdsn/africa-lm', slideCount: 12, internalStorageKeys: ['sdsn_internal_v1'], events: sdsnEvents },
  { id: 'sdsn-global-partnership', family: 'sdsn', organization: 'SDSN Youth', label: 'Global Partnership', recipientId: 'global-partnership', deckVariant: 'global', pagePath: '/partnerships/sdsn/global-partnership', slideCount: 12, internalStorageKeys: ['sdsn_internal_v1'], events: sdsnEvents },
  { id: 'ug-careers-counselling', family: 'ug', organization: 'University of Ghana', label: 'University of Ghana', recipientId: 'ug-careers-counselling', deckVariant: 'ug', pagePath: '/partnerships/ug/careers-counselling', slideCount: 8, internalStorageKeys: ['sdsn_internal_v1'], events: ugEvents },
  {
    id: 'foundhers-stage', label: 'Found(her)s Stage', family: 'foundhers', organization: 'The Found(her)s Stage',
    recipientId: 'foundhers-stage', deckVariant: 'companion', slideCount: 0,
    pagePath: '/foundhers-stage', landingPath: '/foundhers-stage', campaign: 'foundhers_2026', source: 'foundhers_stage', medium: 'pitch_deck',
    events: { foundhers_pitch_view: 'page_view', foundhers_cta_click: 'cta_click' },
    metrics: ['companionViews', 'compassClicks', 'clarityClicks', 'otherCtaClicks', 'downstreamEngagement'],
    ctas: { hero_explore: 'otherCtaClicks', hero_clarity_check: 'clarityClicks', journey_0: 'clarityClicks', journey_1: 'compassClicks', journey_2: 'otherCtaClicks', journey_3: 'otherCtaClicks', product_0: 'clarityClicks', product_1: 'otherCtaClicks', product_2: 'otherCtaClicks', product_3: 'otherCtaClicks', product_4: 'otherCtaClicks', final_explore: 'otherCtaClicks', final_clarity_check: 'clarityClicks' },
  },
];
export const proposalById = (id: string) => PROPOSALS.find(proposal => proposal.id === id);
export const proposalByPath = (path: string) => PROPOSALS.find(proposal => proposal.pagePath === path);

/** Controlled proposal registry. Adding a family requires no new ledger, API, dashboard or MCP tool. */
export const EVENT_TYPES = ['page_view', 'deck_start', 'slide_view', 'deck_interaction', 'deck_complete', 'pdf_download', 'visit_ipurpose_click', 'contact_click', 'overview_download', 'video_click'] as const;
export type OutreachEventType = typeof EVENT_TYPES[number];
export type Proposal = {
  id: string; family: string; organization: string; label: string; recipientId: string;
  deckVariant: string; pagePath: string; slideCount: number;
  events: Readonly<Record<string, OutreachEventType>>; internalStorageKeys?: readonly string[];
};
const sdsnEvents = Object.fromEntries(EVENT_TYPES.filter(type => !['overview_download', 'video_click'].includes(type)).map(type => [`sdsn_${type}`, type])) as Readonly<Record<string, OutreachEventType>>;
// Only served, explicitly configured proposals can ingest events. UG integration belongs in PR #89 later.
export const PROPOSALS: readonly Proposal[] = [
  { id: 'sdsn-ghana-jh', family: 'sdsn', organization: 'SDSN Youth Ghana', label: 'Ghana', recipientId: 'ghana-jh', deckVariant: 'ghana', pagePath: '/partnerships/sdsn/ghana-jh', slideCount: 12, internalStorageKeys: ['sdsn_internal_v1'], events: sdsnEvents },
  { id: 'sdsn-africa-lm', family: 'sdsn', organization: 'SDSN Youth Africa', label: 'Africa', recipientId: 'africa-lm', deckVariant: 'africa', pagePath: '/partnerships/sdsn/africa-lm', slideCount: 12, internalStorageKeys: ['sdsn_internal_v1'], events: sdsnEvents },
  { id: 'sdsn-global-partnership', family: 'sdsn', organization: 'SDSN Youth', label: 'Global', recipientId: 'global-partnership', deckVariant: 'global', pagePath: '/partnerships/sdsn/global-partnership', slideCount: 12, internalStorageKeys: ['sdsn_internal_v1'], events: sdsnEvents },
];
export const proposalById = (id: string) => PROPOSALS.find(proposal => proposal.id === id);
export const proposalByPath = (path: string) => PROPOSALS.find(proposal => proposal.pagePath === path);

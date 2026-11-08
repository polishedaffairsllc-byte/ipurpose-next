import records from './institutions.json';
export type Institution = typeof records[number];
export const institutions: readonly Institution[] = records;
export const institutionBySlug = (slug: string) => institutions.find(item => item.page_slug === slug);
export const institutionById = (id: string) => institutions.find(item => item.institution_id === id);
export const universitySections = ['context', 'whole-student', 'pathway', 'pilot', 'advisers', 'benefits', 'evaluation', 'safeguards', 'conversation'] as const;
export const newInstitutions = institutions.filter(item => !item.already_contacted);
export const universityEvents = {
  proposal_link_access: 'link_access', proposal_page_view: 'page_view', proposal_section_view: 'section_view',
  proposal_deck_start: 'deck_start', proposal_slide_view: 'slide_view', proposal_deck_interaction: 'deck_interaction', proposal_deck_complete: 'deck_complete', proposal_pdf_download: 'pdf_download',
  proposal_return_visit: 'return_visit', proposal_cta_click: 'cta_click',
  proposal_external_link_click: 'external_link_click', proposal_meeting_request_click: 'meeting_request_click',
} as const;
export function universityDestinations(item: Institution): Record<string, string> {
  return {
    ipurpose: 'https://ipurposesoul.com', founder: 'https://www.mshmltn.com',
    conversation: `mailto:renita@ipurposesoul.com?subject=${encodeURIComponent(`Exploratory student clarity pilot — ${item.institution_name}`)}`,
    ...Object.fromEntries(item.sources.map((source, i) => [`source-${i}`, source.url])),
  };
}

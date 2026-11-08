import records from './institutions.json';
import { universityConversation } from './conversation';
export type Institution = typeof records[number];
export const institutions: readonly Institution[] = records;
/** Preserve historical institutions and their identifiers, but omit these from active outreach. */
export const archivedInstitutionIds = [
  'academic-city-university', 'central-university', 'koforidua-technical-university',
  'lancaster-university-ghana', 'takoradi-technical-university', 'university-of-cape-coast',
  'university-of-health-and-allied-sciences', 'university-of-media-arts-and-communication',
  'university-of-mines-and-technology',
] as const;
export const isArchivedInstitution = (id: string) => (archivedInstitutionIds as readonly string[]).includes(id);
export const activeInstitutions = institutions.filter(item => !isArchivedInstitution(item.institution_id));
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
    conversation: !item.already_contacted && !isArchivedInstitution(item.institution_id)
      ? universityConversation(item.institution_name).href
      : `mailto:renita@ipurposesoul.com?subject=${encodeURIComponent(`Exploratory student clarity pilot — ${item.institution_name}`)}`,
    ...Object.fromEntries(item.sources.map((source, i) => [`source-${i}`, source.url])),
  };
}

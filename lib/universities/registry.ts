import type { Proposal } from '@/lib/outreach/registry';
import { newInstitutions, universitySections, universityEvents, universityDestinations } from './institutions';
export const universityProposals: readonly Proposal[] = newInstitutions.map(item => ({
  id: item.proposal_id, family: 'university', institutionId: item.institution_id,
  organization: item.institution_name, label: item.institution_name, recipientId: item.institution_id,
  deckVariant: 'university-brief', pagePath: item.page_path, slideCount: 0,
  events: universityEvents, sections: universitySections, destinations: universityDestinations(item),
  ctas: { discuss: 'otherCtaClicks' }, metrics: ['rawAccesses', 'pageLoads', 'uniqueSessions', 'repeatVisits', 'qualifiedVisits', 'sectionEngagement', 'meetingRequests', 'externalLinkClicks'],
}));

import type { PartnershipConfig } from './presentation';

const titles = [
  'Extending Career Support Between Coaching Touchpoints',
  'What is iPurpose? Soul → Systems → AI, and its founder',
  'Why KNUST. Why now.',
  'KNUST Career Services stays at the center',
  'Proposed 8-week pilot: up to 40 KNUST students',
  'What KNUST receives, and the role we ask of KNUST',
  'Guardrails: career services, privacy and trust',
  'How we would learn, and the next step',
];
const dwellSeconds = [8, 14, 20, 14, 18, 20, 20, 18];

export const knustConfig: PartnershipConfig = {
  slug: 'knust-career-services', enabled: true, deckVariant: 'knust', analyticsPrefix: 'knust',
  recipientName: 'Mrs. Selina Doe Angmor',
  recipientRole: 'Director, KNUST Career Services Centre',
  h1: 'iPurpose × KNUST',
  sub: 'A discovery pilot to extend career support between Career Services touchpoints',
  deckTitle: titles[0],
  slides: titles.map((title, i) => {
    const src = `/partnerships/knust/career-services/slides/${i + 1}`;
    return { src, srcSet: `${src} 1600w`, title, alt: title, dwellSeconds: dwellSeconds[i] };
  }),
  pdfUrl: '/partnerships/knust/career-services/iPurpose_KNUST_Career_Services_Pilot_Concept.pdf',
  overviewUrl: '/partnerships/knust/career-services/iPurpose_KNUST_Career_Services_One_Page_Overview.pdf',
  contactEmail: 'renita@ipurposesoul.com',
  mailtoSubject: 'iPurpose × KNUST: exploratory conversation',
};

export function isKNUSTPreviewEnabled(_environment = process.env.VERCEL_ENV, _nodeEnvironment = process.env.NODE_ENV) {
  return knustConfig.enabled;
}

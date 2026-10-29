import type { PartnershipConfig } from './presentation';

const titles = [
  'Extending Career Support Between Counselling Touchpoints',
  'What is iPurpose? Soul → Systems → AI, and its founder',
  'Why the University of Ghana. Why now.',
  'UG counsellors stay at the center',
  'Proposed 8-week pilot: up to 40 UG students',
  'What UG receives, and the role we ask of UG',
  'Guardrails: counsellors, privacy and trust',
  'How we would learn, and the next step',
];
const dwellSeconds = [8, 14, 20, 14, 18, 20, 20, 18];

export const ugConfig: PartnershipConfig = {
  slug: 'ug-careers-counselling', enabled: true, deckVariant: 'ug', analyticsPrefix: 'ug',
  recipientName: 'Dr. Gladys Setordzie and Edwina Kuukua Paintsil',
  recipientRole: 'University of Ghana Careers and Counselling Directorate',
  h1: 'iPurpose × University of Ghana',
  sub: 'A discovery pilot to extend career support between counselling touchpoints',
  deckTitle: titles[0],
  slides: titles.map((title, i) => {
    const base = `/partnerships/ug/careers-counselling/slide-${String(i + 1).padStart(2, '0')}`;
    return { src: `${base}.webp`, srcSet: `${base}-1280.webp 1280w, ${base}-1920.webp 1920w, ${base}.webp 2880w`, title, alt: title, dwellSeconds: dwellSeconds[i] };
  }),
  pdfUrl: '/partnerships/ug/careers-counselling/iPurpose_UG_Careers_Counselling_Master.pdf',
  overviewUrl: '/partnerships/ug/careers-counselling/iPurpose_UG_Exists_vs_Pilot_OnePager.pdf',
  // Set videoUrl only when Renita supplies the hosted walkthrough URL.
  contactEmail: 'renita@ipurposesoul.com',
  mailtoSubject: 'iPurpose × University of Ghana: exploratory conversation',
};

export function isUGPreviewEnabled(_environment = process.env.VERCEL_ENV, _nodeEnvironment = process.env.NODE_ENV) {
  return ugConfig.enabled;
}

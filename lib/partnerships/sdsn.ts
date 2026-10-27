export type PresentationSlide = { src: string; srcSet: string; alt: string; dwellSeconds: number };
export type SDSNConfig = {
  slug: string; enabled: boolean; deckVariant: string;
  recipientName: string; recipientRole: string; h1: string; sub: string;
  slides: PresentationSlide[]; pdfUrl?: string; contactEmail: string; mailtoSubject: string;
};
export const SDSN_LABELS = {
  primary: 'Request a 30-minute exploratory conversation',
  secondary: 'Visit iPurpose', tertiary: 'Download PDF',
  contactHeading: "Let's explore this together",
} as const;
const titles = [
  'Ghana Discovery Pilot Partnership Concept', 'Why Ghana. Why now.',
  'Why SDSN Youth Ghana is the right first partner', 'The gap iPurpose is designed to fill',
  'The partnership ask', 'Proposed 8-week pilot', 'What SDSN Youth Ghana receives',
  'What we would ask of SDSN Youth Ghana', 'How success will be measured',
  'Guardrails: student support, privacy and trust', 'A 90-day path to launch', 'Selected sources',
];
const dwellSeconds = [8, 14, 20, 14, 18, 20, 20, 18, 14, 20, 18, 20];
// Original PNG SHA-256 hashes match Ghana for these five slides in both rebuilt decks.
// Reuse the approved Ghana assets in place so their URLs and bytes remain unchanged.
const sharedWithGhana = new Set([2, 4, 9, 10, 12]);
function presentationSlides(slug: string, slideTitles: string[]) {
  return slideTitles.map((alt, i) => {
    const assetSlug = slug !== 'ghana-jh' && sharedWithGhana.has(i + 1) ? 'ghana-jh' : slug;
    const base = `/partnerships/sdsn/${assetSlug}/slide-${String(i + 1).padStart(2, '0')}`;
    return { src: `${base}.webp`, srcSet: `${base}-1280.webp 1280w, ${base}-1920.webp 1920w, ${base}.webp 2880w`, alt, dwellSeconds: dwellSeconds[i] };
  });
}
const ghanaSlides = presentationSlides('ghana-jh', titles);
function recipientTitles(overrides: Record<number, string>) {
  return titles.map((title, i) => overrides[i + 1] ?? title);
}
const africaSlides = presentationSlides('africa-lm', recipientTitles({
  1: 'From Ghana to Africa: A Regional Pilot Concept',
  3: 'Why SDSN Youth Africa is the right regional partner',
  5: 'The partnership ask',
  6: 'Proposed 8-week iPurpose × SDSN Youth Africa Pilot — Ghana launch cohort',
  7: 'What SDSN Youth Africa receives',
  8: 'What we would ask of SDSN Youth Africa',
}));
const globalSlides = presentationSlides('global-partnership', recipientTitles({
  1: 'A Ghana-First Evidence-Building Partnership for Youth Agency and Employability',
  3: 'Why SDSN Youth is the right scaling partner',
  5: 'The partnership ask',
  6: 'Proposed 8-week iPurpose × SDSN Youth Pilot — Ghana launch cohort',
  7: 'What SDSN Youth receives',
  8: 'What we would ask of SDSN Youth',
}));
export const sdsnConfigs: Record<string, SDSNConfig> = {
  'ghana-jh': {
    slug: 'ghana-jh', enabled: true, deckVariant: 'ghana',
    recipientName: 'Johnnie Kojo Hayford', recipientRole: 'Network Coordinator, SDSN Youth Ghana',
    h1: 'iPurpose × SDSN Youth Ghana', sub: 'A Ghana Discovery Pilot partnership concept',
    slides: ghanaSlides, pdfUrl: '/partnerships/sdsn/ghana-jh/iPurpose_SDSN_Youth_Ghana.pdf',
    contactEmail: 'renita@ipurposesoul.com', mailtoSubject: 'iPurpose × SDSN Youth Ghana: exploratory conversation',
  },
  'africa-lm': {
    slug: 'africa-lm', enabled: true, deckVariant: 'africa',
    recipientName: 'Lara Mugala', recipientRole: 'Regional Focal Point, Africa',
    h1: 'iPurpose × SDSN Youth Africa', sub: 'A Ghana-first Discovery Pilot with an Africa replication pathway',
    slides: africaSlides, pdfUrl: '/partnerships/sdsn/africa-lm/iPurpose_SDSN_Youth_Africa_Master.pdf',
    contactEmail: 'renita@ipurposesoul.com', mailtoSubject: 'iPurpose × SDSN Youth Africa: exploratory conversation',
  },
  'global-partnership': {
    slug: 'global-partnership', enabled: true, deckVariant: 'global',
    recipientName: 'SDSN Youth Global Partnerships', recipientRole: '',
    h1: 'iPurpose × SDSN Youth', sub: 'A Ghana-first Discovery Pilot and African replication partnership',
    slides: globalSlides, pdfUrl: '/partnerships/sdsn/global-partnership/iPurpose_SDSN_Youth_Global_Partnership_Master.pdf',
    contactEmail: 'renita@ipurposesoul.com', mailtoSubject: 'iPurpose × SDSN Youth: exploratory conversation',
  },
};
export function getSDSNConfig(slug: string) {
  const config = Object.hasOwn(sdsnConfigs, slug) ? sdsnConfigs[slug] : undefined;
  return config?.enabled ? config : undefined;
}

import deckContent from './sdsn-deck-content.json';

export type PresentationSlide = { src: string; srcSet: string; title: string; alt: string; dwellSeconds: number };
export type SDSNConfig = {
  slug: string; enabled: boolean; deckVariant: string;
  recipientName: string; recipientRole: string; h1: string; sub: string; deckTitle: string;
  slides: PresentationSlide[]; pdfUrl?: string; contactEmail: string; mailtoSubject: string;
};
export const SDSN_LABELS = {
  primary: 'Request a 30-minute exploratory conversation',
  secondary: 'Visit iPurpose', tertiary: 'Download PDF',
  contactHeading: "Let's explore this together",
} as const;
const dwellSeconds = [8, 14, 20, 14, 18, 20, 20, 18, 14, 20, 18, 20];
// Final approved PNG hashes match Ghana for these six slides in both decks.
const sharedWithGhana = new Set([2, 3, 5, 9, 10, 12]);
// Titles and full image alternatives are copied verbatim from the approved build,
// with only layout whitespace normalized. Navigation uses each slide's title.
function presentationSlides(slug: string, content: typeof deckContent.ghana) {
  return content.map(({ title, alt }, i) => {
    const assetSlug = slug !== 'ghana-jh' && sharedWithGhana.has(i + 1) ? 'ghana-jh' : slug;
    const base = `/partnerships/sdsn/${assetSlug}/slide-${String(i + 1).padStart(2, '0')}`;
    return { src: `${base}.webp`, srcSet: `${base}-1280.webp 1280w, ${base}-1920.webp 1920w, ${base}.webp 2880w`, title, alt, dwellSeconds: dwellSeconds[i] };
  });
}
const ghanaSlides = presentationSlides('ghana-jh', deckContent.ghana);
const africaSlides = presentationSlides('africa-lm', deckContent.africa);
const globalSlides = presentationSlides('global-partnership', deckContent.global);
export const sdsnConfigs: Record<string, SDSNConfig> = {
  'ghana-jh': {
    slug: 'ghana-jh', enabled: true, deckVariant: 'ghana',
    recipientName: 'Johnnie Kojo Hayford', recipientRole: 'Network Coordinator, SDSN Youth Ghana',
    h1: 'iPurpose × SDSN Youth Ghana', sub: 'A Discovery Pilot for Ghana’s emerging leaders',
    deckTitle: deckContent.ghana[0].title,
    slides: ghanaSlides, pdfUrl: '/partnerships/sdsn/ghana-jh/iPurpose_SDSN_Youth_Ghana_Master.pdf',
    contactEmail: 'renita@ipurposesoul.com', mailtoSubject: 'iPurpose × SDSN Youth Ghana: exploratory conversation',
  },
  'africa-lm': {
    slug: 'africa-lm', enabled: true, deckVariant: 'africa',
    recipientName: 'Lara Mugala', recipientRole: 'Regional Focal Point, Africa',
    h1: 'iPurpose × SDSN Youth Africa', sub: 'Starting in Ghana, with learning that could inform responsible regional replication',
    deckTitle: deckContent.africa[0].title,
    slides: africaSlides, pdfUrl: '/partnerships/sdsn/africa-lm/iPurpose_SDSN_Youth_Africa_Master.pdf',
    contactEmail: 'renita@ipurposesoul.com', mailtoSubject: 'iPurpose × SDSN Youth Africa: exploratory conversation',
  },
  'global-partnership': {
    slug: 'global-partnership', enabled: true, deckVariant: 'global',
    recipientName: 'SDSN Youth Global Events & Partnerships Team', recipientRole: '',
    h1: 'iPurpose × SDSN Youth', sub: 'A Ghana-first pilot designed to generate evidence and learning for SDSN Youth',
    deckTitle: deckContent.global[0].title,
    slides: globalSlides, pdfUrl: '/partnerships/sdsn/global-partnership/iPurpose_SDSN_Youth_Global_Partnership_Master.pdf',
    contactEmail: 'renita@ipurposesoul.com', mailtoSubject: 'iPurpose × SDSN Youth: exploratory conversation',
  },
};
export function getSDSNConfig(slug: string) {
  const config = Object.hasOwn(sdsnConfigs, slug) ? sdsnConfigs[slug] : undefined;
  return config?.enabled ? config : undefined;
}

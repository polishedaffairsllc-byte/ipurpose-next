import 'server-only';
import type { Firestore } from 'firebase-admin/firestore';
import type { UniversityLink } from './links';
export const PRESENTATION_COLLECTION = 'proposalOutreachPresentations';
export const ASSET_COLLECTION = 'proposalOutreachAssets';
export const PRESENTATION_VERSION = 'reconciled-2026-11-07';
export type UniversityPresentation = {
  institution_id: string; contact_id: string; environment: 'preview'; content_version: string;
  prepared_for: string; source_sha256: string; review_status: 'awaiting_user_approval';
  slides: { number: number; title: string; body: string; paragraphs: string[] }[];
  assets: Record<string, { id: string; sha256: string; bytes: number; content_type: string }>;
  pdf_filename: string;
  draft_context?: string; draft_rationale?: string;
  conversation_box?: [number, number, number, number];
};
export async function privatePresentation(db: Firestore, link: UniversityLink): Promise<UniversityPresentation | null> {
  const data = (await db.collection(PRESENTATION_COLLECTION).doc(`preview_${link.contactId}`).get()).data();
  if (!data || data.environment !== 'preview' || data.institution_id !== link.institution.institution_id || data.contact_id !== link.contactId || data.content_version !== PRESENTATION_VERSION || data.review_status !== 'awaiting_user_approval' || !Array.isArray(data.slides) || data.slides.length !== 8 || data.slides.some((s,i) => s.number !== i+1) || !data.assets) return null;
  return data as UniversityPresentation;
}
export const PRIVATE_ASSET_HEADERS = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff' };

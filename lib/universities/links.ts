import 'server-only';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { Timestamp, type Firestore } from 'firebase-admin/firestore';
import { institutionById, type Institution } from './institutions';
import { PUBLICATION_COLLECTION, type UniversityPublication } from './publication';
export const CONTACT_COLLECTION = 'proposalOutreachContacts';
export const LINK_COLLECTION = 'proposalOutreachLinks';
export const universityEnvironment = () => process.env.VERCEL_ENV === 'production' ? 'production' : 'preview';
export const universityPreviewEnabled = () => universityEnvironment() === 'preview';
export const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');
export type UniversityLink = { token: string; hash: string; institution: Institution; contactId: string; campaignId: string; publication?: UniversityPublication };
export async function resolveUniversityLink(db: Firestore, token: string): Promise<UniversityLink | null> {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const hash = tokenHash(token); const data = (await db.collection(LINK_COLLECTION).doc(hash).get()).data();
  const institution = data && institutionById(data.institution_id);
  if (!institution || institution.already_contacted || data?.environment !== 'preview' || data.enabled !== true || data.proposal_id !== institution.proposal_id || data.review_status !== 'awaiting_user_approval' || !(data.expiresAt instanceof Timestamp) || data.expiresAt.toMillis() <= Date.now() || typeof data.contact_id !== 'string') return null;
  let publication: UniversityPublication | undefined;
  if (!universityPreviewEnabled()) {
    const approved = (await db.collection(PUBLICATION_COLLECTION).doc(hash).get()).data();
    if (!approved || approved.environment !== 'production' || approved.enabled !== true || approved.review_status !== 'approved_for_recipient_access' || !(approved.approvedAt instanceof Timestamp) || !(approved.expiresAt instanceof Timestamp) || approved.expiresAt.toMillis() <= Date.now() || approved.institution_id !== institution.institution_id || approved.contact_id !== data.contact_id || approved.proposal_id !== data.proposal_id || approved.campaign_id !== data.campaign_id || approved.presentation_id !== `preview_${data.contact_id}` || typeof approved.presentation_sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(approved.presentation_sha256)) return null;
    publication = { presentation_id: approved.presentation_id, presentation_sha256: approved.presentation_sha256 };
  }
  return { token, hash, institution, contactId: data.contact_id, campaignId: data.campaign_id, ...(publication ? { publication } : {}) };
}
export const universityInternalRequest = (request: Request) => universityPreviewEnabled() || new URL(request.url).searchParams.get('preview') === '1';
export function trafficClassification(request: Request, internal: boolean, interaction = false) {
  // Examine transient headers only. Never retain the full user agent or IP.
  const hint = [request.headers.get('purpose'), request.headers.get('sec-purpose'), request.headers.get('user-agent')].join(' ');
  if (/prefetch|preview|bot\b|crawler|spider|safelinks|proofpoint|mimecast|barracuda|urlscan/i.test(hint)) return 'likely_automated' as const;
  if (internal) return 'internal' as const;
  return interaction ? 'interactive' as const : 'unclassified' as const;
}
export type ReviewContact = { contact_id: string; institution_id: string; recipient_name: string | null; recipient_email: string | null; primary_office: string | null; verified_source_url: string; source_checked_at: string; contact_status: string; notes: string[] };
export async function seedReviewContact(db: Firestore, contact: ReviewContact) {
  if (!universityPreviewEnabled()) throw new Error('University review seeding is preview-only.');
  const institution = institutionById(contact.institution_id);
  if (!institution || institution.already_contacted) throw new Error('Do not create duplicate initial outreach.');
  const existing = await db.collection(CONTACT_COLLECTION).doc(contact.contact_id).get();
  if (existing.exists) { if (existing.data()?.institution_id !== contact.institution_id) throw new Error('Contact UUID belongs to another institution.'); return; }
  const token = randomBytes(32).toString('base64url');
  const batch = db.batch();
  batch.create(db.collection(CONTACT_COLLECTION).doc(contact.contact_id), { ...contact, environment: 'preview', review_status: 'awaiting_user_approval', sent_status: 'unsent', sent_at: null, follow_up_due_at: null, live_url: null });
  batch.create(db.collection(LINK_COLLECTION).doc(tokenHash(token)), { proposal_id: institution.proposal_id, institution_id: institution.institution_id, contact_id: contact.contact_id, campaign_id: 'university-discovery-2026-11', environment: 'preview', enabled: true, expiresAt: Timestamp.fromMillis(Date.now() + 180 * 86400000), review_status: 'awaiting_user_approval', review_token: token });
  await batch.commit();
}
export function anonymousVisit(cookie: string | undefined) {
  try { const value = JSON.parse(Buffer.from(cookie || '', 'base64url').toString()); if (/^[0-9a-f-]{36}$/.test(value.id) && Number.isInteger(value.number) && value.number >= 1 && value.number < 1000000) return { id: value.id as string, number: value.number + 1 }; } catch { /* Start a new anonymous session. */ }
  return { id: randomUUID(), number: 1 };
}

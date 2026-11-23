import 'server-only';
import type { Firestore } from 'firebase-admin/firestore';
import { institutions, activeInstitutions, isArchivedInstitution } from './institutions';
import { CONTACT_COLLECTION, LINK_COLLECTION, tokenHash, universityEnvironment, resolveUniversityLink } from './links';
import { PRESENTATION_COLLECTION, PRESENTATION_VERSION, type UniversityPresentation } from './presentations';
import { authoredUniversityEmail, draftUniversityEmail } from './drafts';
import { universityRecipientUrl } from './email-links';
import { presentationFingerprint } from './publication';
export async function universityReview(db: Firestore, origin: string) {
  const [contacts, links, presentations] = await Promise.all([
    db.collection(CONTACT_COLLECTION).where('environment', '==', 'preview').limit(250).get(),
    db.collection(LINK_COLLECTION).where('environment', '==', 'preview').limit(250).get(),
    db.collection(PRESENTATION_COLLECTION).where('environment', '==', 'preview').limit(250).get(),
  ]);
  const pendingRows = institutions.flatMap(institution => {
    const matching = contacts.docs.filter(doc => doc.data().institution_id === institution.institution_id && doc.data().contact_status !== 'qa_only');
    const candidates = matching.length ? matching.map(doc => ({ ...doc.data(), contact_id: doc.id })) : [{}];
    return candidates.map(async contact => {
      const c = contact as Record<string, unknown>;
      const link = links.docs.map(doc => ({ id: doc.id, ...doc.data() } as Record<string, unknown>)).find(link => link.contact_id === c.contact_id && link.proposal_id === institution.proposal_id && link.enabled === true && link.review_status === 'awaiting_user_approval' && typeof link.review_token === 'string' && tokenHash(link.review_token) === link.id && typeof (link.expiresAt as { toMillis?: () => number })?.toMillis === 'function' && (link.expiresAt as { toMillis: () => number }).toMillis() > Date.now());
      const token = typeof link?.review_token === 'string' ? link.review_token : null;
      const previewUrl = token ? `${origin}/p/${token}?preview=1` : institution.already_contacted ? `${origin}${institution.page_path}?preview=1` : null;
      const name = typeof c.recipient_name === 'string' ? c.recipient_name : null;
      const presentation = presentations.docs.map(doc => doc.data() as UniversityPresentation).find(deck => deck.contact_id === c.contact_id && deck.institution_id === institution.institution_id && deck.content_version === PRESENTATION_VERSION && deck.review_status === 'awaiting_user_approval') || null;
      const published = token && presentation ? await resolveUniversityLink(db, token, 'production') : null;
      const liveUrl = published?.publication && presentation && presentationFingerprint(presentation) === published.publication.presentation_sha256 ? universityRecipientUrl(token!) : null;
      const draft = presentation?.authored_email && !institution.already_contacted
        ? authoredUniversityEmail(presentation.authored_email, liveUrl)
        : draftUniversityEmail(institution, name, institution.already_contacted ? null : liveUrl, presentation ? { addressee: typeof c.display_addressee === 'string' ? c.display_addressee.replace(/^the /,'') : presentation.prepared_for, context: presentation.draft_context || presentation.slides[2].paragraphs[0], rationale: presentation.draft_rationale || presentation.slides[2]?.paragraphs[1]?.replace(/^Partnership rationale: /,'') || institution.rationale } : undefined);
      return {
        ...institution, publication_status: liveUrl ? 'published' : institution.publication_status, state: typeof c.state === 'string' ? c.state : null, presentation_copy: presentation?.slides || null, pdf_url: token && presentation ? `${origin}/p/${token}/download` : null, presentation_version: presentation?.content_version || null, named_role_verified: c.named_role_verified === true, email_evidence: typeof c.email_evidence === 'string' ? c.email_evidence : null, contact_id: c.contact_id || null, recipient_name: name,
        recipient_email: typeof c.recipient_email === 'string' ? c.recipient_email : null, primary_office: typeof c.primary_office === 'string' ? c.primary_office : institution.primary_office,
        verified_source_url: typeof c.verified_source_url === 'string' ? c.verified_source_url : institution.sources[0].url,
        source_checked_at: typeof c.source_checked_at === 'string' ? c.source_checked_at : '2026-11-07', contact_status: typeof c.contact_status === 'string' ? c.contact_status : (institution.already_contacted ? 'existing_outreach_log_required' : 'needs_research'),
        outreach_token: token, outreach_id: token ? tokenHash(token) : null, preview_url: previewUrl, email_preview_url: liveUrl, live_url: liveUrl,
        email_subject: draft.subject, email_body: draft.body, email_html: 'html' in draft && typeof draft.html === 'string' ? draft.html : undefined, email_release_pending: !institution.already_contacted && !liveUrl, email_kind: draft.kind,
        review_status: liveUrl ? 'approved_for_recipient_access' : 'awaiting_user_approval', sent_status: institution.already_contacted ? 'already_contacted' : typeof c.sent_status === 'string' ? c.sent_status : 'unsent', sent_at: typeof c.sent_at === 'string' ? c.sent_at : null, follow_up_due_at: null,
        analytics_status: institution.already_contacted ? 'existing_tracking_preserved' : liveUrl ? 'production_tracking_ready' : token ? c.analytics_status === 'preview_verified' ? 'preview_verified' : 'preview_link_ready_for_qa' : 'pending_private_link',
        notes: [...institution.notes, ...(Array.isArray(c.notes) ? c.notes : []), ...(institution.already_contacted ? ['No duplicate initial outreach. Existing sent date and recipient link must be reconciled before any follow-up.'] : [])],
      };
    });
  });
  const rows = await Promise.all(pendingRows);
  return { generated_at: new Date().toISOString(), environment: universityEnvironment(), approval_gate: 'Recipient links are available after the exact personalized proposal is published.', counts: { institutions: activeInstitutions.length, new: activeInstitutions.filter(i => !i.already_contacted).length, already_contacted: activeInstitutions.filter(i => i.already_contacted).length, archived: institutions.length-activeInstitutions.length, historical_total: institutions.length }, rows: rows.filter(row => !isArchivedInstitution(row.institution_id)), archived_rows: rows.filter(row => isArchivedInstitution(row.institution_id)).map(row => ({...row, campaign_status:'excluded_from_active_outreach' as const})) };
}
export type UniversityReview = Awaited<ReturnType<typeof universityReview>>;

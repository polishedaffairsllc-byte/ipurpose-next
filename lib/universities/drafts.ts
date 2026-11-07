import type { Institution } from './institutions';
/** Plain-text review artifacts only. This module cannot send or schedule mail. */
export function draftUniversityEmail(institution: Institution, recipientName: string | null, previewUrl: string | null) {
  const greeting = recipientName || (institution.primary_office ? `${institution.primary_office} team` : `${institution.institution_name} team`);
  if (institution.already_contacted) return {
    subject: `Following up: iPurpose student clarity concept — ${institution.institution_name}`,
    body: `Dear ${greeting},\n\nI am following up on the iPurpose concept previously shared with ${institution.institution_name}. I would welcome your perspective on whether a small exploratory student clarity pilot could complement your existing advisers and career support.\n\n${previewUrl ? `The concept is here for reference: ${previewUrl}` : '[Prior recipient link must be reconciled with the existing outreach log before this follow-up is reviewed for sending.]'}\n\nWarm regards,\nRenita Hamilton, MPS\nFounder & CEO, iPurpose`,
    kind: 'follow_up_review_only' as const,
  };
  return {
    subject: `Exploratory student clarity pilot — ${institution.institution_name}`,
    body: `Dear ${greeting},\n\nI’m Renita Hamilton, Founder & CEO of iPurpose. ${institution.context}\n\nI’d welcome your perspective on an exploratory eight-week pilot that could complement your advisers through self-understanding, confidence, agency and practical career planning, with responsible, human-reviewed AI support. ${institution.rationale}\n\nI prepared a short university-specific concept for your consideration: ${previewUrl || '[Private preview link pending verification]'}\n\nThe page includes an invitation to discuss whether this could be useful in your context.\n\nWarm regards,\nRenita Hamilton, MPS\nFounder & CEO, iPurpose`,
    kind: 'initial_review_only' as const,
  };
}
export const reviewExportFields = ['institution_id', 'country', 'institution_name', 'primary_office', 'recipient_name', 'recipient_email', 'verified_source_url', 'source_checked_at', 'page_slug', 'outreach_token', 'preview_url', 'live_url', 'email_subject', 'email_body', 'review_status', 'sent_status', 'sent_at', 'follow_up_due_at', 'analytics_status', 'notes'] as const;
export function reviewCsv(rows: readonly Record<string, unknown>[]) {
  const cell = (value: unknown) => '"' + String(Array.isArray(value) ? value.join('; ') : value ?? '').replace(/^[=+@-]/, match => "'" + match).replaceAll('"', '""') + '"';
  return [reviewExportFields.join(','), ...rows.map(row => reviewExportFields.map(field => cell(row[field])).join(','))].join('\r\n');
}

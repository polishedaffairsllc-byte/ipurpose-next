/** Approved institution-specific conversation copy. Never include recipient or sender personal data. */
export const UNIVERSITY_PARTNERSHIPS_EMAIL = 'partnerships@ipurposesoul.com';
export function universityConversation(institutionName: string) {
  const subject = `iPurpose Partnership Conversation — ${institutionName}`;
  const body = [
    'Dear Ms. Hamilton,', '',
    `Thank you for sharing the iPurpose partnership proposal with ${institutionName}.`, '',
    "I am interested in exploring how the iPurpose approach to student development, personal clarity, and career readiness might align with our institution's priorities.", '',
    'I would welcome an introductory conversation to learn more about the proposed eight-week pilot, potential areas of collaboration, and next steps.', '',
    'Please let me know your availability for an initial discussion.', '',
    'Best regards,',
  ].join('\r\n');
  return { to: UNIVERSITY_PARTNERSHIPS_EMAIL, subject, body,
    href: `mailto:${UNIVERSITY_PARTNERSHIPS_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` };
}

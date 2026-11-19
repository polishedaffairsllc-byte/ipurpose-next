/** Private review links stay on the existing preview branch until publication is approved. */
export const UNIVERSITY_EMAIL_PREVIEW_ORIGIN = 'https://ipurpose-next-git-codex-univ-b93ee5-ipurposes-projects-3d90a718.vercel.app';
export function universityEmailPreviewUrl(token: string) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) throw new Error('Invalid private review token.');
  return `${UNIVERSITY_EMAIL_PREVIEW_ORIGIN}/p/${token}?preview=1`;
}
export function universityEmailParts(body: string): Array<{ text: string; href?: string }> {
  const parts: Array<{ text: string; href?: string }> = [];
  const pattern = /https:\/\/[^\s]+|iPurpose|Renita Hamilton/g;
  let position = 0;
  for (const match of body.matchAll(pattern)) {
    if (match.index! > position) parts.push({ text: body.slice(position, match.index) });
    const text = match[0];
    parts.push({ text, href: text.startsWith('https://') ? text : text === 'iPurpose' ? 'https://ipurposesoul.com' : 'https://www.mshmltn.com' });
    position = match.index! + text.length;
  }
  if (position < body.length) parts.push({ text: body.slice(position) });
  return parts;
}
const escapeHtml = (text: string) => text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
export function universityEmailHtml(body: string) {
  return `<div style="white-space:pre-wrap;font-family:Arial,sans-serif;line-height:1.6">${universityEmailParts(body).map(part => part.href ? `<a href="${escapeHtml(part.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(part.text)}</a>` : escapeHtml(part.text)).join('')}</div>`;
}

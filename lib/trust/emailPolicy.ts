import type { Firestore } from 'firebase-admin/firestore';
import { emailKey, normalizedEmail } from '../clarity/contacts';

export type AuthIdentity = { uid: string; email?: string; emailVerified: boolean; disabled?: boolean };

// A server-owned reachability record. It never writes consent, subscription
// status, opt-out records, or email tasks.
export async function recordAuthEmailStatus(db: Firestore, user: AuthIdentity, now = new Date()) {
  if (!user.email) return;
  const email = normalizedEmail(user.email);
  await db.collection('emailTrust').doc(emailKey(email)).set({ email, kind: 'firebase', uid: user.uid,
    verified: user.emailVerified === true && user.disabled !== true, checkedAt: now }, { merge: true });
}

export function hasExplicitMarketingConsent(value: unknown) {
  if (!value || typeof value !== 'object') return false;
  const consent = value as Record<string, unknown>;
  return consent.granted === true && Boolean(consent.grantedAt)
    && typeof consent.source === 'string' && typeof consent.copyVersion === 'string';
}

export async function marketingEligible(db: Firestore, rawEmail: string) {
  const email = normalizedEmail(rawEmail);
  try {
    const [trust, users, leads] = await Promise.all([
      db.collection('emailTrust').doc(emailKey(email)).get(),
      db.collection('users').where('email', '==', email).get(),
      db.collection('leads').where('email', '==', email).get(),
    ]);
    const status = trust.data();
    if (status?.verified !== true) return false;
    // User docs are writable by their UID in the deployed rules. A forged
    // profile email must not supply another address's marketing permission.
    const accountConsent = status.kind === 'firebase' && users.docs.some(doc => doc.id === status.uid && hasExplicitMarketingConsent(doc.data().marketingConsent));
    const contactConsent = leads.docs.some(doc => hasExplicitMarketingConsent(doc.data().marketingConsent));
    return accountConsent || contactConsent;
  } catch { return false; }
}

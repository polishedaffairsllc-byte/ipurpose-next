import type { Firestore } from 'firebase-admin/firestore';
import { CLARITY_LIFECYCLE_COPY as COPY } from '../../mobile/src/lib/clarityLifecycleCopy';

export async function recordMobileMarketingConsent(db: Firestore, uid: string, email: string,
  input: unknown, now = new Date()) {
  if (!input || typeof input !== 'object') throw new Error(COPY.consentRequired);
  const body = input as Record<string, unknown>;
  if (Object.keys(body).some(key => !['granted', 'copyVersion'].includes(key))
    || body.granted !== true || body.copyVersion !== COPY.consentVersion) throw new Error(COPY.consentRequired);
  const ref = db.collection('users').doc(uid);
  return db.runTransaction(async tx => {
    const user = await tx.get(ref);
    const existing = user.data()?.marketingConsent;
    if (existing?.granted === true) return;
    // Consent does not clear emailOptOut, opt-out records, or subscription status.
    tx.set(ref, { email: email.trim().toLowerCase(), marketingConsent: {
      granted: true, grantedAt: now, source: COPY.consentSource,
      copyVersion: COPY.consentVersion, copy: COPY.consent,
    } }, { merge: true });
  });
}

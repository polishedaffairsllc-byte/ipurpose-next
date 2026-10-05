import { createHash } from 'node:crypto';
import type { Firestore } from 'firebase-admin/firestore';

export function nativeSubmissionId(uid: string, requestId: string) {
  return `mobile_${createHash('sha256').update(`${uid}:${requestId}`).digest('hex')}`;
}
export async function saveNativeSubmission(db: Firestore, uid: string, requestId: string,
  submission: Record<string, unknown>, onboardingRequest: boolean, updatedAt: unknown) {
  const ref = db.collection('clarityCheckSubmissions').doc(nativeSubmissionId(uid, requestId));
  const userRef = db.collection('users').doc(uid);
  const responses = submission.responses as Record<string, number>;
  const fingerprint = JSON.stringify([Array.from({ length: 7 }, (_, i) => responses[String(i + 1)]), submission.identityResponses, onboardingRequest]);
  await db.runTransaction(async tx => {
    const existing = await tx.get(ref);
    const user = await tx.get(userRef);
    if (existing.exists) {
      if (existing.data()?.requestFingerprint !== fingerprint) throw new Error('CLARITY_REQUEST_CONFLICT');
      return;
    }
    const data = user.data() || {};
    const onboarding = data.compassOnboarding && typeof data.compassOnboarding === 'object' ? data.compassOnboarding : {};
    const partial = onboardingRequest && onboarding.status !== 'complete'
      && (onboarding.status === 'in_progress' || !data.archetypePrimary);
    tx.create(ref, { ...submission, uid, requestFingerprint: fingerprint });
    tx.set(userRef, { archetypePrimary: submission.identityType, archetypeSecondary: null,
      archetypeSource: 'clarity_check', archetypeUpdatedAt: updatedAt, updatedAt,
      ...(partial ? { compassOnboarding: { ...onboarding, status: 'in_progress', currentStep: 14,
        claritySubmissionId: ref.id, updatedAt } } : {}) }, { merge: true });
  });
  return ref.id;
}

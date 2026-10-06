import type { Firestore } from 'firebase-admin/firestore';
import { CLARITY_LIFECYCLE_COPY as COPY } from '../../mobile/src/lib/clarityLifecycleCopy';
import { deliverOnce, type TransactionalSender } from './delivery';
import { emailKey, normalizedEmail, resolveContact } from './contacts';

export interface LifecycleInput {
  platform: 'mobile' | 'web'; email: string; name?: string; uid?: string;
  quizSubmissionId: string; identityType?: string; totalScore?: number;
  scores?: Record<string, number>; resultSummary?: string; nextStep?: string;
  contactId?: string;
}
export interface LifecycleDependencies {
  db: Firestore; send: TransactionalSender;
  enroll: (input: { email: string; name: string; submissionId: string; quizSubmissionId: string;
    identityType?: string; totalScore?: number; consentUid?: string }) => Promise<string>;
  webResults: (input: LifecycleInput) => Promise<unknown>;
}

/** Authenticated mobile caller supplies server-derived results and Auth-owned email/name. */
export async function runClarityLifecycle(input: LifecycleInput, deps: LifecycleDependencies) {
  const email = normalizedEmail(input.email);
  const contact = input.contactId ? { id: input.contactId, legacyDuplicateIds: [] as string[] }
    : await resolveContact(deps.db, { email, source: 'clarity-check', name: input.name });
  let enrollment = 'failed';
  if (input.platform === 'mobile') {
    if (!input.uid || !input.quizSubmissionId) throw new Error('Verified account and saved result required');
    const firstName = input.name?.trim().split(/\s+/)[0] || COPY.neutralGreeting;
    const results = [COPY.resultsIntro(firstName), COPY.resultsSaved,
      `${COPY.score}: ${input.totalScore} / 35`,
      ...COPY.dimensions.map((label, index) => `${label}: ${input.scores?.[['internalClarity', 'readinessForSupport', 'frictionBetweenInsightAndAction', 'integrationAndMomentum'][index]]}`),
      `${COPY.identity}: ${input.identityType}`, `${COPY.summary}: ${input.resultSummary}`,
      `${COPY.nextStep}: ${input.nextStep}`,
      `${COPY.resultsLink}: https://ipurposesoul.com/clarity-check/results/${encodeURIComponent(input.quizSubmissionId)}`].join('\n\n');
    await deliverOnce(deps.db, `results_${input.quizSubmissionId}`, { to: email, subject: COPY.resultsSubject, text: results }, input.uid, deps.send);
    await deliverOnce(deps.db, `welcome_${emailKey(email)}`, { to: email, subject: COPY.welcomeSubject, text: COPY.welcomeBody(firstName) }, input.uid, deps.send, new Date(), true);
  }
  try {
    enrollment = await deps.enroll({ email, name: input.name || '', submissionId: contact.id,
      quizSubmissionId: input.quizSubmissionId, identityType: input.identityType, totalScore: input.totalScore,
      ...(input.platform === 'mobile' ? { consentUid: input.uid } : {}) });
  } catch { /* A marketing lookup failure must not prevent saved results or authorize sending. */ }
  if (input.platform === 'web' && input.scores && input.resultSummary && input.nextStep) {
    await deps.webResults({ ...input, email });
  }
  return { contactId: contact.id, enrollment, legacyDuplicateIds: contact.legacyDuplicateIds };
}

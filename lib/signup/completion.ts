import type { Firestore } from 'firebase-admin/firestore';
import type { UserRecord } from 'firebase-admin/auth';
import { accountDeletionLock } from '../accountDeletionLock';
import { AI_CONSENT_NOTICE, AI_CONSENT_VERSION, CompanionSafetyError } from '../ai/companionSafety';
import { SIGNUP_AI_ERROR, SIGNUP_AI_NOTICE, SIGNUP_AI_VERSION } from './disclosure';

// Fixed release boundary, not a moving deployment-time cutoff. Existing accounts
// remain usable after withdrawal; only new incomplete registrations are gated.
export const SIGNUP_REQUIRED_FROM = '2026-10-12T00:00:00.000Z';
export async function requireCompletedSignup(db: Firestore, user: UserRecord) {
  if ((await accountDeletionLock(db, user.uid).get()).exists) throw new CompanionSafetyError('Account deletion is in progress.', 403);
  const created = Date.parse(user.metadata.creationTime);
  if (!Number.isFinite(created)) throw new CompanionSafetyError('Unable to verify account setup. Please retry.', 503);
  if (created < Date.parse(SIGNUP_REQUIRED_FROM)) return;
  const consent = (await db.collection('users').doc(user.uid).collection('consents').doc('compassAi').get()).data();
  if (!consent?.signupCompletedAt) throw new CompanionSafetyError('Finish account setup and save AI permission before continuing.', 409);
}

/** Atomic profile + versioned grant + completion; no OpenAI/Stripe/email call. */
export async function completeSignup(db: Firestore, user: UserRecord, input: unknown, verifyIdentity: () => Promise<UserRecord>) {
  const body = input as { granted?: unknown; version?: unknown } | null;
  if (body?.granted !== true || body.version !== SIGNUP_AI_VERSION || SIGNUP_AI_VERSION !== AI_CONSENT_VERSION) {
    throw new CompanionSafetyError(SIGNUP_AI_ERROR, 400);
  }
  const parent = db.collection('users').doc(user.uid);
  const permission = parent.collection('consents').doc('compassAi');
  await db.runTransaction(async tx => {
    const [deleting, profile, prior] = await Promise.all([tx.get(accountDeletionLock(db, user.uid)), tx.get(parent), tx.get(permission)]);
    if (deleting.exists) throw new CompanionSafetyError('Account deletion is in progress.', 409);
    // Recheck Auth on every transaction attempt, including a retry after
    // concurrent deletion. Do not recreate a profile for a deleted identity.
    const fresh = await verifyIdentity();
    if (fresh.uid !== user.uid || fresh.metadata.creationTime !== user.metadata.creationTime) throw new CompanionSafetyError('Your signed-in identity changed. Please retry.', 409);
    const data = prior.data();
    // A response lost after success must be recoverable without re-granting a
    // permission subsequently withdrawn on another device.
    if (data?.signupCompletedAt) return;
    const now = new Date();
    tx.set(parent, { ...(profile.exists ? {} : { createdAt: now }),
      email: (user.email || '').trim().toLowerCase(), updatedAt: now }, { merge: true });
    tx.set(permission, { granted: true, version: AI_CONSENT_VERSION, provider: 'OpenAI',
      notice: AI_CONSENT_NOTICE, updatedAt: now, signupCompletedAt: now,
      signupNotice: SIGNUP_AI_NOTICE, signupNoticeVersion: SIGNUP_AI_VERSION }, { merge: true });
  });
  await requireCompletedSignup(db, user);
  return { completed: true, version: SIGNUP_AI_VERSION };
}

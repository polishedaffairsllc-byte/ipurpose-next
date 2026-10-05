import type { Firestore } from 'firebase-admin/firestore';

export interface TransactionalEmail { to: string; subject: string; text: string; }
export type TransactionalSender = (email: TransactionalEmail, key: string) => Promise<string>;
const LEASE_MS = 60_000;
// Resend retains keys for 24h. Never blindly retry an ambiguous delivery after that window.
const RETRY_WINDOW_MS = 23 * 60 * 60 * 1000;

export async function deliverOnce(db: Firestore, id: string, message: TransactionalEmail,
  uid: string, send: TransactionalSender, now = new Date(), skipPriorWebWelcome = false) {
  const ref = db.collection('clarityDeliveries').doc(id);
  const claim = await db.runTransaction(async tx => {
    const snapshot = await tx.get(ref);
    const user = await tx.get(db.collection('users').doc(uid));
    // Account deletion must not allow a stale retry snapshot to recreate delivery work.
    if (!user.exists) return null;
    const data = snapshot.data();
    if (data?.status === 'sent' || data?.status === 'skipped_prior_web_welcome') return null;
    if (data?.leaseUntilMs > now.getTime()) return null;
    if (data?.firstAttemptMs && now.getTime() - data.firstAttemptMs >= RETRY_WINDOW_MS) {
      tx.set(ref, { status: 'needs_review', leaseUntilMs: 0 }, { merge: true });
      return null;
    }
    if (!data && skipPriorWebWelcome) {
      const previous = await tx.get(db.collection('emailTasks').where('email', '==', message.to).limit(1));
      if (!previous.empty) {
        tx.set(ref, { uid, email: message.to, status: 'skipped_prior_web_welcome', createdAt: now });
        return null;
      }
    }
    const savedMessage = (data?.message || message) as TransactionalEmail;
    tx.set(ref, { uid, email: message.to, message: savedMessage, status: 'sending',
      firstAttemptMs: data?.firstAttemptMs || now.getTime(), leaseUntilMs: now.getTime() + LEASE_MS,
      updatedAt: now }, { merge: true });
    return savedMessage;
  });
  if (!claim) return 'already_claimed' as const;
  try {
    const providerId = await send(claim, `clarity/${id}`);
    await ref.set({ status: 'sent', providerId, leaseUntilMs: 0, sentAt: now }, { merge: true });
    return 'sent' as const;
  } catch {
    // Retain the immutable payload/key even when acceptance is uncertain.
    await ref.set({ status: 'retry_pending', leaseUntilMs: 0, updatedAt: now }, { merge: true });
    return 'retry_pending' as const;
  }
}

/** Retry only new, recorded transactional work; never scan historical quiz completions. */
export async function retryTransactionalDeliveries(db: Firestore, send: TransactionalSender, now = new Date()) {
  const [pending, interrupted] = await Promise.all([
    db.collection('clarityDeliveries').where('status', '==', 'retry_pending').limit(50).get(),
    db.collection('clarityDeliveries').where('status', '==', 'sending').limit(50).get(),
  ]);
  let processed = 0;
  for (const document of [...pending.docs, ...interrupted.docs]) {
    const data = document.data();
    if (data.message && typeof data.uid === 'string') {
      const result = await deliverOnce(db, document.id, data.message, data.uid, send, now);
      if (result === 'sent') processed++;
    }
  }
  return processed;
}

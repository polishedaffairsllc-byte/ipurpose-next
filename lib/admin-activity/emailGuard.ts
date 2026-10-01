import type { DocumentReference, Firestore } from 'firebase-admin/firestore';

/** Re-check immediately before delivery: a scheduler snapshot may predate an admin purge. */
export async function canDeliverQueuedEmail(db: Firestore, ref: DocumentReference, email: string): Promise<boolean> {
  try {
    const key = Buffer.from(email.trim().toLowerCase()).toString('base64');
    const [current, suppression] = await Promise.all([ref.get(), db.collection('email_opt_outs').doc(key).get()]);
    return current.exists && current.data()?.status === 'pending' && !suppression.exists;
  } catch {
    return false;
  }
}

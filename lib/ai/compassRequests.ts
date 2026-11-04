import { accountDeletionLock } from '../accountDeletionLock';
import { createHash } from 'node:crypto';
import type { Firestore } from 'firebase-admin/firestore';
import { CompanionSafetyError } from './companionSafety';

export interface CompassReply {
  response: string; conversationId: string; assistantMessageId: string;
  responseMode: string; model: string; inferredLens?: string;
}
export function compassRequestRef(db: Firestore, uid: string, id: string) {
  return db.collection('users').doc(uid).collection('compassRequests').doc(id);
}
export function requestFingerprint(input: unknown) { return createHash('sha256').update(JSON.stringify(input)).digest('hex'); }

/** No lease expiry/replay: an uncertain provider call must never run twice. */
export async function reserveCompassRequest(db: Firestore, uid: string, id: string, fingerprint: string): Promise<CompassReply | null> {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) throw new CompanionSafetyError('Invalid message request identifier.', 400);
  return db.runTransaction(async tx => {
    const [deleting, profile] = await Promise.all([tx.get(accountDeletionLock(db, uid)), tx.get(db.collection('users').doc(uid))]);
    if (deleting.exists || !profile.exists) throw new CompanionSafetyError('Account deletion is in progress or your profile is unavailable.', 403);
    const ref = compassRequestRef(db, uid, id);
    const previous = (await tx.get(ref)).data();
    if (previous) {
      if (previous.fingerprint !== fingerprint) throw new CompanionSafetyError('This request identifier belongs to a different message.', 409);
      if (previous.status === 'completed') return previous.reply as CompassReply;
      if (previous.status === 'pending') throw new CompanionSafetyError('This message is still being processed. Your draft is kept; try checking again shortly.', 409);
      if (!previous.retryable) throw new CompanionSafetyError('The earlier AI request could not finish safely. Your draft is kept. Edit the message before starting another request.', previous.errorStatus || 503);
    }
    tx.set(ref, { fingerprint, status: 'pending', createdAt: new Date() });
    return null;
  });
}
export async function failCompassRequest(db: Firestore, uid: string, id: string, retryable: boolean, errorStatus: number) {
  const ref = compassRequestRef(db, uid, id);
  await db.runTransaction(async tx => {
    if ((await tx.get(accountDeletionLock(db, uid))).exists) return;
    const previous = (await tx.get(ref)).data();
    if (previous?.status === 'pending') tx.set(ref, { status: 'failed', retryable, errorStatus, finishedAt: new Date() }, { merge: true });
  });
}

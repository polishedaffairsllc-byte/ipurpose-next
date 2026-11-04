import { createHash } from 'node:crypto';
import type { Firestore } from 'firebase-admin/firestore';

/** Private tombstone survives recursive user deletion until Auth is removed. */
export function accountDeletionLock(db: Firestore, uid: string) {
  return db.collection('accountDeletionLocks').doc(createHash('sha256').update(uid).digest('hex'));
}

import type { Firestore } from 'firebase-admin/firestore';

/** Claim pending purchases atomically; callers must first verify email ownership. */
export async function claimPendingPurchase(db: Firestore, emailHash: string, uid: string, timestamp: unknown): Promise<boolean> {
  const pendingRef = db.collection('pending_entitlements').doc(emailHash);
  const userRef = db.collection('users').doc(uid);
  return db.runTransaction(async tx => {
    const pendingSnap = await tx.get(pendingRef);
    if (!pendingSnap.exists) return false;
    const pending = pendingSnap.data();
    const entitlements = pending?.entitlements || {};
    if (pending?.claimed === true || Object.keys(entitlements).length === 0) return false;
    const userSnap = await tx.get(userRef);
    const existing = userSnap.data()?.entitlements || {};
    tx.set(userRef, { entitlements: { ...existing, ...entitlements }, updatedAt: timestamp }, { merge: true });
    tx.set(pendingRef, { claimed: true, claimedAt: timestamp, claimedByUid: uid }, { merge: true });
    return true;
  });
}

/** Add one paid session without reopening a previously claimed duplicate. */
export async function recordPendingPurchase(db: Firestore, emailHash: string, order: {email: string; sessionId: string; entitlementKey: string; product: string; cohort: string}, timestamp: unknown): Promise<boolean> {
  const ref = db.collection('pending_entitlements').doc(emailHash);
  return db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    const existing = snap.data() || {};
    const sessions: string[] = Array.isArray(existing.sessions) ? existing.sessions : [];
    if (sessions.includes(order.sessionId)) return false;
    tx.set(ref, {email:order.email, entitlements:{...(existing.entitlements || {}),[order.entitlementKey]:true}, sessions:[...sessions,order.sessionId], product:order.product, cohort:order.cohort, updatedAt:timestamp, claimed:false}, {merge:true});
    return true;
  });
}

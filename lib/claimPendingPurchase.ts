import type { Firestore } from 'firebase-admin/firestore';
import { canGrantWebsiteOrder } from './websiteOrder';

/** Claim pending purchases atomically; callers must first verify email ownership. */
export async function claimPendingPurchase(db: Firestore, emailHash: string, uid: string, timestamp: unknown): Promise<boolean> {
  const pendingRef = db.collection('pending_entitlements').doc(emailHash);
  const userRef = db.collection('users').doc(uid);
  return db.runTransaction(async tx => {
    const pendingSnap = await tx.get(pendingRef);
    if (!pendingSnap.exists) return false;
    const pending = pendingSnap.data();
    if (!pending || pending.claimed === true) return false;
    const enabled = Object.entries(pending.entitlements || {}).filter(([, granted]) => granted === true);
    const knownOrders = pending.purchaseSessionIds || {};
    const legacySession = Array.isArray(pending.sessions) && pending.sessions.length === 1 ? pending.sessions[0] : undefined;
    const eligible = await Promise.all(enabled.map(async ([key]) => {
      const sessionId = knownOrders[key] ?? (key === 'deepen' ? pending.deepenPurchaseSessionId : undefined) ?? legacySession;
      const canGrant = typeof sessionId !== 'string' || await canGrantWebsiteOrder(tx, db, sessionId);
      return { key, sessionId, canGrant };
    }));

    const userSnap = await tx.get(userRef);
    const user = userSnap.data();
    const existing = user?.entitlements || {};
    const grants = eligible.filter(({ key, canGrant }) => canGrant && !(key === 'deepen' && existing.deepen === true && user?.deepenPurchaseSessionId));
    if (grants.length === 0) return false;
    const entitlements = Object.fromEntries(grants.map(({ key }) => [key, true]));
    const provenance = Object.fromEntries(grants.filter(({ sessionId }) => typeof sessionId === 'string')
      .map(({ key, sessionId }) => [`${key}PurchaseSessionId`, sessionId]));
    tx.set(userRef, {
      entitlements: { ...existing, ...entitlements },
      ...provenance,
      updatedAt: timestamp,
    }, { merge: true });
    tx.set(pendingRef, { claimed: true, claimedAt: timestamp, claimedByUid: uid }, { merge: true });
    return true;
  });
}

/** Add one paid session without reopening a previously claimed duplicate. */
export async function recordPendingPurchase(db: Firestore, emailHash: string, order: {email: string; sessionId: string; entitlementKey: string; product: string; cohort: string; subscriptionId?: string}, timestamp: unknown): Promise<boolean> {
  const ref = db.collection('pending_entitlements').doc(emailHash);
  return db.runTransaction(async tx => {
    const [snap, canGrant] = await Promise.all([
      tx.get(ref), canGrantWebsiteOrder(tx, db, order.sessionId, order.subscriptionId),
    ]);
    if (!canGrant) return false;
    const existing = snap.data() || {};
    const sessions: string[] = Array.isArray(existing.sessions) ? existing.sessions : [];
    if (sessions.includes(order.sessionId)) return false;
    tx.set(ref, {
      email: order.email,
      entitlements: { ...(existing.entitlements || {}), [order.entitlementKey]: true },
      sessions: [...sessions, order.sessionId],
      purchaseSessionIds: { ...existing.purchaseSessionIds, [order.entitlementKey]: order.sessionId },
      product: order.product,
      cohort: order.cohort,
      ...(order.entitlementKey === 'deepen' ? { deepenPurchaseSessionId: order.sessionId } : {}),
      updatedAt: timestamp,
      claimed: false,
    }, { merge: true });
    return true;
  });
}

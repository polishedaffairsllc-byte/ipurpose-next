import type { Firestore } from 'firebase-admin/firestore';
import crypto from 'crypto';
import { isDeepenTier } from './deepenEntitlement';

/** Revoke only where a single stored Deepen order identifies the current access. */
export async function reconcileDeepenCancellation(
  db: Firestore,
  customerId: string,
  subscriptionId: string,
  timestamp: unknown,
  stripeStatus = 'canceled',
) {
  const orders = db.collection('enrollments')
    .where('stripeCustomerId', '==', customerId)
    .where('product', '==', 'deepen_membership')
    .limit(2);
  const reviewRef = db.collection('subscription_reconciliation').doc(subscriptionId);

  return db.runTransaction(async tx => {
    const ordersSnap = await tx.get(orders);
    if (ordersSnap.size !== 1) {
      tx.set(reviewRef, { status: 'needs_review', reason: 'order_not_unique', stripeStatus, stripeCustomerId: customerId, updatedAt: timestamp }, { merge: true });
      return 'needs_review';
    }

    const order = ordersSnap.docs[0];
    const orderData = order.data();
    if (orderData.stripeSubscriptionId && orderData.stripeSubscriptionId !== subscriptionId) {
      tx.set(reviewRef, { status: 'needs_review', reason: 'order_subscription_mismatch', stripeStatus, stripeCustomerId: customerId, updatedAt: timestamp }, { merge: true });
      return 'needs_review';
    }
    const email = String(orderData.email || '').trim().toLowerCase();
    if (!email) {
      tx.set(reviewRef, { status: 'needs_review', reason: 'missing_email', stripeStatus, stripeCustomerId: customerId, updatedAt: timestamp }, { merge: true });
      return 'needs_review';
    }

    const users = db.collection('users').where('email', '==', email).limit(2);
    const pendingRef = db.collection('pending_entitlements').doc(crypto.createHash('sha256').update(email).digest('hex'));
    const [userSnap, pendingSnap] = await Promise.all([tx.get(users), tx.get(pendingRef)]);
    const pending = pendingSnap.data();
    const user = userSnap.docs.length === 1 ? userSnap.docs[0] : undefined;
    const data = user?.data();
    const pendingMatch = pending?.deepenPurchaseSessionId != null
      ? pending.deepenPurchaseSessionId === order.id
      : Array.isArray(pending?.sessions) && pending.sessions.length === 1 && pending.sessions[0] === order.id;
    const userMatch = data?.deepenPurchaseSessionId != null
      ? data.deepenPurchaseSessionId === order.id
      : (isDeepenTier(data?.entitlement?.tier) && data?.entitlement?.checkoutSessionId === order.id)
        || (pendingMatch && pending?.claimed === true && pending.claimedByUid === user?.id);

    if (userSnap.docs.length > 1 || (!userMatch && !pendingMatch)) {
      tx.set(reviewRef, { status: 'needs_review', reason: 'access_not_unambiguous', stripeStatus, stripeCustomerId: customerId, updatedAt: timestamp }, { merge: true });
      return 'needs_review';
    }

    if (userMatch && user && data) {
      const independentTier = [data.membership?.tier, data.tier]
        .find(tier => tier && !isDeepenTier(tier)) ?? 'FREE';
      tx.set(user.ref, {
        entitlements: { ...(data.entitlements || {}), deepen: false },
        ...(isDeepenTier(data.entitlement?.tier)
          ? { entitlement: { ...data.entitlement, status: 'cancelled', tier: 'FREE' } }
          : {}),
        ...(isDeepenTier(data.entitlementTier) ? { entitlementTier: independentTier } : {}),
        ...(isDeepenTier(data.tier) ? { tier: 'FREE' } : {}),
        ...(isDeepenTier(data.membership?.tier)
          ? { membership: { ...data.membership, status: 'cancelled', tier: 'FREE' } }
          : {}),
        updatedAt: timestamp,
      }, { merge: true });
    }

    if (pendingMatch) {
      tx.set(pendingRef, {
        entitlements: { ...(pending?.entitlements || {}), deepen: false },
        updatedAt: timestamp,
      }, { merge: true });
    }

    tx.set(order.ref, { subscriptionStatus: 'cancelled', updatedAt: timestamp }, { merge: true });
    tx.set(reviewRef, { status: 'reconciled', stripeStatus, updatedAt: timestamp }, { merge: true });
    return 'reconciled';
  });
}

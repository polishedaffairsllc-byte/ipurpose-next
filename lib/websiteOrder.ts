import type { Firestore, Transaction } from 'firebase-admin/firestore';

export async function canGrantWebsiteOrder(tx: Transaction, db: Firestore, sessionId: string, subscriptionId?: string) {
  const order = await tx.get(db.collection('enrollments').doc(sessionId));
  const record = order.data();
  if (String(record?.refundStatus ?? '').startsWith('full_') || record?.subscriptionStatus === 'cancelled') return false;
  const stripeSubscriptionId = subscriptionId ?? record?.stripeSubscriptionId;
  if (typeof stripeSubscriptionId !== 'string') return true;
  const subscription = await tx.get(db.collection('subscription_reconciliation').doc(stripeSubscriptionId));
  return subscription.data()?.stripeStatus !== 'canceled';
}

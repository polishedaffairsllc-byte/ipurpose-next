import type { Firestore } from 'firebase-admin/firestore';
import crypto from 'crypto';

/** A full refund revokes only an unambiguous single order; uncertain history is held for review. */
export async function reconcileRefund(db: Firestore, order: {sessionId:string; email:string; product:string; entitlementKey:string; amountRefunded:number; full:boolean}, timestamp: unknown) {
 const normalized=order.email.trim().toLowerCase();
 const pendingRef=db.collection('pending_entitlements').doc(crypto.createHash('sha256').update(normalized).digest('hex'));
 const orderRef=db.collection('enrollments').doc(order.sessionId);
 const users=db.collection('users').where('email','==',normalized).limit(2);
 const orders=db.collection('enrollments').where('email','==',normalized).where('product','==',order.product).limit(2);
 return db.runTransaction(async tx=>{
  const [pendingSnap,userSnap,orderSnap,orderMatches]=await Promise.all([tx.get(pendingRef),tx.get(users),tx.get(orderRef),tx.get(orders)]);
  const existing=orderSnap.data();
  const pending=pendingSnap.data();
  const matchingOrders=orderMatches.docs;
  // The previous code did not store a complete provenance ledger; never revoke on ambiguous evidence.
  const exact=existing?.product===order.product && String(existing?.email || '').trim().toLowerCase()===normalized;
  const unique=matchingOrders.length===1 && matchingOrders[0].id===order.sessionId && userSnap.docs.length<=1;
  let status=order.full?'full_review':'partial_review';
  if(order.full && exact && unique){
   const user=userSnap.docs[0];
   const userData=user?.data();
   const userMatches=userData?.[`${order.entitlementKey}PurchaseSessionId`]===order.sessionId || userData?.entitlement?.checkoutSessionId===order.sessionId;
   const pendingSessions=Array.isArray(pending?.sessions)?pending.sessions:[];
   const pendingMatches=pendingSessions.length===1 && pendingSessions[0]===order.sessionId;
   if(userMatches){
    const updated={...(userData.entitlements || {}),[order.entitlementKey]:false};
    const tierMatches=userData.entitlement?.checkoutSessionId===order.sessionId;
    tx.set(user.ref,{entitlements:updated,...(tierMatches?{entitlement:{...userData.entitlement,status:'refunded'}}:{}),updatedAt:timestamp},{merge:true});
   }
   if(pendingMatches) tx.set(pendingRef,{entitlements:{...(pending?.entitlements || {}),[order.entitlementKey]:false},updatedAt:timestamp},{merge:true});
   if(userMatches||pendingMatches) status='full_reconciled';
  }
  tx.set(orderRef,{refundStatus:status,refundAmount:order.amountRefunded,updatedAt:timestamp},{merge:true});
  return status;
 });
}

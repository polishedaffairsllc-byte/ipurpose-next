import type { Firestore } from 'firebase-admin/firestore';
import crypto from 'crypto';

/** Revoke only where a single stored Deepen order identifies the current access. */
export async function reconcileDeepenCancellation(db:Firestore, customerId:string, subscriptionId:string, timestamp:unknown) {
 const orders = await db.collection('enrollments').where('stripeCustomerId','==',customerId).where('product','==','deepen_membership').limit(2).get();
 const reviewRef=db.collection('subscription_reconciliation').doc(subscriptionId);
 if(orders.size!==1){await reviewRef.set({status:'needs_review',reason:'order_not_unique',stripeCustomerId:customerId,updatedAt:timestamp},{merge:true});return 'needs_review';}
 const order=orders.docs[0];const email=String(order.data().email||'').trim().toLowerCase();
 if(!email){await reviewRef.set({status:'needs_review',reason:'missing_email',stripeCustomerId:customerId,updatedAt:timestamp},{merge:true});return 'needs_review';}
 const users=db.collection('users').where('email','==',email).limit(2);const pendingRef=db.collection('pending_entitlements').doc(crypto.createHash('sha256').update(email).digest('hex'));
 return db.runTransaction(async tx=>{
  const [userSnap,pendingSnap,orderSnap]=await Promise.all([tx.get(users),tx.get(pendingRef),tx.get(order.ref)]);
  const pending=pendingSnap.data();const orderData=orderSnap.data();
  const user=userSnap.docs.length===1?userSnap.docs[0]:undefined;const data=user?.data();
  const userMatch=data?.deepenPurchaseSessionId===order.id || (data?.entitlement?.checkoutSessionId===order.id && String(data?.entitlement?.tier||'').toUpperCase()==='DEEPENING');
  const pendingMatch=Array.isArray(pending?.sessions)&&pending.sessions.length===1&&pending.sessions[0]===order.id;
  if(!orderData||(!userMatch&&!pendingMatch)||userSnap.docs.length>1){tx.set(reviewRef,{status:'needs_review',reason:'access_not_unambiguous',stripeCustomerId:customerId,updatedAt:timestamp},{merge:true});return 'needs_review';}
  if(userMatch && user){const isTier=String(data.entitlement?.tier||'').toUpperCase()==='DEEPENING';const topTier=String(data.entitlementTier||'').toUpperCase()==='DEEPENING';tx.set(user.ref,{entitlements:{...(data.entitlements||{}),deepen:false},...(isTier?{entitlement:{...data.entitlement,status:'cancelled',tier:'FREE'}}:{}),...(topTier?{entitlementTier:'FREE'}:{}),membership:{...(data.membership||{}),status:'cancelled',tier:'FREE'},updatedAt:timestamp},{merge:true});}
  if(pendingMatch)tx.set(pendingRef,{entitlements:{...(pending?.entitlements||{}),deepen:false},updatedAt:timestamp},{merge:true});
  tx.set(order.ref,{subscriptionStatus:'cancelled',updatedAt:timestamp},{merge:true});tx.set(reviewRef,{status:'reconciled',updatedAt:timestamp},{merge:true});return 'reconciled';
 });
}

import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {initializeApp,deleteApp} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {reconcileRefund} from '../lib/reconcileRefund';
import {reconcileDeepenCancellation} from '../lib/reconcileDeepenCancellation';
import {recordPendingPurchase,claimPendingPurchase} from '../lib/claimPendingPurchase';
if(process.env.FIRESTORE_EMULATOR_HOST!=='127.0.0.1:18080'||process.env.GCLOUD_PROJECT!=='demo-ipurpose-isolated')throw new Error('Requires isolated local emulator and demo project');
const app=initializeApp({projectId:'demo-ipurpose-isolated'});const db=getFirestore(app);after(()=>deleteApp(app));
const hash=(s:string)=>crypto.createHash('sha256').update(s).digest('hex');
test('isolated Firestore records, claims and refunds a simulated Starter Pack',async()=>{
 const email='emulator-refund@example.test',sessionId='cs_emulator_refund';
 const order={sessionId,email,entitlementKey:'starterPack',product:'starter_pack',cohort:'fixture'};
 await db.collection('enrollments').doc(sessionId).set({email,product:order.product,status:'paid'});
 await recordPendingPurchase(db,hash(email),order,new Date());
 assert.equal(await claimPendingPurchase(db,hash(email),'fixture-user',new Date()),true);
 assert.equal((await db.collection('users').doc('fixture-user').get()).data()?.entitlements.starterPack,true);
 await db.collection('users').doc('fixture-user').set({email,starterPackPurchaseSessionId:sessionId},{merge:true});
 assert.equal(await reconcileRefund(db,{...order,amountRefunded:2700,full:true},new Date()),'full_reconciled');
 assert.equal((await db.collection('users').doc('fixture-user').get()).data()?.entitlements.starterPack,false);
});
test('isolated Firestore cancels an unclaimed simulated Deepen order',async()=>{
 const email='emulator-deepen@example.test',sessionId='cs_emulator_deepen';
 await db.collection('enrollments').doc(sessionId).set({email,product:'deepen_membership',stripeCustomerId:'cus_emulator',status:'paid'});
 await recordPendingPurchase(db,hash(email),{email,sessionId,entitlementKey:'deepen',product:'deepen_membership',cohort:'fixture'},new Date());
 assert.equal(await reconcileDeepenCancellation(db,'cus_emulator','sub_emulator',new Date()),'reconciled');
 assert.equal((await db.collection('pending_entitlements').doc(hash(email)).get()).data()?.entitlements.deepen,false);
});

test('a full refund received before payment permanently blocks a late pending grant', async () => {
 const email = 'early-refund@example.test';
 const order = { sessionId: 'cs_early_refund', email, entitlementKey: 'starterPack', product: 'starter_pack', cohort: 'fixture' };
 assert.equal(await reconcileRefund(db, { ...order, amountRefunded: 2700, full: true }, new Date()), 'full_review');
 assert.equal(await recordPendingPurchase(db, hash(email), order, new Date()), false);
 assert.equal(await reconcileRefund(db, { ...order, amountRefunded: 1000, full: false }, new Date()), 'full_review');
 assert.equal(await claimPendingPurchase(db, hash(email), 'refunded-buyer', new Date()), false);
});

test('a cancellation before a paid event reserves the subscription against a late grant', async () => {
 const email = 'early-cancel@example.test';
 const subscriptionId = 'sub_early_cancel';
 const order = { sessionId: 'cs_early_cancel', email, entitlementKey: 'deepen', product: 'deepen_membership', cohort: 'fixture', subscriptionId };
 assert.equal(await reconcileDeepenCancellation(db, 'cus_early_cancel', subscriptionId, new Date()), 'needs_review');
 assert.equal(await recordPendingPurchase(db, hash(email), order, new Date()), false);
});

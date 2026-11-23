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
const runId = crypto.randomUUID().slice(0, 8);
const fixture = (name: string) => name + '-' + runId;
test('isolated Firestore records, claims and refunds a simulated Starter Pack',async()=>{
 const email=fixture('emulator-refund')+'@example.test',sessionId=fixture('cs_emulator_refund');
 const uid = fixture('fixture-user');
 await db.collection('users').doc(uid).set({ email });
 const order={sessionId,email,entitlementKey:'starterPack',product:'starter_pack',cohort:'fixture'};
 await db.collection('enrollments').doc(sessionId).set({email,product:order.product,status:'paid'});
 await recordPendingPurchase(db,hash(email),order,new Date());
 assert.equal(await claimPendingPurchase(db,hash(email),uid,new Date()),true);
 assert.equal((await db.collection('users').doc(uid).get()).data()?.entitlements.starterPack,true);
 assert.equal((await db.collection('users').doc(uid).get()).data()?.starterPackPurchaseSessionId,sessionId);
 assert.equal(await reconcileRefund(db,{...order,amountRefunded:2700,full:true},new Date()),'full_reconciled');
 assert.equal((await db.collection('users').doc(uid).get()).data()?.entitlements.starterPack,false);
});
test('isolated Firestore cancels an unclaimed simulated Deepen order',async()=>{
 const email=fixture('emulator-deepen')+'@example.test',sessionId=fixture('cs_emulator_deepen');
 await db.collection('enrollments').doc(sessionId).set({email,product:'deepen_membership',stripeCustomerId:fixture('cus_emulator'),status:'paid'});
 await recordPendingPurchase(db,hash(email),{email,sessionId,entitlementKey:'deepen',product:'deepen_membership',cohort:'fixture'},new Date());
 assert.equal(await reconcileDeepenCancellation(db,fixture('cus_emulator'),fixture('sub_emulator'),new Date()),'reconciled');
 assert.equal((await db.collection('pending_entitlements').doc(hash(email)).get()).data()?.entitlements.deepen,false);
});

test('a full refund received before payment permanently blocks a late pending grant', async () => {
 const email = fixture('early-refund')+'@example.test';
 const order = { sessionId: fixture('cs_early_refund'), email, entitlementKey: 'starterPack', product: 'starter_pack', cohort: 'fixture' };
 assert.equal(await reconcileRefund(db, { ...order, amountRefunded: 2700, full: true }, new Date()), 'full_review');
 assert.equal(await recordPendingPurchase(db, hash(email), order, new Date()), false);
 assert.equal(await reconcileRefund(db, { ...order, amountRefunded: 1000, full: false }, new Date()), 'full_review');
 assert.equal(await claimPendingPurchase(db, hash(email), fixture('refunded-buyer'), new Date()), false);
});

test('a cancellation before a paid event reserves the subscription against a late grant', async () => {
 const email = fixture('early-cancel')+'@example.test';
 const subscriptionId = fixture('sub_early_cancel');
 const order = { sessionId: fixture('cs_early_cancel'), email, entitlementKey: 'deepen', product: 'deepen_membership', cohort: 'fixture', subscriptionId };
 assert.equal(await reconcileDeepenCancellation(db, fixture('cus_early_cancel'), subscriptionId, new Date()), 'needs_review');
 assert.equal(await recordPendingPurchase(db, hash(email), order, new Date()), false);
});

test('parallel claim and refund cannot leave a refunded Starter Pack enabled', async () => {
 const email = fixture('parallel-claim')+'@example.test';
 const uid = fixture('parallel-claim-buyer');
 const order = { sessionId: fixture('cs_parallel_claim'), email, entitlementKey: 'starterPack', product: 'starter_pack', cohort: 'fixture' };
 const user = db.collection('users').doc(uid);
 await user.set({ email, entitlements: { aiBlueprint: true } });
 await db.collection('enrollments').doc(order.sessionId).set({ email, product: order.product, status: 'paid' });
 assert.equal(await recordPendingPurchase(db, hash(email), order, new Date()), true);
 await Promise.all([
  claimPendingPurchase(db, hash(email), uid, new Date()),
  reconcileRefund(db, { ...order, amountRefunded: 2700, full: true }, new Date()),
 ]);
 const result = (await user.get()).data();
 assert.notEqual(result?.entitlements.starterPack, true);
 assert.equal(result?.entitlements.aiBlueprint, true);
});

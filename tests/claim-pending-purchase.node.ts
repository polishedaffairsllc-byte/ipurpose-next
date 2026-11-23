import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FakeFirestore } from './fakes/firestore';
import { claimPendingPurchase, recordPendingPurchase } from '../lib/claimPendingPurchase';
test('concurrent claims produce one owner while preserving existing purchases', async () => {
 const db = new FakeFirestore();
 db.documents.set('pending_entitlements/hash', {claimed:false,entitlements:{starterPack:true,aiBlueprint:true}});
 db.documents.set('users/a', {entitlements:{accelerator:true}, name:'Existing'});
 const claims = await Promise.all([claimPendingPurchase(db.asFirestore(),'hash','a',1),claimPendingPurchase(db.asFirestore(),'hash','b',1)]);
 assert.equal(claims.filter(Boolean).length,1);
 assert.deepEqual(db.documents.get('users/a')?.entitlements,{accelerator:true,starterPack:true,aiBlueprint:true});
 assert.equal(db.documents.get('pending_entitlements/hash')?.claimedByUid,'a');
 assert.equal(db.documents.has('users/b'),false);
});
test('missing or already-claimed entries do not grant access',async()=>{const db=new FakeFirestore(); assert.equal(await claimPendingPurchase(db.asFirestore(),'absent','a',1),false);db.documents.set('pending_entitlements/hash',{claimed:true,entitlements:{starterPack:true}});assert.equal(await claimPendingPurchase(db.asFirestore(),'hash','b',1),false);assert.equal(db.documents.has('users/b'),false)});

test('duplicate webhook does not reopen a claimed order; a second order preserves both products',async()=>{const db=new FakeFirestore();const order={email:'a@example.test',sessionId:'one',entitlementKey:'starterPack',product:'starter_pack',cohort:'test'};assert.equal(await recordPendingPurchase(db.asFirestore(),'hash',order,1),true);await claimPendingPurchase(db.asFirestore(),'hash','a',2);assert.equal(await recordPendingPurchase(db.asFirestore(),'hash',order,3),false);assert.equal(db.documents.get('pending_entitlements/hash')?.claimed,true);assert.equal(await recordPendingPurchase(db.asFirestore(),'hash',{...order,sessionId:'two',entitlementKey:'aiBlueprint',product:'ai_blueprint'},4),true);await claimPendingPurchase(db.asFirestore(),'hash','a',5);assert.deepEqual(db.documents.get('users/a')?.entitlements,{starterPack:true,aiBlueprint:true})});

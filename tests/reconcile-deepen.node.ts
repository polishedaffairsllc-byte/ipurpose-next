import {test} from 'node:test';import assert from 'node:assert/strict';import crypto from 'node:crypto';import {FakeFirestore} from './fakes/firestore';import {reconcileDeepenCancellation} from '../lib/reconcileDeepenCancellation';
import { hasDeepenEntitlement } from '../lib/deepenEntitlement';
import { claimPendingPurchase, recordPendingPurchase } from '../lib/claimPendingPurchase';
const email='buyer@example.test';function fixture(){const d=new FakeFirestore();d.documents.set('enrollments/s1',{stripeCustomerId:'cus1',product:'deepen_membership',email});return d;}
test('matching account loses Deepen but keeps other purchases',async()=>{const d=fixture();d.documents.set('users/u1',{email,deepenPurchaseSessionId:'s1',entitlements:{deepen:true,starterPack:true},entitlement:{tier:'ACCELERATOR'}});assert.equal(await reconcileDeepenCancellation(d.asFirestore(),'cus1','sub1',1),'reconciled');assert.deepEqual(d.documents.get('users/u1')?.entitlements,{deepen:false,starterPack:true});assert.equal(d.documents.get('users/u1')?.entitlement.tier,'ACCELERATOR')});
test('unclaimed single purchase is cancelled',async()=>{const d=fixture();const hash=crypto.createHash('sha256').update(email).digest('hex');d.documents.set('pending_entitlements/'+hash,{sessions:['s1'],entitlements:{deepen:true,starterPack:true}});assert.equal(await reconcileDeepenCancellation(d.asFirestore(),'cus1','sub1',1),'reconciled');assert.deepEqual(d.documents.get('pending_entitlements/'+hash)?.entitlements,{deepen:false,starterPack:true})});
test('ambiguous purchase is held for review',async()=>{const d=fixture();d.documents.set('enrollments/s2',{stripeCustomerId:'cus1',product:'deepen_membership',email});assert.equal(await reconcileDeepenCancellation(d.asFirestore(),'cus1','sub1',1),'needs_review');assert.equal(d.documents.get('subscription_reconciliation/sub1')?.status,'needs_review')});

test('Deepen accepts a new purchase and legacy paid profiles, and honors explicit revocation', () => {
  assert.equal(hasDeepenEntitlement({ entitlements: { deepen: true }, entitlement: { tier: 'ACCELERATOR' } }), true);
  assert.equal(hasDeepenEntitlement({ entitlement: { tier: 'DEEPENING' } }), true);
  assert.equal(hasDeepenEntitlement({ entitlement: { tier: 'DEEPENING', status: 'active' } }), true);
  assert.equal(hasDeepenEntitlement({ entitlement: { tier: 'DEEPENING', status: 'cancelled' } }), false);
  assert.equal(hasDeepenEntitlement({ entitlements: { deepen: false }, entitlement: { tier: 'DEEPENING', status: 'active' } }), false);
  assert.equal(hasDeepenEntitlement({ entitlement: { tier: 'ACCELERATOR' } }), false);
});

test('cancellation preserves an independent paid membership and existing product flags', async () => {
  const db = fixture();
  const membership = { tier: 'BASIC_PAID', status: 'active', source: 'original' };
  db.documents.set('users/u1', {
    email,
    deepenPurchaseSessionId: 's1',
    entitlements: { deepen: true, starterPack: true, accelerator: true },
    entitlement: { tier: 'ACCELERATOR', status: 'active' },
    membership,
    entitlementTier: 'DEEPENING',
  });
  assert.equal(await reconcileDeepenCancellation(db.asFirestore(), 'cus1', 'sub1', 1), 'reconciled');
  const user = db.documents.get('users/u1');
  assert.equal(hasDeepenEntitlement(user), false);
  assert.deepEqual(user?.entitlements, { deepen: false, starterPack: true, accelerator: true });
  assert.deepEqual(user?.entitlement, { tier: 'ACCELERATOR', status: 'active' });
  assert.deepEqual(user?.membership, membership);
  assert.equal(user?.entitlementTier, 'BASIC_PAID');
});

test('a verified claim keeps the Deepen provenance even with other pending purchases', async () => {
  const db = fixture();
  const hash = crypto.createHash('sha256').update(email).digest('hex');
  db.documents.set('users/u1', { email, entitlements: { accelerator: true } });
  await recordPendingPurchase(db.asFirestore(), hash, { email, sessionId: 's1', entitlementKey: 'deepen', product: 'deepen_membership', cohort: 'test' }, 1);
  await recordPendingPurchase(db.asFirestore(), hash, { email, sessionId: 's2', entitlementKey: 'starterPack', product: 'starter_pack', cohort: 'test' }, 2);
  assert.equal(await claimPendingPurchase(db.asFirestore(), hash, 'u1', 3), true);
  assert.equal(db.documents.get('users/u1')?.deepenPurchaseSessionId, 's1');
  assert.equal(hasDeepenEntitlement(db.documents.get('users/u1')), true);
  assert.equal(await reconcileDeepenCancellation(db.asFirestore(), 'cus1', 'sub1', 4), 'reconciled');
  assert.deepEqual(db.documents.get('users/u1')?.entitlements, { deepen: false, starterPack: true, accelerator: true });
  assert.deepEqual(db.documents.get('pending_entitlements/' + hash)?.entitlements, { deepen: false, starterPack: true });
});

test('an old claim with matching account evidence is also revoked', async () => {
  const db = fixture();
  const hash = crypto.createHash('sha256').update(email).digest('hex');
  db.documents.set('users/u1', { email, entitlements: { deepen: true, starterPack: true } });
  db.documents.set('pending_entitlements/' + hash, { sessions: ['s1'], claimed: true, claimedByUid: 'u1', entitlements: { deepen: true } });
  assert.equal(await reconcileDeepenCancellation(db.asFirestore(), 'cus1', 'sub1', 1), 'reconciled');
  assert.deepEqual(db.documents.get('users/u1')?.entitlements, { deepen: false, starterPack: true });
});

test('cancellation of an older purchase preserves access tied to a different session', async () => {
  const db = fixture();
  const hash = crypto.createHash('sha256').update(email).digest('hex');
  db.documents.set('users/u1', {
    email,
    entitlements: { deepen: true },
    deepenPurchaseSessionId: 'newer',
    entitlement: { tier: 'DEEPENING', checkoutSessionId: 's1' },
  });
  db.documents.set('pending_entitlements/' + hash, { sessions: ['s1'], claimed: true, claimedByUid: 'u1', entitlements: { deepen: true } });
  assert.equal(await reconcileDeepenCancellation(db.asFirestore(), 'cus1', 'sub1', 1), 'reconciled');
  assert.equal(hasDeepenEntitlement(db.documents.get('users/u1')), true);
  assert.equal(db.documents.get('users/u1')?.deepenPurchaseSessionId, 'newer');
  assert.equal(db.documents.get('pending_entitlements/' + hash)?.entitlements.deepen, false);
});

test('cancels a legacy Deepen tier linked to the matching checkout', async () => {
  const db = fixture();
  db.documents.set('users/u1', {
    email,
    entitlement: { tier: 'DEEPENING', status: 'active', checkoutSessionId: 's1' },
    entitlements: { starterPack: true },
  });
  assert.equal(hasDeepenEntitlement(db.documents.get('users/u1')), true);
  assert.equal(await reconcileDeepenCancellation(db.asFirestore(), 'cus1', 'sub1', 1), 'reconciled');
  const user = db.documents.get('users/u1');
  assert.equal(hasDeepenEntitlement(user), false);
  assert.deepEqual(user?.entitlement, { tier: 'FREE', status: 'cancelled', checkoutSessionId: 's1' });
  assert.deepEqual(user?.entitlements, { starterPack: true, deepen: false });
});

test('claiming another product after cancellation cannot remove a newer active Deepen purchase', async () => {
  const db = fixture();
  const hash = crypto.createHash('sha256').update(email).digest('hex');
  db.documents.set('users/u1', { email, deepenPurchaseSessionId: 'newer', entitlements: { deepen: true } });
  db.documents.set('pending_entitlements/' + hash, {
    sessions: ['s1', 's2'],
    deepenPurchaseSessionId: 's1',
    entitlements: { deepen: false, starterPack: true },
  });
  assert.equal(await claimPendingPurchase(db.asFirestore(), hash, 'u1', 1), true);
  assert.deepEqual(db.documents.get('users/u1')?.entitlements, { deepen: true, starterPack: true });
  assert.equal(db.documents.get('users/u1')?.deepenPurchaseSessionId, 'newer');
});

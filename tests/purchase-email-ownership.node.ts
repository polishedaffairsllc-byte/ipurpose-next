import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ownsPurchaseEmail } from '../lib/purchaseEmailOwnership';
test('matches only an enabled verified owner of the purchase email', () => {
  const account = { email: ' Person@Example.com ', emailVerified: true };
  assert.equal(ownsPurchaseEmail(account, 'person@example.com'), true);
  assert.equal(ownsPurchaseEmail({...account, emailVerified: false}, 'person@example.com'), false);
  assert.equal(ownsPurchaseEmail({...account, disabled: true}, 'person@example.com'), false);
  assert.equal(ownsPurchaseEmail(account, 'other@example.com'), false);
  assert.equal(ownsPurchaseEmail(account, null), false);
});

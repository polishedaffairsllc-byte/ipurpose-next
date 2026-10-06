import test from 'node:test';
import assert from 'node:assert/strict';
import { FakeFirestore } from './fakes/firestore';
import { recordAuthEmailStatus, marketingEligible } from '../lib/trust/emailPolicy';
import { confirmContactEmail, requestContactVerification } from '../lib/trust/emailVerification';
import { emailKey } from '../lib/clarity/contacts';
import { recordMobileMarketingConsent } from '../lib/clarity/marketingConsent';
import { CLARITY_LIFECYCLE_COPY as COPY } from '../mobile/src/lib/clarityLifecycleCopy';
import { enrollNurture } from '../lib/launch-metrics/enrollNurture';
import { issuePublicChallenge, protectPublicSubmission, PublicInputError, validEmail, validText, readPublicJson } from '../lib/trust/publicProtection';
const address = 'x.y.z.a.b.c+mail@gmail.com';
const consent = { granted: true, copyVersion: COPY.consentVersion };

test('account reachability lifecycle is independent of consent, never changes opt-outs, and fails closed on outages', async () => {
  const db = new FakeFirestore(); const store = db.asFirestore();
  await recordAuthEmailStatus(store, { uid: 'person', email: address, emailVerified: false });
  assert.equal(await marketingEligible(store, address), false);
  await recordMobileMarketingConsent(store, 'person', address, consent);
  const original = structuredClone(db.documents.get('users/person')?.marketingConsent);
  assert.equal(await marketingEligible(store, address), false);
  const input = { email: address, name: '李', submissionId: 'contact', consentUid: 'person' };
  assert.equal(await enrollNurture(store, input), 'unverified');
  await recordAuthEmailStatus(store, { uid: 'person', email: address, emailVerified: true });
  assert.deepEqual(db.documents.get('users/person')?.marketingConsent, original);
  assert.equal(await marketingEligible(store, address), true);
  assert.equal(await enrollNurture(store, input), 'enrolled');
  await recordAuthEmailStatus(store, { uid: 'person', email: address, emailVerified: false });
  assert.equal(await marketingEligible(store, address), false);
  await recordAuthEmailStatus(store, { uid: 'person', email: address, emailVerified: true, disabled: true });
  assert.equal(await marketingEligible(store, address), false);
  db.failReads = true; assert.equal(await marketingEligible(store, address), false);
});

test('verification alone neither grants consent nor enqueues marketing; opt-out remains authoritative', async () => {
  const db = new FakeFirestore(); const store = db.asFirestore();
  db.documents.set('users/person', { email: address });
  await recordAuthEmailStatus(store, { uid: 'person', email: address, emailVerified: true });
  assert.equal(await marketingEligible(store, address), false);
  assert.equal(await enrollNurture(store, { email: address, name: 'Person', submissionId: 'lead', consentUid: 'person' }), 'not_consented');
  await recordMobileMarketingConsent(store, 'person', address, consent);
  db.documents.set(`email_opt_outs/${Buffer.from(address).toString('base64')}`, {});
  assert.equal(await enrollNurture(store, { email: address, name: 'Person', submissionId: 'lead', consentUid: 'person' }), 'opted_out');
  assert.equal([...db.documents.keys()].filter(k => k.startsWith('emailTasks/')).length, 0);
});

test('guest confirmation uses a hashed expiring single-use token and cannot authorize marketing', async () => {
  const db = new FakeFirestore(); const messages: string[] = []; const store = db.asFirestore();
  const send = async (message: { text: string }) => { messages.push(message.text); return 'sent'; };
  assert.equal(await requestContactVerification(store, address, send, new Date(100000)), 'sent');
  assert.equal(await requestContactVerification(store, address, send, new Date(101000)), 'unchanged');
  const link = new URL(messages[0].match(/https:\/\/\S+/)![0]);
  const key = new URLSearchParams(link.hash.slice(1)).get('key')!; const token = new URLSearchParams(link.hash.slice(1)).get('token')!;
  assert.equal(JSON.stringify([...db.documents]).includes(token), false);
  assert.equal(await confirmContactEmail(store, key, 'bad', new Date(102000)), false);
  assert.equal(await confirmContactEmail(store, 'a'.repeat(64), token, new Date(102000)), false);
  const confirmations = await Promise.all([confirmContactEmail(store, key, token, new Date(102000)), confirmContactEmail(store, key, token, new Date(102000))]);
  assert.deepEqual(confirmations, [true, false]);
  assert.equal(db.documents.get(`emailTrust/${emailKey(address)}`)?.verified, true);
  assert.equal(await marketingEligible(store, address), false);
  assert.equal([...db.documents.keys()].filter(k => k.startsWith('emailTasks/')).length, 0);
});

test('expired links fail, provider outage permits resend, old links never verify a newly issued request', async () => {
  const db = new FakeFirestore(); const messages: string[] = [];
  const send = async (message: { text: string }) => { messages.push(message.text); return 'provider'; };
  await requestContactVerification(db.asFirestore(), address, send, new Date(1000));
  const old = new URL(messages[0].match(/https:\/\/\S+/)![0]);
  assert.equal(await confirmContactEmail(db.asFirestore(), new URLSearchParams(old.hash.slice(1)).get('key'), new URLSearchParams(old.hash.slice(1)).get('token'), new Date(86401001)), false);
  assert.equal(await requestContactVerification(db.asFirestore(), address, async () => { throw Error(); }, new Date(86402000)), 'failed');
  assert.equal(await requestContactVerification(db.asFirestore(), address, send, new Date(86402001)), 'sent');
  assert.equal(await confirmContactEmail(db.asFirestore(), new URLSearchParams(old.hash.slice(1)).get('key'), new URLSearchParams(old.hash.slice(1)).get('token'), new Date(86402002)), false);
});

test('unusual genuine email and name pass sanity checks; malformed/oversized/control payloads do not', async () => {
  for (const name of ['李', 'X Æ A-12', 'Zoë O’Connor', 'aBcDxyq']) assert.equal(validText(name, 1, 120), true);
  assert.equal(validEmail(address), true); assert.equal(validEmail('ordinary+tag@example.com'), true);
  assert.equal(validEmail('bad\n@example.com'), false); assert.equal(validEmail('no-at-sign'), false);
  assert.equal(validText('hello\x00', 5, 5000), false);
  assert.equal(validText('x'.repeat(5001), 5, 5000), false);
  const request = (body: string) => new Request('https://example.test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
  await assert.rejects(readPublicJson(request('[')), /complete the form/);
  await assert.rejects(readPublicJson(request(JSON.stringify({ message: 'x'.repeat(25000) }))), /too large/);
});

test('server timing, one-use replay, duplicate payload, honeypot, action/IP binding, and cross-instance throttling', async () => {
  const db = new FakeFirestore(); const store = db.asFirestore(); const now = 100000;
  const formToken = await issuePublicChallenge(store, 'contact', 'ip-a', now);
  const body = { name: '李', email: address, message: 'Can you help me with my account?', formToken, website: '' };
  const options = { requireChallenge: true, limit: 10 };
  assert.equal(await protectPublicSubmission(store, 'contact', 'ip-a', body, options, now + 1000), 'invalid');
  assert.equal(await protectPublicSubmission(store, 'contact', 'ip-b', body, options, now + 2000), 'invalid');
  assert.equal(await protectPublicSubmission(store, 'workshop', 'ip-a', body, options, now + 2000), 'invalid');
  const results = await Promise.all(Array.from({ length: 3 }, () => protectPublicSubmission(store, 'contact', 'ip-a', body, options, now + 2000)));
  assert.deepEqual(results, ['accepted', 'duplicate', 'duplicate']);
  const second = await issuePublicChallenge(store, 'contact', 'ip-b', now + 2000);
  assert.equal(await protectPublicSubmission(store, 'contact', 'ip-b', { ...body, formToken: second }, options, now + 4000), 'duplicate');
  assert.equal(await protectPublicSubmission(store, 'contact', 'ip-b', { ...body, website: 'robot.test' }, options, now + 4000), 'dropped');
  await assert.rejects(async () => { for (let i = 0; i < 20; i++) await protectPublicSubmission(store, 'contact', 'ip-a', { ...body, message: `changed ${i}` }, options, now + 3000); }, error => error instanceof PublicInputError && error.status === 429);
  const expired = await issuePublicChallenge(store, 'contact', 'new', now);
  assert.equal(await protectPublicSubmission(store, 'contact', 'new', { ...body, formToken: expired }, options, now + 7200001), 'invalid');
  db.failReads = true; await assert.rejects(protectPublicSubmission(store, 'contact', 'offline', body, options, now + 2000));
});

test('anonymous Clarity answers shared by different people are not mistaken for replay', async () => {
  const db = new FakeFirestore(); const body = { responses: { 1: 3 }, identityResponses: ['A'] };
  for (const ip of ['person-one', 'person-two']) {
    const formToken = await issuePublicChallenge(db.asFirestore(), 'clarity-submit', ip, 100000);
    assert.equal(await protectPublicSubmission(db.asFirestore(), 'clarity-submit', ip, { ...body, formToken }, { requireChallenge: true }, 102000), 'accepted');
  }
});

test('a client-writable profile cannot authorize another account’s verified email', async () => {
  const db = new FakeFirestore(); const store = db.asFirestore();
  await recordAuthEmailStatus(store, { uid: 'victim', email: address, emailVerified: true });
  db.documents.set('users/attacker', { email: address, marketingConsent: { granted: true, grantedAt: new Date(), source: 'forged', copyVersion: COPY.consentVersion } });
  assert.equal(await marketingEligible(store, address), false);
  assert.equal(await enrollNurture(store, { email: address, name: 'Attacker', submissionId: 'fake', consentUid: 'attacker' }), 'unverified');
});

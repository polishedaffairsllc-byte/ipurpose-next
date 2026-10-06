const assert = require('node:assert/strict');
const { test } = require('node:test');
const { trustHarness } = require('./helpers/trust-harness.cjs');
const request = (body, ip = 'ip-person') => new Request('https://ipurposesoul.com/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-vercel-forwarded-for': ip }, body: JSON.stringify(body) });
const input = { name: '李 aBcDxyq', email: 'a.b.c.d.e.f+tag@gmail.com', message: 'Please help me with my account.', website: '' };

test('actual contact API rejects missing timing proof, accepts unusual name/email, escapes notification HTML, and prevents duplicate sends', async () => {
  const h = trustHarness(); const route = h.load('app/api/contact/route.ts'); const guard = h.load('lib/trust/publicProtection.ts');
  const original = process.env.RESEND_API_KEY; process.env.RESEND_API_KEY = 'test-only';
  try {
    assert.equal((await route.POST(request(input))).status, 400); assert.equal(h.calls.leads, 0);
    const formToken = await guard.issuePublicChallenge(h.db.asFirestore(), 'contact', 'ip-person', Date.now() - 2000);
    const body = { ...input, name: '李 <b>x</b>', message: '<script>alert(1)</script> Please help.', formToken };
    assert.equal((await route.POST(request(body))).status, 200); assert.equal(h.calls.leads, 1); assert.equal(h.calls.notifications.length, 1);
    assert.ok(h.calls.notifications[0].html.includes('&lt;script&gt;')); assert.ok(!h.calls.notifications[0].html.includes('<script>'));
    assert.equal((await route.POST(request(body))).status, 409); assert.equal(h.calls.notifications.length, 1);
    assert.equal((await route.POST(request({ ...input, website: 'bot.test' }, 'bot-ip'))).status, 200);
    assert.equal(h.calls.leads, 1);
  } finally { if (original === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = original; }
});

test('contact rate limits persist across actual requests and storage failure fails closed without notification', async () => {
  const h = trustHarness(); const route = h.load('app/api/contact/route.ts');
  for (let i = 0; i < 5; i++) assert.equal((await route.POST(request({ ...input, message: `Attempt ${i}` }))).status, 400);
  assert.equal((await route.POST(request(input))).status, 429); assert.equal(h.calls.leads, 0);
  h.db.failReads = true; assert.equal((await route.POST(request(input, 'new-ip'))).status, 503); assert.equal(h.calls.notifications.length, 0);
});

test('email status API ignores forged verified/consent fields and trusts live Firebase; disabled account cannot become marketing eligible', async () => {
  const h = trustHarness(); const route = h.load('app/api/auth/email-status/route.ts');
  const response = await route.POST(request({ emailVerified: true, marketingConsent: { granted: true } }));
  assert.deepEqual(await response.json(), { emailVerified: false });
  h.setUser({ uid: 'person', email: 'a.b.c+tag@gmail.com', emailVerified: true });
  assert.deepEqual(await (await route.POST()).json(), { emailVerified: true });
  assert.equal(h.db.documents.get('users/person')?.marketingConsent, undefined);
});

test('actual marketing delivery gate rechecks Auth after confirmation, requires separate consent, and rejects stale deleted/disabled identities', async () => {
  const h = trustHarness(); const gate = h.load('lib/trust/emailServer.ts'); const email = 'a.b.c+tag@gmail.com';
  const consent = { granted: true, grantedAt: new Date(), source: 'explicit-opt-in', copyVersion: 'approved' };
  h.db.documents.set('users/person', { email, marketingConsent: consent });
  assert.equal(await gate.canSendMarketing(email), false);
  h.setUser({ uid: 'person', email, emailVerified: true }); assert.equal(await gate.canSendMarketing(email), true);
  h.setUser({ uid: 'person', email, emailVerified: true, disabled: true }); assert.equal(await gate.canSendMarketing(email), false);
  h.setUser({ uid: 'person', email, emailVerified: true }); assert.equal(await gate.canSendMarketing(email), true);
  h.setUser(null); assert.equal(await gate.canSendMarketing(email), false);
  assert.ok(h.calls.authReads >= 5);
});

test('confirmation receipt is private, carries no tracker, and confirms only by explicit POST', async () => {
  const h = trustHarness(); const response = await h.load('app/confirm-email/route.ts').GET();
  const html = await response.text(); assert.equal(response.headers.get('Referrer-Policy'), 'no-referrer');
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.ok(response.headers.get('Content-Security-Policy').includes("default-src 'none'"));
  assert.ok(html.includes("window.history.replaceState")); assert.ok(html.includes("button.addEventListener('click'"));
  assert.ok(!/googletagmanager|facebook|pixel|analytics/i.test(html));
});

test('contact storage failure releases only its own reservation and allows retry without losing spam throttles', async () => {
  const h = trustHarness(); const route = h.load('app/api/contact/route.ts'); const protection = h.load('lib/trust/publicProtection.ts');
  const original = h.db.collection.bind(h.db); let fail = true;
  h.db.collection = name => { const query = original(name); if (name === 'contactRequests') { const add = query.add; query.add = async data => { if (fail) throw Error('offline'); return add(data); }; } return query; };
  const formToken = await protection.issuePublicChallenge(h.db.asFirestore(), 'contact', 'ip-person', Date.now() - 2000);
  const body = { ...input, formToken };
  assert.equal((await route.POST(request(body))).status, 503);
  fail = false; assert.equal((await route.POST(request(body))).status, 200);
  assert.equal((await route.POST(request(body))).status, 409);
});

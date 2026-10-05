/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS harness replaces external provider imports without executing a live send. */
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
// Load the actual server email adapter with its external boundaries replaced.
function adapter(db, calls) {
 const source = fs.readFileSync(path.resolve(__dirname, '../lib/email-automation.ts'), 'utf8');
 const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
 const testModule = { exports: {} };
 const mocks = {
  './firebaseAdmin': { firebaseAdmin: { firestore: () => db.asFirestore() } },
  './launch-metrics/enrollNurture': require('../lib/launch-metrics/enrollNurture.ts'),
  './clarity/suppression': require('../lib/clarity/suppression.ts'),
  resend: { Resend: class { emails = { send: async data => { calls.push(data); return { data: { id: 'fake-provider' } }; } }; } },
 };
 new Function('require', 'module', 'exports', output)(id => mocks[id] || require(id), testModule, testModule.exports);
 return testModule.exports;
}
test('real scheduling adapter gives mobile no promotional web thank-you and preserves web first touch', async () => {
 const { FakeFirestore } = require('./fakes/firestore.ts'); const { CLARITY_LIFECYCLE_COPY: COPY } = require('../mobile/src/lib/clarityLifecycleCopy.ts');
 const { recordMobileMarketingConsent } = require('../lib/clarity/marketingConsent.ts');
 const before = process.env.RESEND_API_KEY; process.env.RESEND_API_KEY = 'mock-only';
 try {
  const db = new FakeFirestore(); const calls = []; const email = adapter(db, calls);
  await recordMobileMarketingConsent(db.asFirestore(), 'mobile', 'mobile@example.test', { granted: true, copyVersion: COPY.consentVersion });
  assert.equal(await email.scheduleEmailSequence({ email: 'mobile@example.test', name: '', submissionId: 'mobile-contact', quizSubmissionId: 'quiz-mobile', consentUid: 'mobile' }), 'enrolled'); assert.equal(calls.length, 0);
  assert.equal(await email.scheduleEmailSequence({ email: 'web@example.test', name: 'Web', submissionId: 'web-contact', quizSubmissionId: 'quiz-web' }), 'enrolled'); assert.equal(calls.length, 1); assert.ok(calls[0].html.includes('/clarity-check/results/quiz-web')); assert.ok(!calls[0].html.includes('/clarity-check/results/web-contact'));
  db.failReads = true; assert.equal(await email.sendNurtureEmail1({ email: 'web@example.test', name: 'Web' }), false); assert.equal(calls.length, 1);
 } finally { if (before === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = before; }
});

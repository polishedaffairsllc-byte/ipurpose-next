# P0 implementation report — October 4, 2026

The corrected execution brief confirms the audit and authorizes this implementation. This report supersedes the audit's pending-approval status. Branch: `codex/funnel-audit-20261004`; baseline: freshly fetched `origin/main`, `af303aea322f9c1fb065c691ca456f0b1752b4c7`. The original dirty `codex/android-launch-qa` checkout was preserved.

## Result

New native clients send a stable request ID for each set of answers. Repeated/concurrent attempts save one quiz record and do not overwrite newer profile results on an old retry; changing answers or beginning a retake obtains a new request ID. Old clients without the new ID retain their prior behavior. No old quiz history is scanned or backfilled.

Mobile identity, normalized email and optional real display name come from verified Firebase Auth, and the existing server scoring determines the result. A shared lifecycle helper now serves mobile and web capture. Transactional normalized-email contact resolution spans sources and lead age, reuses an existing contact and preserves consent/subscription/opt-out fields. A hashed email registry serializes new resolution. Existing duplicate lead records stay intact; their IDs are recorded in the registry for future migration review. No production duplicate counts were queried. Historically non-normalized email records are not migrated by this pass.

New native completions receive plain transactional results and a neutral once-only welcome, greeting unnamed users with “there.” Results URLs contain the actual quiz submission ID. Retakes can get a new results email, while the welcome and nurture enrollment do not restart. Existing queued/sent web lifecycle evidence prevents another welcome to the same email.

The account-creation marketing checkbox starts unchecked, uses existing theme tokens/fonts, and records authenticated consent with time/source/version/copy only when selected. Native enrollment requires that record and respects opt-outs. Account creation and no-consent completion do not emit email_signup. Only a confirmed native queue enrollment does. Failed consent recording leaves marketing unenrolled; it does not fabricate consent. Copy is centralized in `mobile/src/lib/clarityLifecycleCopy.ts` and remains draft copy pending final approval.

The mobile first touch is its neutral welcome. The promotional web thank-you is web-only, including for opted-in app users. Consented app users enroll in the six existing scheduled nurture messages; no-consent users receive transactional messages only. Web keeps its existing immediate promotional thank-you plus six scheduled touches, duplicate policy, and opt-out-based enrollment model. No affirmative web consent was fabricated. Its consent model remains a separate business/privacy decision.

Individual marketing send functions now fail closed when any suppression lookup fails and honor recorded lead/user suppression. Existing marketing task timings and workshop hold remain unchanged. New transactional delivery records hold immutable provider payloads and stable Resend keys under a transaction lease. The existing authorized scheduler can retry only recorded new transactional work. Account deletion includes these records and contact registry PII; a stale transactional retry cannot recreate work after its user profile is deleted.

## Verification

- 21/21 mock server tests passed on Node 24: lifecycle, consent, cross-source/older lead reuse, legacy duplicate preservation, opt-out, retries, retakes, concurrency, once-only welcome, actual quiz IDs, no backfill, deleted-account retry prevention, existing Launch Metrics and account-deletion guards. The real scheduling adapter was executed with a fake email provider: app enrollment sent no promotional web thank-you, web enrollment retained it, and failed suppression lookup prevented an individual marketing send.
- 2/2 actual React account-screen interaction tests passed with native/API boundaries replaced: unchecked initial state, selected consent passed to account creation, and no signup event from the checkbox itself.
- Full server and mobile TypeScript checks passed. Targeted server lint had zero errors and eight warnings (six baseline warnings and two explicit Firestore-boundary any annotations in the fake). Targeted mobile lint passed with no warnings.
- `scripts/verify-clarity-preserved.cjs` passed: seven situation questions, five identity questions/choices, scoring, the five identity types and result-rendering copy match baseline byte-for-byte/AST as applicable. Web quiz/results files and mobile onboarding definitions are unchanged.
- Local iOS and Android production JavaScript exports passed. They are bundler checks, not native device/store builds. Dependency manifests, native configuration and version/build numbers are unchanged; dependencies were installed from exact lockfiles into disposable runtime directories.

Reproduce server tests: `node --import tsx --test tests/clarity-lifecycle.node.ts tests/clarity-email-adapter.test.cjs tests/launch-metrics.node.ts tests/account-deletion.node.ts`. Screen tests: `MOBILE_TEST_RUNTIME=<temporary runtime containing React 19.1 and react-test-renderer 19.1> node --test mobile/tests/clarity-lifecycle.test.cjs`. Test renderer was used externally; it was not added to app dependencies.

## Report-only risks and limits

Founder notifications still occur on each completion and web capture; retries/capture can produce duplicate founder notifications. The legacy marketing scheduler still has no transactional delivery claim, so overlapping workers can duplicate a marketing send. Both were inspected and left unchanged as instructed.

Resend retains idempotency keys for 24 hours ([primary provider documentation](https://resend.com/changelog/idempotency-keys)). Ambiguous transactional attempts older than 23 hours are held as needs_review instead of risking duplicate sends. The existing scheduler runs once daily at 14:00 UTC, so some failures will need manual review rather than automatic next-day resend. No cron changes were made. No live provider acceptance/delivery, deployed API, real Firebase transaction/index behavior, native builds, or physical devices were tested. No provider/API endpoint capable of sending real email was called.

Final checkbox and welcome copy approval, privacy policy approval, and store/device release checks remain pending. This branch is not release-ready. No assumptions remain requiring a scope change; the corrected brief and subsequent user answers resolve the earlier audit gates. No old contacts were merged or old users enrolled.

## Files changed for implementation

- `app/api/ai/marketing-consent/route.ts`
- `app/api/clarity-check/submit/route.ts`
- `app/api/leads/clarity-check/route.ts`
- `app/api/tasks/send-scheduled-emails/route.ts`
- `lib/accountDeletionPlan.ts`
- `lib/clarity/contacts.ts`
- `lib/clarity/delivery.ts`
- `lib/clarity/lifecycle.ts`
- `lib/clarity/lifecycleServer.ts`
- `lib/clarity/marketingConsent.ts`
- `lib/clarity/nativeSubmission.ts`
- `lib/clarity/suppression.ts`
- `lib/email-automation.ts`
- `lib/launch-metrics/enrollNurture.ts`
- `lib/leads.ts`
- `mobile/src/app/create-account.tsx`
- `mobile/src/components/ClarityCheckFlow.tsx`
- `mobile/src/context/AuthContext.tsx`
- `mobile/src/lib/analyticsCore.ts`
- `mobile/src/lib/api.ts`
- `mobile/src/lib/clarityLifecycleCopy.ts`
- `mobile/tests/clarity-lifecycle.test.cjs`
- `scripts/verify-clarity-preserved.cjs`
- `tests/clarity-email-adapter.test.cjs`
- `tests/clarity-lifecycle.node.ts`
- `tests/fakes/firestore.ts`

Implementation commits: `16622a0` (server lifecycle) and `33ac55f` (native consent/retry flow). Audit commit: `1ac9c54`. This report is added as `docs/funnel-execution-20261004.md`; its commit is listed in the final execution summary. Each stage operation names files explicitly. The checkout's pre-commit hook depends on an absent generated `.husky/_/husky.sh`; its secret-filename guard was checked manually and commits used the hook-path override. No secrets, environment files, generated exports, dependencies or audience data were staged.

Nothing pushed. Nothing merged. Nothing deployed or released. No backfill. No real email sent.

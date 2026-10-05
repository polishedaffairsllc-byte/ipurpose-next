# iPurpose 1.0.3 physical QA repair — October 5, 2026

## Release disposition and source

**TestFlight 1.0.3 (2) failed physical-device QA and is not release-ready.** Hold the existing Android 1.0.3 / code 6 artifact as well. No build, store upload, public deployment, production submission or Google Play review change was performed during this repair.

Repair branch: `codex/mobile-qa-repairs-1-0-3`, created from the clean release source `882c00cfef03a2d21f0aa37afacb12c79855020c`. Its product baseline is main `7859ad9fe3a7a4455cdfe03d99f5300e8fd82535`, independently rechecked through GitHub after the repair. The managed release worktree was reused while clean; no uncommitted code or older dirty workspace was imported. No Purpose Path preservation branch was used.

App metadata remains **1.0.3 / Android 6 / iOS 2** in this repair commit. The replacement identifiers below are recommendations, not applied changes.

## Production audit and causes

### 1. Purpose could not load

Production Vercel deployment `dpl_9k2m3wdxG4VWAgVyzjsaM8QSwqyZ` is READY, serves `https://ipurposesoul.com`, and identifies main commit `7859ad9`. The deployed `/api/ai/purpose` route exists: an unauthenticated GET returned HTTP 401 with `x-matched-path: /api/ai/purpose`, rather than 404. The signed iOS artifact's Hermes bundle uses the same canonical API domain. This was not a wrong mobile base URL or an absent production route.

GET awaited the Purpose profile and optional Clarity identity together without isolating Clarity failures. Clarity performs a `clarityCheckSubmissions` query filtered by `uid` and ordered by `createdAt` descending. A read-only `firebase firestore:indexes --project ipurpose-mvp` inventory showed only the email/createdAt index for that collection; **the required uid/createdAt index is absent in production**, although it is already declared in `firestore.indexes.json`. Even a new account with no Clarity records needs that query index. Its failure rejects the combined GET and produces the Purpose error screen for both new and existing accounts.

The repair catches only the optional Clarity lookup failure, logs a generic warning without private data, and returns `identityType: null`. A failed primary Purpose read continues to produce HTTP 500. When the optional lookup works, existing Clarity identity pairing is retained.

Native auth already sends Firebase ID tokens in `Authorization: Bearer`, retries a 401 once with a force-refreshed token, and uses the shared verified bearer/session boundary. Server verification checks revoked tokens. An additional response bug was found: `requireAuthenticated` wrapped an already constructed error response in another JSON response, producing `{}` at HTTP 401. It now returns the structured 401 directly.

Native GET now validates the Purpose profile response. An explicit `purposeProfile: null` means no profile. Missing/malformed success payloads, HTTP 401/404/500 and network errors remain failures rather than being mistaken for first-time users.

These production observations and a regression test exercising the actual route/auth/profile modules reproduce the failure mechanism. An authenticated request using either physical-QA account was not made; private account credentials were not available. Production authenticated success cannot be claimed until the backend repair is deployed and retested.

### 2. First-time users had no assessment entry

This has the same underlying cause as defect 1. The Purpose screen already provided the start experience for a successfully loaded null profile, but the failing prerequisite GET selected the error state before that experience was reachable. The repaired server response exposes the existing **Take the Purpose Check** entry. Tests now run the actual native API, provider and screen together for new and existing profiles, reach all six approved questions, submit/save and show results with retake controls. Purpose Path remains disabled.

### 3. Saved environment did not reach Clarity

The existing provider/picker saves the preference, consumes the server-confirmed value and hydrates it on remount. Clarity did not subscribe to that provider: its gradient and styles used fixed Depth theme colors. It now consumes the shared tokens throughout intro, questions, focus, results, loading and error states. Styles update when tokens change without remounting or clearing the current assessment. Existing preference storage and context behavior remain unchanged.

### 4. Password visibility controls were absent

Both signup fields used permanent `secureTextEntry` without controls or visibility state. Independent eye buttons now toggle Password and Confirm Password. Both default hidden, have Show/Hide accessibility labels and button roles, and provide a minimum 48-point hit area. Toggling preserves field values and validation; controls are disabled during submission.

The marketing checkbox independently defaults to `false` in code and in native interaction tests. Its approved copy and explicit opt-in behavior were preserved. The screenshot's checked state was not treated as a defect.

## Changed files

| File | Change |
| --- | --- |
| `app/api/ai/purpose/route.ts` | Optional Clarity failure no longer blocks Purpose reads. |
| `lib/apiEntitlementHelper.ts` | Structured authenticated-route 401 response. |
| `mobile/src/lib/api.ts` | Validate GET response; distinguish explicit null from malformed success. |
| `mobile/src/components/ClarityCheckFlow.tsx` | Consume current Visual Environment tokens throughout the flow. |
| `mobile/src/app/create-account.tsx` | Independent accessible password visibility controls. |
| `tests/purpose-api.test.cjs` | Seven actual route/auth/profile regression tests with Firebase IO faked. |
| `mobile/tests/release-qa.test.cjs` | Eleven native API/provider/screen interaction regression tests. |
| `mobile/tests/helpers/native-harness.cjs` | Isolated React Native test harness, injected fetch and real provider support. |
| `mobile/tests/purpose-check.test.cjs` | Node globals and named test ScrollView for lint. |
| `mobile/tests/clarity-lifecycle.test.cjs` | Node globals and named test ScrollView for lint. |
| `tests/onboarding.node.ts` | Update stale signup assertion to include the already approved marketingOptIn argument. |
| `docs/mobile-physical-qa-repairs-20261005.md` | This repair/validation/release-hold report. |

## Regression coverage

New server tests cover verified native new/existing accounts with the missing Clarity index, optional Auth lookup failure, successful existing identity pairing, missing/malformed/rejected tokens, structured 401, genuine Purpose database failure, six-answer create/read/retake/delete and rejection of incomplete/version/UID-spoofing payloads.

New native tests cover canonical API URL and bearer refresh, explicit null, HTTP 401/404/500, malformed responses, network and missing-auth failures, real provider first-time/start/save/results and existing/retake flows through all six questions, retry recovery, disabled Purpose Path, independent password controls, values/mismatch validation/default-off consent, and unchanged signup arguments.

Environment interaction tests mount the actual provider, Account picker and Clarity flow together. They save **Depth → Renewal → Warmth → Depth**, verify Clarity gradient/button colors after each change, unmount/remount to verify hydration of each saved preference, and change the environment mid-assessment without losing the current question. Profile API IO is faked; this does not constitute a new production persistence/device test.

A full native Clarity retake traverses all seven Clarity questions and five identity questions, verifies transmitted answers, simulates failure on submission, retries with the same attempt ID and renders the unchanged server result. Existing server lifecycle tests continue to cover consent-aware transactional first touch, consent suppression and duplicate/idempotency protections.

## Complete validation results

| Check | Result |
| --- | --- |
| Purpose API/profile/scoring, Clarity lifecycle/email adapter and onboarding tests | **48/48 pass**. Includes 7 new route tests and the existing 10,000 seeded scoring simulation. |
| All native Purpose/signup/lifecycle/QA interaction tests | **21/21 pass**. Includes 11 new QA tests. |
| Root TypeScript: `npx tsc --noEmit --incremental false` | Pass. |
| Mobile TypeScript: `npx tsc --noEmit --incremental false` | Pass. |
| Full repository lint: `npm run lint` | Pass, **0 errors / 956 warnings**. Warnings include six CommonJS require-style warnings in the new server test; the remainder are existing repository warnings. |
| Mobile source and test lint: `npx eslint src tests` | Pass, 0 errors / 0 warnings. |
| iOS native Hermes export | Pass; bundle `entry-c42b500dc0cdd78fac5b059a5e10107f.hbc`, approximately 3.36 MB. |
| Android native Hermes export | Pass; bundle `entry-f80027f6ed9e7ca254eb07bb722dc21f.hbc`, approximately 3.36 MB. |
| `git diff --check` / unresolved source merge markers | Pass. |
| Scoring/content/copy/Firebase/build-profile preservation | No changes to their source/configuration files. |

Exports used the previously verified EAS production public values, canonical API URL, existing Android JSON and the proper iOS Firebase plist for `com.ipurpose.mobile` / `ipurpose-mvp`, with `EXPO_PUBLIC_LAUNCH_ANALYTICS_ENABLED=true`. Native Firebase plugins and runtime analytics enablement were preserved. No signing build was performed. React test renderer emits its deprecation notice; tests pass. No real marketing/welcome emails were sent by these mocked tests.

Validation logs and native export artifacts were retained separately under `/private/tmp/ipurpose-qa-*`; production route/index probe files remain there too. TypeScript checks ran after all production-source edits. Later edits only corrected/added tests and documentation.

## Replacement builds and remaining gates

**A replacement TestFlight build is required. Android code 6 must also be rebuilt before internal testing**, because it contains the same Clarity/signup/native Purpose client source. Do not upload the held Android build `92b595fd-7408-4e4a-b521-cf119840c6ff` as the repaired release.

Recommended identifiers: app version **1.0.3**, iOS buildNumber **3**, Android versionCode **7**. This recommendation uses the known accepted iOS build 2 and already produced Android code 6. It is not a fresh store-inventory reservation: recheck App Store Connect/TestFlight and all Google Play tracks/artifacts immediately before assigning/building, and increase again if another build has since consumed either number. No identifiers were modified here. [Apple requires incrementing the build string](https://help.apple.com/xcode/mac/current/en.lproj/devba7f53ad4.html); [Android successive releases use higher version codes and Play does not accept reuse of uploaded codes](https://developer.android.com/studio/publish/versioning).

Required sequence before release readiness:

1. Review/merge/deploy the backend repair. Deploy the already declared Clarity uid/createdAt index and wait for READY so optional identity pairing and other native Clarity consumers can succeed. Inspect the scoped index plan first: do not inadvertently delete existing email indexes or apply unrelated index changes. Neither production deployment nor index mutation was performed here.
2. Verify authenticated production GET for an owner-controlled new account returns 200/null, an existing Purpose account returns 200/validated profile, and genuine failures show retry. Verify create/read/retake/deletion against production with a disposable owner-controlled account.
3. Recheck store inventory, apply approved replacement build identifiers and create fresh signed **test-only** builds. EAS testing profiles still preserve Android internal-only submission and `changesNotSentForReview: true`; no production review resubmission or public release is authorized.
4. Android submission still requires the Google Play Android Developer API service-account credential gate from the preceding task. Do not continue submitting the failed-QA code 6 artifact after obtaining that key.
5. Repeat physical-device QA on the replacements for these regressions, all five tabs, reflection opt-in, dedicated deletion/Compass caveat, Clarity scoring/lifecycle and analytics event delivery. Automated mocked tests and native exports are not physical-device acceptance.

Purpose scoring/content, Clarity scoring/content, approved marketing/welcome copy, Purpose privacy disclosure/Compass-history caveat, disabled Purpose Path and Firebase analytics configuration remain protected. Google Play production **1.0.2 / code 5** and its review were not touched.

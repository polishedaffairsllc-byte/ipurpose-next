# iPurpose QA refinement — owner review

**READY FOR OWNER REVIEW**

Prepared October 5, 2026. Review branch: `codex/qa-refinement-20261005`, based on the tested 1.0.3 release source `b2420f3`. Workspace: `/private/tmp/ipurpose-qa-refinement-20261005`. The original working directory and its unfinished changes were preserved.

## Review gate

The five implementation areas are complete and all required validation gates passed. [Draft PR #63](https://github.com/polishedaffairsllc-byte/ipurpose-next/pull/63) remains unmerged. A test-only CI workflow provided independent clean-install validation after local machine memory pressure delayed reruns. Vercel automatic deployment is explicitly disabled for this review branch; the existing Actions deploy job is restricted to main and was skipped. No EAS build, TestFlight upload, Android internal-testing upload, public release, backend deployment, production email send, store resubmission, or Google Play production/review change was performed. Production 1.0.2/code 5 remains outside this batch.

## Findings and resulting behavior

1. Purpose used a manual Continue on every question. Selection now computes and saves the next answer state before moving: a single-choice answer advances; the first of two choices stays with Continue available; the second advances; removing a multi-choice answer stays. Back preserves editable answers. The last question advances only to optional reflection. A stale rapid tap cannot skip a step.
2. The approved Purpose framework has nine scored signals, each with a direction phrase but no complete interpretive profile presentation. All nine now have supporting interpretation and defining strengths. Saved direction, audience and impact remain authoritative. Combined profile names use the existing ranked signal names; there is no new archetype, scoring change, or questionnaire revision.
3. Both Home and Account already share the canonical Purpose provider. Home is the clearest daily summary location; Account supplies durable profile visibility next to existing deletion controls. Both now show the same saved direction, profile name, people served and impact, plus a route to full results. No result invites the assessment. Retakes and deletion update the shared state; focus refresh handles changes made elsewhere. Loading/network failure is distinguished from a missing result.
4. Firebase accounts did not have a complete verification/status flow. Signup requests Firebase verification; Account and web verification controls allow resend/check. Unverified accounts keep appropriate product access. Marketing delivery now requires live reachability verification, separate explicit consent, and existing suppression checks. Auth-owned status cannot be forged by a client flag or another user's writable profile email.
5. Public forms lacked a shared cross-instance defense. Contact and anonymous lead/Clarity submissions now use server-issued interaction challenges, shared transactional throttles, honeypots, replay/duplicate reservations, bounded JSON and basic payload checks. Contact storage failures permit retry without resetting throttles. Unusual names and dotted/plus-tagged Gmail addresses are accepted when their payload and interaction are valid.

## Archetype inventory

| Approved Purpose name | Before | After |
| --- | --- | --- |
| Belonging | Partial | Complete |
| Teaching | Partial | Complete |
| Access | Partial | Complete |
| Creative expression | Partial | Complete |
| Justice | Partial | Complete |
| Stability | Partial | Complete |
| Healing | Partial | Complete |
| Problem solving | Partial | Complete |
| Independence | Partial | Complete |

Before: zero complete interpretive profiles, nine partial profiles, zero missing scored-signal definitions. The interpretation/strengths layer was absent for all nine. Each result now consistently includes the preserved signal/profile name, saved Purpose Direction, strengths/interpretation, saved audience and saved impact. No content requires a new owner decision to implement the approved framework. Owner review of the derived supporting prose remains appropriate. The separate Clarity inventory (Visionary, Builder, Nurturer, Strategist, Creator) is preserved.

See the [full archetype audit](archetype-audit.md) for the approved source mappings and inventory distinctions.

## Identity and public-form design

Email verification answers whether the person can receive mail at an address. Bot protection assesses the interaction. They are separate layers: verified addresses can submit spam, and unusual addresses can belong to legitimate people.

Firebase Auth is the account authority. The API reads the current Admin SDK user, while mobile reloads the Firebase user and refreshes its ID token. Disabled/deleted accounts fail the marketing delivery gate. Before verification, users retain sign-in, purchased access, assessments, saved private profiles, Compass, retakes, preferences and deletion. Neutral welcome and requested results remain transactional.

Guest Clarity keeps completion and results available. Requested results are followed by a neutral confirmation link: hashed random token, 24-hour expiry, single-use atomic consumption, 15-minute resend throttle. Confirmation requires a deliberate POST; opening a link does not confirm. The receipt excludes trackers and clears its URL fragment. Neither verification nor a merely entered email grants marketing consent. The old implicit web nurture path no longer qualifies an unverified/non-consenting contact. Confirmation alone does not enroll anyone or backfill a campaign; opt-outs remain effective.

Public server protection covers Contact, anonymous Clarity, Clarity capture, info-session, workshop and the dormant welcome-popup API. Authenticated native Clarity preserves its existing request-ID/Auth flow. Direct Firebase signup is a separate service surface: this Next.js guard does not protect it. Use Firebase service quotas/abuse controls, and consider a supported managed challenge if observed signup abuse warrants it. No CAPTCHA provider, device fingerprint or new analytics configuration was added.

See [trust design](trust-design.md) for exact limits, failure behavior, retention and rollout requirements. The read-only live Firestore rules audit confirmed private collections inherit default client denial; no production rules were changed.

## Validation

| Gate | Result |
| --- | --- |
| Mobile interaction/regression tests | 29 passed, 0 failed |
| Relevant server/API regression tests | 95 passed, 0 failed, 0 skipped |
| Final root TypeScript | Passed in clean CI |
| Final mobile TypeScript | Passed locally and in clean CI |
| Final root lint | Passed: 0 errors, 965 warnings |
| Final mobile lint | Passed: 0 errors/warnings |
| New backend/API/test code lint | Passed, 0 errors/warnings |
| Final unsigned iOS export | Passed locally and in CI; bundle and metadata verified |
| Final unsigned Android export | Passed in CI; bundle and metadata verified |
| Git whitespace check | Passed |
| Normal web production build | Passed in CI |
| Repository Firestore alignment/secret/type safety checks | Passed in CI |
| Existing Playwright suite | 8 passed, 6 skipped; skipped tests are not claimed as coverage |

Coverage includes all requested Purpose selection/Back/reflection behaviors; all nine complete profiles; actual Home/Account saved/retaken/deleted summaries; account and guest verified/unverified transitions; verification independent of consent/opt-out; live Auth delivery gating; contact legitimate unusual payloads; size/type bounds; timing/honeypot/rate/replay/concurrency; failed-save retry; existing Clarity, Purpose, deletion, onboarding and launch-metrics behavior.

Implementation commit `17cfa7788c9d4015574dd83cd7e58a0252db9f38` passed [all refinement gates](https://github.com/polishedaffairsllc-byte/ipurpose-next/actions/runs/37391335256), [normal web CI](https://github.com/polishedaffairsllc-byte/ipurpose-next/actions/runs/37391335756), and [repository/type-safety verification](https://github.com/polishedaffairsllc-byte/ipurpose-next/actions/runs/37391335233). Both export artifacts were downloaded and inspected: the compiled bundles contain the Purpose summary, full-profile strengths and email-status API additions. The first clean mobile run exposed the prior harness's undeclared renderer dependency; it is now pinned as a development dependency matching React 19.1.0, and all 29 tests pass on a fresh install.

External Firebase/mail boundaries were mocked in automated tests; no real verification or marketing email was sent. Unsigned exports validate bundling, not signing, physical device behavior or live analytics delivery. Interrupted local reruns are not claimed as passes; completed clean CI supplies those results. Owned-mailbox and deployed-backend checks remain required before a signed candidate.

An additional mobile dependency audit reported 44 advisories (31 high, 13 moderate, zero critical). Every flagged dependency path/version already exists in baseline `b2420f3`; the added test renderer has no advisory. The flagged groups include existing Expo/Metro/React Native tooling and Firebase Node-side dependencies. No framework/analytics dependency upgrade or force downgrade was made in this batch. This is an existing dependency-maintenance item requiring targeted reachability/upgrade review before a future release; passing this refinement gate does not certify the entire dependency tree as vulnerability-free. The existing server dependency-audit policy check passed CI.

Unsigned export evidence (SHA-256):

- iOS: `00af3bf542eb77045faa1d39ddecde712740c69bce5c9ce37ea740cdaae2e6db` (3,375,941 bytes).
- Android: `af4ff32cee35978f196347ee7d2af43154baab431d671464cd3432e52331b401` (3,370,774 bytes).

Artifacts are available from the refinement CI run as `unsigned-refinement-exports` for seven days and locally at `/private/tmp/ipurpose-refinement-ci-exports`.

## Regression boundaries

Purpose and Clarity scoring/content, the approved six Purpose questions, approved consent wording, explicit opt-in semantics, neutral welcome behavior, Visual Environment, Firebase analytics configuration, disabled Purpose Path status, Purpose deletion, optional reflection consent and Compass Purpose context rules remain intact. No app version/build identifiers or EAS/native signing configuration were changed.

## Disclosure and deployment prerequisites

Privacy-policy updates are required before rollout: describe reachability verification independently of marketing consent and temporary anti-abuse security records/retention. The source policy also still needs the previously identified Purpose answers/results/optional-reflection disclosure. Suggested disclosure scope is documented in the trust design; no approved policy/consent wording was replaced here.

Apple App Privacy and Google Play Data Safety must be compared with the current submitted declarations for email/status, security diagnostics and Purpose data. Existing email/name categories may already cover some data, but their sufficiency is not established by this batch. Owner/store review is required; do not alter the active Google Play production review.

This review follows the stores' accuracy/update requirements: [Apple App Privacy](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy) and [Google Play Data Safety](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en). The need for particular store-answer changes remains conditional on the actual submitted declarations.

Backend deployment is needed **before the mobile rebuild**. After owner review:

1. Run normal web CI/build, approve disclosures and deploy the web/API changes together using existing Firebase/Resend configuration.
2. Enable additive Firestore TTL policies on `expiresAt` for `publicChallenges`, `publicThrottle` and `publicReplays`; preserve unrelated indexes/rules. Expiration checks already work in application logic, but TTL is required for the intended cleanup.
3. Verify deployed routes, client-denied private collections, Firebase templates/domain, confirmation receipt, and verification/consent/opt-out behavior with owned test identities. Exercise public forms and authenticated native Clarity against the deployed backend.
4. Review the supporting Purpose prose and physically check selection, Back, reflection and Home/Account persistence.
5. Only after owner approval, produce replacement signed candidates. Based on the current internal versions, recommend **iOS buildNumber 4** and **Android versionCode 8**, retaining version 1.0.3 unless the owner chooses otherwise. Refresh build inventory first; these identifiers have not been assigned or consumed.

## Changed files

The [file inventory](files-changed.md) lists each changed implementation, test and review file. Core additions are the Purpose profile catalog/summary, email verification controls and APIs, the private confirmation receipt, shared trust/protection modules, wired public forms and regression tests.

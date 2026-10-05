# P1 — Purpose preflight, October 4, 2026

Status: implementation stopped at the brief's backend/baseline conflict gate. P1 is not implemented or ready for release.

## Branch and changed files

`codex/purpose-preflight-20261004` starts from freshly fetched `origin/main`, `af303aea322f9c1fb065c691ca456f0b1752b4c7`. Changes are this report, `scripts/audit-purpose-signals.py`, and its reproducible diagnostic output `docs/purpose-signal-simulation-20261004.json`. These do not alter app behavior. No version, build number, native configuration, dependency, Home, Clarity or Compass code changed. The original dirty checkout was preserved.

## Conflicts requiring a decision

1. Backend write support does **not** exist for `purposeProfile`. `app/api/ai/profile/route.ts` GET returns the bounded Companion profile; PATCH accepts exactly one of focusAreas, initializeFocusAreas, timezone or visualEnvironmentPreference. It rejects purposeProfile. `lib/ai/companionContext.ts` does not return or read Purpose Check data. The other inspected profile endpoints edit name/photo/timezone/preferences, not a Purpose Check record. No new endpoint has been called or built.
2. The existing mobile Purpose Path and bridge are **not in origin/main**. They exist as untracked/uncommitted files in the user's `codex/android-launch-qa` checkout: `mobile/src/app/(app)/purpose.tsx`, `purpose-bridge.tsx`, `mobile/src/context/PurposeContext.tsx`, `mobile/src/lib/purpose.ts`, `purposeStorage.ts`, plus integrations in Home, root layout, AuthContext, Clarity flow and tests. The brief requires a branch based on origin/main and preservation of that existing behavior; silently copying the entire dirty checkout would mix unrelated changes and lose newer Launch Metrics behavior. The minimum proposed port needs confirmation.
3. Main's mobile configuration is version 1.0.0, iOS build 1, Android code 1. The user's configuration/documents describe 1.0.2, iOS build 1, Android code 3; the prior Path handoff recommends 1.0.3 only. Highest uploaded store versions are not verified. No numbers were changed, and Purpose Check is not bundled into the proposed 1.0.3 Path release.
4. The specified tie-break sequence can leave signals fully tied after comparing Q3, Q5, Q6, Q2 and Q1 contributions. This happened at the second/third boundary in 1,271 of 10,000 diagnostic sets. A deterministic final rule remains unspecified. Proposed product rule for confirmation: use the nine signals' listed order only after every specified tie-break comparison is equal. The simulation reports that policy and a randomized residual-tie policy; neither is silently adopted as app scoring.

## Proposed backend/storage contract

Once the conflicts are resolved, add authenticated GET/PUT/DELETE support on a separate `/api/ai/purpose` route, storing one nested `users/{verifiedUid}.purposeProfile` field. Recompute validated answers/results on the server using a shared versioned scoring/copy module; do not trust client-generated scores or direction. Store answers, signals, audience, impact, direction, completedAt, updatedAt and purposeCheckVersion. The optional reflection is omitted from the request entirely unless saving is checked. Unchecking during retake must replace the record without retaining an old reflection.

Keep `purposeStatement`, `focusAreas`, `identityAnchor` and archetype fields protected. Dedicated DELETE removes only purposeProfile, invalidates the app's loaded Purpose state and makes fresh Compass context omit it. It must not clear the Path's local progress or the account. Full account deletion already recursively removes `users/{uid}` through `lib/accountDeletionPlan.ts` and `lib/accountDeletion.ts`; this structurally includes a nested purposeProfile, but the required tests with Purpose fixtures have not been written or run. Dedicated Purpose deletion is absent today.

Add the Purpose context to `lib/ai/companionContext.ts` and the relevant types/prompts, keeping the limiter and cost controls unchanged. Reflection may enter context only if saved; no answers/reflection enter analytics or logs. Extend existing event unions/helpers for purpose_check_start and purpose_check_complete, preserving main's native analytics implementation and gates.

## Purpose Path storage and proposed prefill

The existing workspace implementation uses AsyncStorage key `ipurpose:purpose:v1:<Firebase UID>`. It saves Path reflections, chosen values, working mission and progress locally per account, not into purposeStatement or purposeProfile. Account deletion's workspace AuthContext integration clears it; main lacks that integration.

There is **no Purpose Check prefill yet**. Proposed prefill reads Q1/Q2 selections live from purposeProfile for Path stages 1/2 and skips the duplicated prompts, leaving pre-existing local Path entries intact. This means Purpose-results deletion removes the live prefill while retaining the independently saved Path reflections. Do not copy Check answers into local Path storage unless that is expressly chosen and reported.

Restore only the existing Home Path entry needed to preserve the prior feature, without adding Purpose Direction, current focus or next-step changes to Home. Keep bridge framing verbatim. Place the new tab in the specified Home, Clarity Check, Purpose, Compass, Account order, using existing theme.ts tokens and Italiana/Marcellus. All new Check-facing copy belongs in one constants file; no second identity/archetype system is introduced.

## Signal mapping simulation

Ran `python3 scripts/audit-purpose-signals.py`, 10,000 random answer sets per residual-tie policy, seed 20261004. Selection assumptions: uniform one/two distinct choices for Q1, Q2, Q3 and Q5; uniform one choice for Q6. Q4 has no signal points and is omitted. Both policies see the same sampled answers; randomized residual ties use a separate seed 20261005. These are artificial uniform-answer diagnostics, not observed user distributions or production scoring tests.

Signals occur in four or five scored questions exactly as drafted. Average top-two inclusion is 22.22%; the 1.5-times threshold is 33.33%. No signal exceeds it in either policy. Mappings were not changed.

| Signal | Question frequency | Top two, stable residual order | Top two, random residual order |
| --- | ---: | ---: | ---: |
| Belonging | 5 | 25.31% | 22.83% |
| Teaching | 5 | 27.18% | 26.43% |
| Access | 4 | 18.16% | 16.85% |
| Creative expression | 5 | 27.35% | 27.00% |
| Justice | 4 | 16.46% | 17.13% |
| Stability | 4 | 16.36% | 17.24% |
| Healing | 5 | 24.04% | 25.27% |
| Problem solving | 4 | 20.35% | 21.22% |
| Independence | 5 | 24.79% | 26.03% |

No app-level scoring, direction-generator, reflection, retake, pairing, prefill, deletion, tab layout or device tests are claimed. TypeScript/lint/iOS and Android exports are pending implementation. Physical-device testing remains pending before release.

## Privacy draft and launch gates

No new app data is collected/stored by this branch. Proposed newly stored data, linked to authenticated UID: six-question selections; ranked signal results; selected audience groups; selected impact and phrase; generated Purpose Direction; completion/update timestamps; Check version; optional written reflection only with the explicit save checkbox. Compass would read the structured Purpose results by default and the reflection only if saved. No raw answers or reflection text would be included in the new analytics events. Existing local Path reflections remain a separate per-account, device-only store.

Renita/counsel review draft, reproduced from the brief (not published):

> If you take the Purpose Check in the iPurpose Compass app, we save your answers and the results we generate (your Purpose signals and Purpose Direction) to your iPurpose profile, and Compass uses them to personalize your experience. If you choose to save an optional written reflection, we store it as well; if you don't, we don't. You can retake the Purpose Check at any time and delete your Purpose results from Account at any time. Deleting your account also deletes them.

The disclosure must also account for stored Audience/Impact when final wording is approved. This document supplies the inventory for Renita's Apple App Privacy/Google Play Data safety review; it does not claim those store declarations were reviewed or changed.

All three launch gates remain open: approved and updated privacy policy; owner review of store disclosures against actual implemented storage/use; verified dedicated/full deletion. No public build or store upload was prepared.

## Reporting

Verification: source inspection on fresh origin/main, read-only inspection of the existing workspace Path, and the reproducible simulation above. Application behavior, protected Clarity code, Home and version files are unchanged in this branch. Local commit hash is reported in chat after commit. Nothing was pushed, merged, sent or deployed.

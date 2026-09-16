# Physical Android QA findings — updated 2026-09-14

Current physical-device build: **Android 1.0.1 / version code 2** (`fb45b47`).
Working branch: `codex/android-launch-qa`.

**Authentication and account deletion are no longer current release blockers.**
Renita completed controlled physical-device retesting with a newly created
disposable account and known credentials. All five checks passed:

| Physical-device check reported by Renita | Result |
| --- | --- |
| Account creation | PASS |
| Sign out | PASS |
| Manual sign-in after sign-out | PASS |
| Repeated sign-in without an authentication error | PASS |
| Account deletion from the Android app | PASS |

The changes below are prepared locally for review. **Android 1.0.2 / code 3 is now authorized for Internal Testing only.**
No API deployment, Clarity email enrollment, or email send was performed in this pass. The previously deployed deletion index remains live.
The app manifest is now version 1.0.2 / code 3 for the newly authorized Internal
Testing build. The physical-device passes below still refer to 1.0.1 / code 2.

## 1. Authentication: controlled retest passed

The prior generic sign-in error was not reproducible with controlled credentials
on the physical device. Its original cause remains unconfirmed. Do not describe
password capitalization as a proven explanation or authentication as a current
release blocker.

The earlier production Firebase SDK check also passed account creation, sign-out,
repeat sign-in, and authenticated onboarding/profile requests. Production Firebase
project/API-host configuration matched the mobile build.

Completed password usability corrections:

- Shared `PasswordField` used by Sign In, Create Account Password and Confirm
  Password, and account-deletion confirmation.
- Each field starts hidden and has its own explicit Show/Hide password button.
  Toggling changes visibility only; it does not change the entered value.
- Capitalization and autocorrect disabled explicitly for every password field.
- Create Account uses `autoComplete="new-password"` on both fields. Sign In and
  deletion use `autoComplete="current-password"`. All remain eligible for Android
  autofill with `importantForAutofill="yes"`; email fields use `username` semantics.
- No `off`, `no`, or `noExcludeDescendants` autofill setting was introduced.
  Cross-platform `autoComplete` supplies the password purpose without conflicting
  `textContentType` hints. See the [React Native input documentation](https://reactnative.dev/docs/textinput#autocomplete).
- Deletion confirmation clears the password and hides it again when reopened.
- Existing sign-in error wording, approved typography and field styling remain.

Create Account keyboard correction:

- Shared `KeyboardAwareForm` keeps the existing content in a flexing ScrollView;
  Android keyboard avoidance now uses `height` with the top safe-area offset.
- Password focus, keyboard opening, and viewport layout changes remeasure the
  focused field against the visible viewport/keyboard edge and scroll it into view.
- Measurement includes the Show/Hide control. Confirm Password is fully revealed
  when it fits; oversized font-scaled content aligns to its top and remains scrollable.
- The submit action stays inside the same scrollable content; handled taps work
  with the keyboard open. Deletion confirmation uses the same behavior.
- No dependency or Android manifest change was required; `resize` was already set.

**Verification boundary:** automated native-measurement doubles cover a 360×640
screen, keyboard tops at 360 and 280, viewport resize without a keyboard event,
focus switching, and enlarged field geometry.
They are not an Android IME, rendering, or password-manager test. This workspace
has no `adb`, Android emulator, or attached-device tooling. The changed controls
and small-screen keyboard behavior still require physical QA in the next approved
build; Renita's passes above apply to build 1.0.1, not the unbuilt changes.

## 2. Deletion: confirmed root cause, repaired in production

Production `DELETE /api/account` reproduced HTTP 500 after successful fresh
password authentication. Vercel runtime log for request
`iad1::iad1::7vn8v-1789386414852-af3bdcef2fc5` identifies:

> 9 FAILED_PRECONDITION: The query requires a COLLECTION_GROUP_ASC index for collection comments and field authorUid.

`lib/accountDeletion.ts` queries all `comments` subcollections by `authorUid`.
The required single-field collection-group index was absent both in production
and in the repository (`fieldOverrides` was empty).

**Repair completed:** added the `comments.authorUid` ascending collection-group
index in `firestore.indexes.json`, retaining the default collection indexes;
deployed with `firebase deploy --only firestore:indexes --project ipurpose-mvp
--non-interactive`; confirmed the new index is READY. The four existing composite
indexes were retained. Added a regression check in `tests/account-deletion.node.ts`.
No API redeployment or Android rebuild was needed for this repair.

Production verification used only disposable UID `NQWG6pUgYeeHoGfd9tpGu3TI0cU2`:

- Seeded a profile, nested conversation/message, Clarity submission, community
  post, own comment, another test author's comment, and a synthetic purchase
  record (no payment or real transaction).
- Fresh password authentication then `DELETE /api/account` returned **200** with
  `success: true`, request `iad1::iad1::j6shg-1789396726394-285bb3cc94ee`.
- Profile, nested conversation/message, submission and own comment were absent.
- Community post was tombstoned; the other test author's reply remained intact.
- Synthetic purchase was retained with its UID removed and deletion timestamp set.
- Subsequent sign-in with the previously successful credentials failed with
  `auth/invalid-credential`, consistent with the Auth identity being deleted.
- Remaining synthetic retention fixtures were removed after verification.

An earlier failed deletion can have removed some records before reaching the
missing-index query; it did not remove Firebase Auth. This explains why retryable
backend failure could coexist with a still-valid account. No existing customer
account was accessed or deleted during verification.

## 3. Unapproved copy: source and scope

The exact welcome eyebrow `YOUR SOUL · YOUR SYSTEMS · YOUR NORTH` was introduced
in commit `ccf88ee` on September 3, 2026, titled `fix: add branded mobile front door`,
when `mobile/src/app/welcome.tsx` was added. It predates the Android launch-QA
commit and was not introduced by the inset changes. Git history establishes
where it entered the code; it does not establish brand approval.

Related unapproved terminology exists in:

- `mobile/src/app/(app)/(tabs)/index.tsx`: `Stay aligned. Follow your north.`
  The phrase entered in commit `69c1c1a`, `feat: add functional Compass home`.
- `mobile/src/components/ClarityCheckFlow.tsx`: `Find your north.`
  It entered in commit `854ada1`, `feat: add mobile clarity onboarding`.

Completed edits use existing approved terminology only: the welcome framework
is now **Soul → Systems → AI**; Home retains **Stay aligned.**; the onboarding
heading now uses the existing feature name **Clarity Check**. Framework signatures
and subtitles use **Soul → Systems → AI** consistently.

These approved strings remain verbatim:

- Welcome, Beautiful Soul
- A grounded companion for finding clarity, building what supports you, and moving with intention.
- Begin where you are.

## 4. Logo inventory and completed reference replacements

This inventory was reported before replacement. Paths are relative to `mobile/`.

| Asset | Current appearance after this correction | Change |
| --- | --- | --- |
| `assets/release/app-icon.png` | General app icon / iOS fallback | Existing approved asset unchanged. |
| `assets/release/adaptive-icon-foreground.png` | Android launcher; now also AuthScaffold and BrandHeader | Existing approved transparent gold compass/star-and-waves emblem reused verbatim. |
| `assets/release/adaptive-icon-background.png` | Android launcher background | Unchanged solid indigo background. |
| `assets/release/splash-mark.png` | Launch splash | Unchanged; binary-identical to adaptive foreground. |
| `assets/brand/compass-logo.png` | No active mobile source references remain | Legacy file retained; its two imports were replaced. No image was edited. |
| `assets/brand/welcome-atmosphere.jpg` | Welcome, Sign In, Create Account background | Unchanged atmospheric artwork. |
| `assets/release/play-store-icon.png` | Store-listing artwork, no runtime reference | Unchanged. |

AuthScaffold covers Welcome, Sign In and Create Account. BrandHeader covers Home,
Clarity Check/onboarding, Compass, Account, Anchor, Focus and Timezone.
The halo/glow, circular containers, decorative star divider, typography, palette,
and background artwork remain. Functional navigation glyphs and account initials
are unchanged. The commented-out Home `compass-texture.png` reference remains
inactive; its file is absent.

## 5. Completed naming and exact file changes

Product headers now say **iPurpose**. The Compass screen explicitly selects
**iPurpose Compass**, the guided-experience header. Assistant message labels say
**Compass**. All four backend response-mode prompts use the approved hierarchy,
**Soul → Systems → AI**, and introduction **“I’m Compass, your guide through
iPurpose.”** Existing coaching instructions and technical route/function names
remain. The two user-visible API fallback errors now say Compass.

The backend naming corrections are local and require the normal backend release
to affect generated responses; no deployment was initiated in this pass.

Exact repository-relative paths:

| File | Completed change |
| --- | --- |
| `firestore.indexes.json` | Previously added and deployed deletion index. |
| `tests/account-deletion.node.ts` | Previously added required-index regression. |
| `mobile/src/components/PasswordField.tsx` | New shared visibility/autofill/input component. |
| `mobile/src/components/KeyboardAwareForm.tsx` | New shared focused-field scrolling and keyboard avoidance. |
| `mobile/src/app/create-account.tsx` | Both password controls; username autofill semantics. |
| `mobile/src/app/sign-in.tsx` | Shared password control; username autofill semantics. |
| `mobile/src/app/(app)/(tabs)/account.tsx` | Deletion password control, visibility reset, shared keyboard form. |
| `mobile/src/components/AuthScaffold.tsx` | Shared keyboard form, iPurpose wordmark, canonical framework, approved emblem import. |
| `mobile/src/components/BrandHeader.tsx` | iPurpose default, explicit guided-experience option, approved emblem import. |
| `mobile/src/app/(app)/(tabs)/mentor.tsx` | Explicit iPurpose Compass experience header. |
| `mobile/src/components/MessageBubble.tsx` | Compass speaker label. |
| `mobile/src/app/welcome.tsx` | Canonical framework eyebrow; approved welcome copy retained verbatim. |
| `mobile/src/app/(app)/(tabs)/index.tsx` | Removed unapproved phrase; retained Stay aligned.; canonical framework. |
| `mobile/src/components/ClarityCheckFlow.tsx` | Clarity Check heading; canonical framework. No completion/enrollment logic changed. |
| `lib/ai/prompts/ipurposeMentorPrompts.ts` | Approved guide identity/framework/introduction in all four modes. |
| `app/api/ai/route.ts` | User-visible fallback errors use Compass. |
| `mobile/tests/launch-qa.test.cjs` | Five new interaction/copy/geometry regression tests and native boundary mocks; backend assertions moved to a separate backend test. |
| `mobile/app.json` | Authorized Android 1.0.2 / version code 3. |
| `tests/compass-branding.node.ts` | Separate backend-only branding assertions; not part of the Android build changes. |
| `mobile/PHYSICAL_ANDROID_QA_FINDINGS.md` | Updated findings, physical passes, change inventory, validation. |
| `mobile/CLARITY_WORKFLOW_AUDIT.md` | Read-only web/mobile workflow findings and approval proposal. |
| `mobile/RELEASE_DEVICE_TESTS.md` | Next-pass password, keyboard, autofill and approved-copy checks. |

Only the authorized app version/code changed in the manifest. No binary logo,
font, palette, EAS profile, or dependency file changed. No navigation or Clarity enrollment behavior changed. The unrelated
untracked `app/delete-account/page 2.tsx` was not touched.

## 6. Automated results and outstanding review

- Mobile interaction suite: **12/12 pass**, including all seven previous checks.
- Root onboarding/account-deletion suite: **22/22 pass**.
- Mobile TypeScript: **PASS**.
- Mobile ESLint: **PASS**, no warnings/errors.
- Changed backend files ESLint: **0 errors**, one pre-existing unused
  `inferredLens` parameter warning.
- `git diff --check`: **PASS**.

React component review: hooks remain unconditional, keyboard listeners clean up,
scroll metrics use refs, visibility state is isolated per field, and the new
controls have explicit accessible button labels and a minimum 44-point height.
Automated source guards reject the unapproved wording and legacy logo references
in active mobile source; the history above intentionally retains the old text as
a record of what was removed.

The [Clarity workflow audit](CLARITY_WORKFLOW_AUDIT.md) reports the current workflow
and a concrete integration proposal. Its enrollment/repeat-completion behavior
requires Renita's review, as explicitly requested. Android 1.0.2 / code 3 is now authorized for Internal Testing only. Clarity
workflow implementation remains deferred. See ANDROID_1_0_2_BUILD.md for the build record.

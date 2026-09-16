# Android QA restoration — version 1.0.2 (5)

## Cause and source

The accepted Android build 4 was built from `codex/launch-metrics` commit
`965ae03` (version 1.0.0 / code 4), EAS build
`848869d4-c405-4680-831b-815b2df5eb22`.
Its source checkout is `/Users/renita.hamilton/Documents/ChatGPT/iPurpose Metrics/ipurpose-next`.
The remote branch was still at `7c72bef`; the only additional change in the
local build-4 commit was the code-4 bump.

The analytics branch did not contain either validated Android QA commit:

- `fb45b474844c30465f4896a16c0aa5a7d63db809`: Android safe areas, navigation,
  Compass layout, verification, spacing/contrast, environment-save and retake state.
- `2f567c3df478f6c08469a2f1443e9a80be7e21cd`: password visibility/autofill,
  keyboard-aware forms, approved naming/copy and emblem corrections.

The QA fixes were absent from the analytics source; the comparison does not
show Firebase causing the layout regression. The mobile-only combined QA diff
was applied using Git's three-way merge onto `965ae03`. Only app.json required
conflict resolution. The marketing version is restored to 1.0.2 and Android
versionCode is 5, above all previously used Play codes.

## Restored files and behavior

All paths in this section are relative to `mobile/`.

| Files | Restored behavior |
| --- | --- |
| `src/components/ScreenSafeArea.tsx`, `src/app/_layout.tsx`, `src/app/(app)/_layout.tsx`, `anchor.tsx`, `focus.tsx`, `timezone.tsx`, `AuthScaffold.tsx` | Safe-area/status-bar ownership throughout the app, initial window metrics, standalone bottom insets |
| `src/app/(app)/(tabs)/_layout.tsx` | Bottom navigation insets, scaled-label space, hide tabs while keyboard is open |
| `src/app/(app)/(tabs)/mentor.tsx`, `app.json` | Separate bounded chat scrolling/composer, message-edge padding, reading-position preservation, Android resize keyboard mode |
| `src/components/BrandHeader.tsx`, tab `index.tsx`, `account.tsx`, `ClarityCheckFlow.tsx`, `src/theme.ts` | Shared header spacing, Account card spacing, disabled/secondary contrast, destructive-action separation |
| `src/components/EmailVerificationControls.tsx`, tab `account.tsx` | Send/resend verification, explicit and app-return refresh, throttling/offline handling |
| `src/components/VisualEnvironmentPicker.tsx`, `src/context/VisualEnvironmentContext.tsx` | Loading/error/save states, confirmed preference persistence, prevent save races after account changes |
| `src/components/ClarityCheckFlow.tsx` | Begin again clears only local questionnaire state; completed retakes return to Account without changing onboarding/focus/preferences |
| `src/components/PasswordField.tsx`, `KeyboardAwareForm.tsx`, `AuthScaffold.tsx`, `src/app/sign-in.tsx`, `create-account.tsx`, tab `account.tsx` | Independent Show/Hide controls, exact credentials/autofill preservation, focused fields visible when keyboard opens |
| `src/app/welcome.tsx`, tab Home/Compass, `BrandHeader.tsx`, `AuthScaffold.tsx`, `MessageBubble.tsx`, `ClarityCheckFlow.tsx` | Approved Soul → Systems → AI wording, product/experience/guide hierarchy, existing approved emblem; approved welcome copy retained |
| `package.json`, `package-lock.json`, `tests/launch-qa.test.cjs` | Restored QA test command/renderer, interaction tests, analytics/config coexistence assertions |

The floating C is a device customer-care overlay, not an iPurpose control.
No substitute design or branding was introduced. The Clarity email workflow
was not implemented. Original QA documents are retained as historical evidence.

## Analytics preserved

Unchanged from build 4:

- `app.config.js`, `firebase.json`, `react-native.config.js`, `eas.json`.
- `EXPO_PUBLIC_LAUNCH_ANALYTICS_ENABLED` and `GOOGLE_SERVICES_JSON` handling.
- Firebase native app/analytics and Expo build-properties dependencies.
- `src/lib/analyticsCore.ts`, `src/lib/analyticsEvents.ts`, signup tracking in
  `src/context/AuthContext.tsx`.
- Existing root analytics initialization and Clarity start/completion call sites.
- Android package `com.ipurpose.mobile`, app icon/splash assets and EAS project.
- All non-mobile backend/web analytics files.

Twenty-one restored source files exactly match QA commit `2f567c3`. The root
layout and Clarity flow differ only by the retained analytics additions.
The regression test exercises the restored retake/reset path while capturing
actual analytics-attempt events, preserving the existing once-per-mounted-flow
semantics. This task does not change analytics counting policy.

## Validation

- Clean `npm ci --ignore-scripts --no-audit --no-fund --prefix mobile` succeeded.
- Mobile `npm run typecheck` passed.
- Mobile `npm run lint` passed.
- Mobile `npm run test:launch`: 13 passed.
- Root `npm run test:launch-metrics`: 4 passed.
- Root `npm run test:onboarding`: 18 passed.
- Root `npm run test:account-deletion`: 3 passed.
- Android Expo export with analytics enabled and existing local Firebase config passed.
- Resolved local config: 1.0.2 / code 5, `com.ipurpose.mobile`, analytics enabled,
  existing Google services file, keyboard mode `resize`.
- `git diff --check` passed; no non-mobile source changes.

These are automated checks and Android JavaScript bundle validation, not a
new native Gradle build or physical-device certification. Backend deletion
checks are automated; no production account was deleted during this restoration.
The original QA workspace's uncommitted backend changes were not copied here.

## Build handoff

Run from the analytics checkout, not the older QA checkout:

```sh
cd "/Users/renita.hamilton/Documents/ChatGPT/iPurpose Metrics/ipurpose-next/mobile"
npx eas-cli build --platform android --profile production --message "Android 1.0.2 (5) - restored QA with Firebase Analytics - Internal Testing only"
```

The existing production profile creates the Play AAB and uses the production
EAS environment. The profile name does not publish a Play production release.
Keep `EXPO_PUBLIC_LAUNCH_ANALYTICS_ENABLED=true` and the existing
`GOOGLE_SERVICES_JSON` EAS file variable. No build or submission was started
by this restoration task.

Upload the resulting AAB to Play Internal testing only. Confirm Play shows
versionCode 5 and versionName 1.0.2. Update through the tester Play listing and
verify version 1.0.2 / code 5 via Android package information (or, when adb is
available, `adb shell dumpsys package com.ipurpose.mobile`). A version name
alone is insufficient because code 3 also used 1.0.2.

Before sign-off, retest safe areas/navigation, Compass history/composer with
the keyboard, password controls, verification actions, saved environment after
restart, and scoped Begin again behavior. Cover notch/non-notch, small/large
screens, gesture/three-button navigation, and increased font size. Verify
analytics events still reach Firebase on the installed build. See
`RELEASE_DEVICE_TESTS.md` for the existing device checklist.

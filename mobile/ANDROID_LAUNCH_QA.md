# Android public-launch QA — updated 2026-09-13

Release status: implementation ready for native device testing, **not a completed
Android release sign-off**. The workspace has no Android SDK, adb, emulator, or
connected Android testing tool. No updated signed build has been installed or
published by this QA run.

Updated internal-test target: **version 1.0.1, Android version code 2**. The previous
EAS Android build is version 1.0.0, code 1. Build with the existing `production`
profile to create a store AAB, then upload it to Play Console Internal testing.
The profile name does not publish to production.

The existing branding, Italiana/Marcellus fonts, core palette, environment
backgrounds, card treatments, and four-tab navigation are retained. The secondary
text shade and disabled surfaces were adjusted for readability.

## Requested items

| Item | Change/evidence | Remaining check |
| --- | --- | --- |
| 1 — top insets (blocker) | Shared `ScreenSafeArea` replaces all legacy native SafeAreaViews. Root seeds initial window metrics. All screens protect top/side edges; status-bar icon style follows the focused screen. | Native screenshots on cutout/non-cutout devices, including cold launch and route changes. |
| 2 — bottom insets (blocker) | Tab height and padding include navigation inset. Tab scenes omit their own bottom inset; standalone screens and deletion modal include it. Scaled labels can wrap, with extra tab height. | Gesture and three-button navigation on native devices. |
| 3 — floating C (closed; not an iPurpose defect) | Owner confirmed on 2026-09-13 that this is a Metro/customer-care overlay on the Android device, outside iPurpose. | None. Removed from release blockers. |
| 4 — Compass/keyboard (blocker) | Android explicitly uses resize mode plus keyboard avoidance. Tabs hide while typing. Composer stays outside the message list. Intro/history controls have a bounded scroll area; chat/empty state scroll separately. | Signed Android build with keyboard open, multiline input, sending and errors, especially small screens. |
| 5 — chat clipping | Padded message-list edges; Android clipped-subview removal disabled. Resize follows latest only while near the end. Reading older history does not force a jump. Error area also scrolls. | Swipe to first/last message, long replies, keyboard transitions. |
| 6 — headers | Four tab screens share 20dp side gutters and 8dp top spacing inside the safe area; Clarity brand starts at the same left edge. Brand row can shrink/wrap. | Font scaling and notch screenshots. |
| 7 — contrast | Secondary light-surface text darkened. Disabled Environment in use and Send no longer fade the whole control. Authentication, Clarity primary buttons and delete confirmation also retain readable disabled text. | Actual rendered backgrounds and accessibility review. |
| 8 — Account spacing | Consistent inner padding, preference-card gaps, and bottom padding on the final My Compass section. Email status/actions wrap below the address. | Small display, long email, 200% font scale. |
| 9 — Delete account | Preserved trash label, salmon border, destructive explanation and divider. Confirmation is now inset-safe and scrollable with keyboard avoidance. Buttons can grow with text. | Disposable-account cancellation/confirmation on native devices. |
| 10 — verification | Send/resend, explicit status check, return-from-email refresh, throttle/offline feedback. Verified accounts hide unnecessary actions. Verification remains non-blocking, consistent with the existing API authentication policy. | Actual email delivery/link completion on a disposable account. No email was sent by this QA run. |
| 11 — environment persistence | Choices lock during loading/saving; failed loads offer retry instead of claiming Environment in use. Confirmed API preference survives provider remount in tests; preview/failure never writes a new preference. Late saves cannot update a signed-out/different user's UI. | Real save → force-stop → relaunch, all environments/Auto; offline/retry; sign out/in. |
| 12 — Begin again | Clears only local questionnaire answers/result. Completing a retake returns to Account and resets the tab to its intro. Tests complete a retake and prove no focus, onboarding-completion or preference writes. | Real-account data comparison before/after retake. Submission intentionally updates archetype/results; Begin again alone performs no API write. |
| 13 — device matrix | Matrix below is prepared; native execution is pending. | Every row below. |

## Automated evidence

- `cd mobile && npm run typecheck` — pass.
- `cd mobile && npm run lint` — pass.
- `cd mobile && npm run test:launch` — 7 component/interaction tests pass.
  Native hosts and Firebase/API boundaries are mocked. Tests cover nine combinations
  of bottom-inset inputs (0/24/48dp) and font-scale inputs (1/1.3/2), state isolation,
  persistence across provider remount, verification feedback, and chat follow behavior.
  They do **not** emulate Android rendering or a real keyboard.
- `node --import tsx --test tests/onboarding.node.ts tests/account-deletion.node.ts`
  from repository root — 21 checks pass; no live account deletion.
- Android Metro/Hermes production export — pass. This confirms bundle compilation,
  not native APK build/install or runtime behavior. Temporary output:
  `/private/tmp/ipurpose-android-launch-bundle-final`.
- Contrast checks: secondary text passes 4.5:1 against white, mist, and the three
  tested light card tints; disabled Environment in use passes against its surface.
- One development-only dependency added: `react-test-renderer@19.1.0`, matching
  mobile React. The renderer emits its upstream deprecation notice during tests.

## Native release matrix — all pending

Run each row at default, approximately 130%, and maximum available font scale
(target 200%). Use actual display dimensions and available OS settings; record
those values rather than assuming emulator settings match a physical device.

| Device profile | Android | Navigation | Keyboard |
| --- | --- | --- | --- |
| Small non-cutout, about 320–360dp wide | Oldest supported test OS | Gesture | Closed/open |
| Small non-cutout, about 320–360dp wide | Oldest supported test OS | Three-button | Closed/open |
| Small cutout/punch-hole, about 360dp wide | Android 15+ edge-to-edge | Gesture | Closed/open |
| Small cutout/punch-hole, about 360dp wide | Android 15+ edge-to-edge | Three-button | Closed/open |
| Large cutout, about 412–480dp wide | Android 15+ edge-to-edge | Gesture | Closed/open |
| Large cutout, about 412–480dp wide | Android 15+ edge-to-edge | Three-button | Closed/open |

For every configuration:

1. Visit Welcome, Sign in, Create Account, onboarding, Home, Clarity Check,
   Compass, Account, Anchor, Focus, Timezone, and the deletion confirmation.
   Capture top/bottom bounds and confirm every action is reachable by scrolling.
2. In Compass, use empty, short, and long history. Check top/last messages,
   multiline composer, send/loading/error states, keyboard show/hide, and Android
   Back. Scroll older history while a reply arrives and confirm it remains readable.
3. Check tab labels/touch targets and that the composer sits above tabs with the
   keyboard closed, and above the keyboard with tabs hidden while typing.
4. The floating C is the device’s Metro/customer-care overlay, confirmed by the
   owner. It is excluded from iPurpose defects and release sign-off.
5. Save each visual environment; force-stop and relaunch; change tabs; sign out/in.
   Preview another environment and leave without saving. Verify offline failures
   preserve the saved choice and that retry restores it.
6. Verify a disposable email using the resend/check actions and return from the
   mail app. Confirm Account updates to Verified.
7. Record focus, timezone, environment, anchor and history before Begin again.
   Confirm beginning/backtracking does not change them. Complete the retake;
   confirm only expected Clarity/archetype results change.
8. Open/cancel Delete account at maximum font scale with the keyboard showing.
   Perform actual deletion only with a disposable account, following
   `RELEASE_DEVICE_TESTS.md`.

Record for each run: device model, OS/API, cutout, width/height in dp, font/display
scale, navigation mode, keyboard/IME, app version/code, source commit, timestamp,
pass/fail per item, screenshot/video path and any remaining defect. Keep items
1, 2, and 4 release-blocking until this evidence is available.

## Platform references

- [Safe area ownership and edges](https://appandflow.github.io/react-native-safe-area-context/api/safe-area-view/)
- [Expo keyboard handling](https://docs.expo.dev/guides/keyboard-handling/)
- [Expo SDK 54 Android configuration](https://docs.expo.dev/versions/v54.0.0/config/app/)

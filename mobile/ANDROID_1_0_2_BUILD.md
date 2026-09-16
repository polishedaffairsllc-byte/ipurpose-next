> Historical code-3 build notes. For the restored analytics build 1.0.2 (5), see [ANDROID_QA_RESTORATION_CODE_5.md](ANDROID_QA_RESTORATION_CODE_5.md).

# Android 1.0.2 / version code 3 — Internal Testing

Renita authorized this Android build after reviewing the mobile correction pass.
Distribution is limited to Google Play **Internal testing**; no public release or
automatic store submission is authorized by this build command.

- Package: `com.ipurpose.mobile`
- App name: `iPurpose`
- Version: `1.0.2`
- Android version code: `3`
- EAS project: `ipurpose/ipurpose-mobile`
- Profile: `production` (existing production environment and signing credentials;
  produces the AAB required by Google Play, does not publish it)
- Source branch: `codex/android-launch-qa`

Included: Show/Hide passwords; consistent password input/autofill settings;
keyboard-aware form scrolling; approved naming/framework copy; approved existing
emblem references; verified authentication/deletion status documentation.

Excluded: Clarity email integration/enrollment changes, pending server prompt/API
naming changes, and the unrelated local deletion-page draft. The production
deletion index repair is already live and does not require another Android change.

Build command (run from the isolated checkout's `mobile/` directory):

```sh
npx eas-cli@latest build --platform android --profile production --non-interactive --freeze-credentials --no-wait --message "Android 1.0.2 (3) - Play Internal Testing only"
```

Build ID, verified source commit, status and artifact link will be recorded once
EAS creates and completes the build. No Clarity workflow implementation is part
of this release.

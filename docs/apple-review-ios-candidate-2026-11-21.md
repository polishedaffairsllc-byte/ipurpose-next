# Apple November 17 review — signed iOS candidate preparation

Status: **DRAFT / HOLD**. This file prepares an iOS candidate; it does not prove any signed build was created, uploaded or tested. No App Store submission is authorized.

## Verified starting point

- Apple's Nov 17, 2026 rejection had three findings: (1) third-party OpenAI personal-data disclosure and opt-in (5.1.1(i)/5.1.2(i)); (2) cannot **create a new account** on iPad Air 11-inch M4, iPadOS 27.2.1 (2.1(a)); (3) reviewer could not **sign in** with supplied demo credentials (2.1). Do not confuse signup with sign-in or reintroduce prior 4.3(a) as part of this letter.
- PR #97 (backend) and PR #142 (native) merged on November 19. Production backend Vercel alias `ipurposesoul.com` was independently verified READY at SHA `ab93546583703e58e9b7c629a2681334e563c7ae`.
- The owner's earlier signed/submitted iOS record reports **1.0.4 (15)**; the repository was behind at **1.0.3 (4)**. This draft proposes **1.0.4 (16)**, provisionally. Neither the owner's earlier record nor GitHub is a live App Store Connect/EAS inventory. **Do not assume 16 is unused.**
- This branch updates proposed iOS release version metadata (`expo.version` also affects Android packaging), adds a separate iOS simulator QA profile to `mobile/eas.json`, this checklist, and a draft Apple response. It does not change authentication or AI features.
- Expo project: `@ipurpose/ipurpose-mobile`, EAS project ID `fae9cc3c-4a0b-461a-b661-a9a5c6616ce3`. iOS bundle ID `com.ipurpose.mobile`; App Store Connect app ID `6818498930`.
- `mobile/eas.json` uses **local** version source, `testing` store-distribution build profile, `autoIncrement:false`, and no automatic submission. The separate `ios-review-simulator` profile produces a simulator-compatible artifact from the same source SHA, **not** an App Store-signed device IPA. `ios.supportsTablet:false` leaves iPhone compatibility-mode behavior on iPad requiring verification.

## Release gate A — live inventory and immutable source

1. On the authenticated Expo owner account, inspect recent EAS iOS builds (e.g., from `mobile/`, `eas build:list --platform ios --limit 20 --json` with an approved, pinned CLI). In App Store Connect inspect iPurpose > TestFlight > Builds / Build Uploads for actual latest uploaded version and build number, and the review version/build Apple rejected.
2. **Confirm 1.0.4 (16) is available and compatible with the current App Store Connect version record.** If the live inventory differs, change `expo.version` and `expo.ios.buildNumber` in this PR *before merging*. Do not reuse a submitted build number.
3. Record previous Apple version/build, highest uploaded iOS build, candidate version/build, existing EAS build IDs, intended environment, and authorized reviewer. Never paste App Store credentials, reviewer passwords, Expo tokens or signing keys in GitHub.
4. Confirm PR #97 and #142 changes exist in the candidate base; run required CI/mobile tests on the exact proposed commit. Resolve CI failures or record independent exceptions; do not ignore native QA blockers. Distinguish the unrelated homepage Playwright heading mismatch from mobile tests.
5. Require founder review of exact candidate metadata and GitHub SHA before merging this PR to protected `main`. PR merge may create a Vercel production deployment via the existing Git integration; do **not** merge until authorized with that implication in mind.

## Release gate B — signed candidate (separate authorization)

After gate A and founder release approval, a signed-build operator with access to the **existing owner-controlled Expo/EAS account**, correct Apple signing permissions and build environment should:

1. Check out the approved exact main SHA, verify clean working tree and candidate `mobile/app.json` values. Record `git rev-parse HEAD`.
2. Use the existing EAS iOS signing setup; inspect account/project/environment names **without printing secret values**. Confirm production backend target remains `https://ipurposesoul.com`.
3. Start exactly **one iOS store-distribution EAS build** with the repo's `testing` profile (`eas build --platform ios --profile testing --wait`, using an approved pinned EAS CLI and authenticated owner account), *without* `--auto-submit`, `eas submit`, App Store API uploads, or secret-bearing artifacts. A successful build is not proof of Apple approval or upload.
4. Capture EAS build ID/URL, Git SHA, version/build, distribution profile, environment name, signing status, and resulting signed artifact checksum. Compare signed app metadata to the config and record whether it exists in App Store Connect; do not claim an upload unless independently confirmed.

No tool in the current ChatGPT/GitHub read-only Codex flow can substitute for EAS/ASC authentication or iOS simulator/cloud-device runtime testing. Never place credentials in a GitHub issue, CI logs, or a public repository.

## Release gate C — build-matched native QA

**Two distinct artifacts:** a signed **store device build** (`testing` profile) for real iPhone/iPad remote hardware or TestFlight, and—if iPad simulator testing is needed—a separately authorized **simulator-compatible build** (`ios-review-simulator` profile) from the **same reviewed Git SHA**. A store-signed device IPA cannot install in an iOS simulator. The simulator build uses the production EAS environment for configuration parity, but this is not proof that Apple's exact hardware or store-signed device binary was exercised. Record the distinct EAS build IDs, artifact types, and backend revision; do not quietly treat the two artifacts as identical. Building the second artifact may incur EAS usage and needs approval.

The founder already validated the intended reviewer login on a real iPhone in prior work; recover that evidence, not unnecessary repetition. A new build-specific check is required because first-run admission routing changed.

| Apple concern | Test and required evidence |
|---|---|
| Fresh account on iPad | Use the signed candidate on compatible remote iPad hardware, **or** use the separate simulator build on an iPad simulator; clearly label which artifact/device/OS (or substitution) was exercised. Install fresh, create a unique test account, acknowledge signup disclosure, complete onboarding/Clarity entry, sign out/in. Record UI video or screenshots, sanitized errors, and whether iPhone compatibility mode is used. A simulator does not prove exact Apple M4 hardware. |
| AI privacy | Before any AI provider request, the UI must identify OpenAI, list the data categories sent, and require a clear Allow/Decline. Decline must keep non-AI features usable and prevent sending; Allow enables one Compass call; Account withdrawal blocks future calls. Use sanitized request evidence without message contents or authorization headers. |
| Retry and isolation | After permission, retry a lost-connection Compass message with the same stable ID; verify no duplicate provider call and draft recovery. New account must not inherit another account's permission. |
| Demo account | Once the disclosed password is rotated in the authorized account system, verify the exact account in the **new signed candidate** reaches full relevant features; securely update App Store Connect reviewer information. No credentials in GitHub. |

## Release gate D — founder GO and reviewer submission

The response to Apple must be factual and separate the three findings. Include actual version/build and specific testing environments only after completed; provide concise onboarding and OpenAI Allow/Decline reviewer instructions, and link published privacy page `https://ipurposesoul.com/privacy`. Only the authorized submission owner can select the processed build and send it to Apple, **after separate founder GO**. No code merge or signed build alone is a resubmission.

**Current decision: HOLD** until release gates A–C provide real evidence. Track all artifacts, owners and evidence in issue #143: https://github.com/polishedaffairsllc-byte/ipurpose-next/issues/143

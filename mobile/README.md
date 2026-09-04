# iPurpose Mobile

Expo/React Native prototype for the iPurpose Companion.

## Run on a phone

1. Install Expo Go from the iOS App Store or Google Play.
2. From the repository root:

```bash
cd mobile
npm install
npm start
```

3. Scan the QR code with your phone.
4. Sign in with the same iPurpose Firebase email/password account used on the website.

The prototype defaults to the production iPurpose API and the existing `ipurpose-mvp` Firebase project.

## Release builds

The EAS build profiles are defined in `eas.json`:

- `preview` creates an internally distributed build with the EAS `preview` environment.
- `production` creates a store-ready build with the EAS `production` environment.

The first release configuration is locked to:

- App name: `iPurpose`
- Public version: `1.0.0`
- iOS bundle identifier: `com.ipurpose.mobile`
- iOS build number: `1`
- Android package: `com.ipurpose.mobile`
- Android version code: `1`
- iPhone-only for iOS v1
- Production API: `https://ipurposesoul.com`

`eas.json` uses the local app configuration as the version source so the first
signed builds use the committed build number and version code exactly.

Before the first cloud build, the app owner must:

1. Provide an approved opaque 1024×1024 PNG app icon plus approved Android
   adaptive-icon foreground/background assets.
2. Provide an approved 1024×1024 transparent PNG splash icon and confirm its
   solid background color.
3. Log in to the intended Expo owner account and link this directory to the
   intended existing EAS project.
4. Add every variable in `.env.example` as project-scoped plaintext values in
   both the EAS `preview` and `production` environments.
5. Configure EAS-managed Apple distribution credentials and an EAS-managed
   Android release keystore. Do not commit credentials or keystores.

The production API base must remain `https://ipurposesoul.com` without `www`. The Firebase values are public client configuration and are embedded in the app bundle; no Firebase Admin credential belongs in this mobile project.

Android explicitly blocks storage, overlay, and vibration permissions that the app does not use. The generated release manifest retains only network access.

This repository intentionally does not contain an EAS Submit profile or store credentials. Building does not publish or submit the app.

## First signed-build commands

Run these commands from `mobile/` after the final artwork is configured. Replace
the project ID placeholder with the ID of the owner-controlled Expo project.

```bash
npx eas-cli@latest login
npx eas-cli@latest init --id <OWNER_EXPO_PROJECT_ID>
npx eas-cli@latest env:list --environment preview
npx eas-cli@latest env:list --environment production
npx eas-cli@latest credentials --platform ios
npx eas-cli@latest credentials --platform android
npx eas-cli@latest build --platform ios --profile production
npx eas-cli@latest build --platform android --profile production
```

Do not use `eas submit` or `--auto-submit` for this milestone.

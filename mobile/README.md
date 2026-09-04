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

Before the first cloud build, the app owner must:

1. Confirm that `com.ipurpose.mobile` is the final iOS bundle identifier and Android package name.
2. Confirm the public app version and initialize the next iOS build number and Android version code.
3. Provide production app-icon and splash artwork, then add their paths to `app.json`.
4. Link this directory to the owner-controlled Expo project (`eas init`).
5. Add every variable in `.env.example` to the EAS `preview` and `production` environments.
6. Configure Apple signing credentials for iOS and an Android signing keystore in the owner-controlled EAS account.

The production API base must remain `https://ipurposesoul.com` without `www`. The Firebase values are public client configuration and are embedded in the app bundle; no Firebase Admin credential belongs in this mobile project.

Android explicitly blocks storage, overlay, and vibration permissions that the app does not use. The generated release manifest retains only network access.

This repository intentionally does not contain an EAS Submit profile or store credentials. Building does not publish or submit the app.

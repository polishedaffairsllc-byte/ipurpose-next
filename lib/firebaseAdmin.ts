import * as admin from "firebase-admin";

function parseServiceAccount(): any | undefined {
  const raw =
    process.env.FIREBASE_SERVICE_ACCOUNT ||
    process.env.FIREBASE_ADMIN_CREDENTIALS ||
    "";
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT is set but is not valid JSON. Check your env variable."
    );
  }
}

// 🚫 Skip Firebase Admin initialization during GitHub CI
if (process.env.CI === "true") {
  console.warn("CI detected — skipping Firebase Admin initialization.");
} else {
  // ✅ Normal initialization path (local + Vercel)
  if (!admin.apps.length) {
    const cred = parseServiceAccount();
    if (cred) {
      try {
        admin.initializeApp({ credential: admin.credential.cert(cred as any) });
      } catch (err) {
        console.warn(
          "Firebase Admin initialization failed (expected during build):",
          (err as { message?: string })?.message
        );
      }
    } else {
      console.warn(
        "Missing FIREBASE_SERVICE_ACCOUNT or FIREBASE_ADMIN_CREDENTIALS env var. Firebase Admin not initialized (expected during build/dev without credentials)."
      );
    }
  }
}

export const firebaseAdmin = admin;

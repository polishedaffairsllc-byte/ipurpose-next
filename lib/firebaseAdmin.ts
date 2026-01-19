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

// Check if we're in an environment where we shouldn't initialize Firebase
const shouldSkipFirebase = 
  process.env.CI === "true" ||  // GitHub Actions
  process.env.NODE_ENV === "production" && !process.env.FIREBASE_SERVICE_ACCOUNT; // Production without credentials

// 🚫 Skip Firebase Admin initialization during GitHub CI or in Vercel without credentials
if (shouldSkipFirebase) {
  console.warn("Firebase initialization skipped (CI or production without credentials).");
} else {
  // ✅ Normal initialization path (local + Vercel with credentials)
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
        "Missing FIREBASE_SERVICE_ACCOUNT or FIREBASE_ADMIN_CREDENTIALS env var. Firebase Admin not initialized."
      );
    }
  }
}

export const firebaseAdmin = admin;

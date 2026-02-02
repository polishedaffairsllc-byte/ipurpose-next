import * as admin from "firebase-admin";

function parseServiceAccount(): any | undefined {
  const raw =
    process.env.FIREBASE_SERVICE_ACCOUNT ||
    process.env.FIREBASE_ADMIN_CREDENTIALS ||
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
    "";
  if (!raw) return undefined;

  const tryParse = (value: string) => {
    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  };

  const direct = tryParse(raw);
  if (direct) return direct;

  try {
    const decoded = Buffer.from(raw, "base64").toString("utf8");
    const parsed = JSON.parse(decoded);
    return parsed;
  } catch {
    throw new Error(
      "FIREBASE service account env is set but not valid JSON/base64. Supply the raw JSON string or base64 encoded JSON."
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

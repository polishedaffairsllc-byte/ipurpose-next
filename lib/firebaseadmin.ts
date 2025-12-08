// lib/firebaseadmin.ts
import fs from 'fs';
import admin from 'firebase-admin';

// Support multiple ways of providing credentials:
// 1. FIREBASE_SERVICE_ACCOUNT (stringified JSON)
// 2. FIREBASE_SERVICE_ACCOUNT_KEY_PATH (path to JSON file)
// 3. Individual env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY

function getServiceAccount(): admin.ServiceAccount | null {
  const fromJsonEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
  const fromPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (fromJsonEnv) {
    try {
      const parsed = JSON.parse(fromJsonEnv);
      return {
        projectId: parsed.project_id || parsed.projectId,
        clientEmail: parsed.client_email || parsed.clientEmail,
        privateKey: (parsed.private_key || parsed.privateKey || '') as string,
      };
    } catch (err) {
      throw new Error('Failed to parse FIREBASE_SERVICE_ACCOUNT JSON: ' + String(err));
    }
  }

  if (fromPath) {
    try {
      const raw = fs.readFileSync(fromPath, 'utf8');
      const parsed = JSON.parse(raw);
      return {
        projectId: parsed.project_id || parsed.projectId,
        clientEmail: parsed.client_email || parsed.clientEmail,
        privateKey: (parsed.private_key || parsed.privateKey || '') as string,
      };
    } catch (err) {
      throw new Error('Failed to read/parse service account file at path: ' + String(err));
    }
  }

  if (projectId && clientEmail && privateKey) {
    return {
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    } as admin.ServiceAccount;
  }

  return null;
}

const serviceAccount = getServiceAccount();

// Export a mutable adminAuth reference which we'll initialize below.
export let adminAuth!: admin.auth.Auth;

// Initialize admin SDK if credentials are provided. If credentials are missing
// we throw a clear error so production does not accidentally run without
// proper admin privileges. Local development should provide a service
// account via `.env.local` (see docs) for realistic testing.
if (!admin.apps.length) {
  if (!serviceAccount) {
    // Allow an explicit, opt-in local development fallback only when
    // NODE_ENV=development and DEV_FALLBACK=true. This makes the fallback
    // safe (opt-in) and avoids accidental use in CI/production.
    const allowDevFallback =
      process.env.NODE_ENV === 'development' && process.env.DEV_FALLBACK === 'true';

    if (allowDevFallback) {
      console.warn(
        'WARNING: DEV_FALLBACK is enabled. Using an INSECURE development-only Firebase Admin fallback. Do NOT enable in CI/production.'
      );

      // Create a lightweight mock admin object with createSessionCookie
      const devAuth = {
        createSessionCookie: async (idToken: string, options: { expiresIn: number }) => {
          const payload = JSON.stringify({ idToken, ts: Date.now(), exp: options.expiresIn });
          return Buffer.from(payload).toString('base64');
        },
      } as unknown as admin.auth.Auth;

      adminAuth = devAuth as unknown as admin.auth.Auth;
    } else {
      throw new Error(
        'Missing Firebase admin credentials. Provide FIREBASE_SERVICE_ACCOUNT (JSON), FIREBASE_SERVICE_ACCOUNT_KEY_PATH (file path), or individual env vars FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.'
      );
    }
  } else {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    adminAuth = admin.auth();
  }
}
// Ensure adminAuth is assigned if admin was previously initialized outside
// this block (rare) or if initialization happened earlier.
if (!adminAuth && admin.apps.length) {
  adminAuth = admin.auth();
}

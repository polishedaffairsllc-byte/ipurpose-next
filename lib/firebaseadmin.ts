import admin from 'firebase-admin';

if (!admin.apps.length) {
  const raw = process.env.FIREBASE_ADMIN_CREDENTIALS || '';
  let cred;
  try {
    cred = JSON.parse(raw);
  } catch (e) {
    // If parsing fails, allow admin.initializeApp to throw a clearer error for environment troubleshooting.
    cred = undefined;
  }

  admin.initializeApp({
    credential: admin.credential.cert(cred as any),
  });
}

export const firebaseAdmin = admin;

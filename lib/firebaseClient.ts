import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Client-side Firebase initializer.
// Uses NEXT_PUBLIC_ env vars so values are available in the browser.
// Ensure these env vars are set in your environment / Vercel project settings.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Ensure a Firebase app is initialized exactly once on the client.
 * Safe to call multiple times; it will only initialize when no app exists.
 */
export function initFirebase() {
  // If no apps are initialized, initialize one.
  if (!getApps().length) {
    initializeApp(firebaseConfig);
    return;
  }

  // If apps exist, ensure the default app is retrievable (defensive).
  try {
    getApp();
  } catch (e) {
    // If for some reason default app isn't available, initialize again.
    initializeApp(firebaseConfig);
  }
}

/**
 * Convenience function: ensures init was called and returns the Auth instance.
 * Use this instead of importing getAuth() directly from 'firebase/auth'
 * in client components/pages to guarantee initialization.
 */
export function getFirebaseAuth() {
  initFirebase();
  return getAuth();
}

/**
 * Convenience function: ensures init was called and returns the Firestore instance.
 */
export function getFirebaseFirestore() {
  initFirebase();
  return getFirestore();
}

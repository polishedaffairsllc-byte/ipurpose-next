/**
 * AI Response Mode Persistence
 * Handles localStorage for immediate persistence + Firestore for user profile storage
 */

import { getFirebaseFirestore } from "@/lib/firebaseClient";
import { doc, updateDoc, getDoc } from "firebase/firestore";

export type ResponseMode = "balanced" | "reflect" | "build" | "expand";

const LOCAL_STORAGE_KEY = "iPurpose_aiResponseMode";
const DEFAULT_MODE: ResponseMode = "balanced";

/**
 * Get the current response mode from localStorage
 * Falls back to default if not set
 */
export function getLocalResponseMode(): ResponseMode {
  if (typeof window === "undefined") return DEFAULT_MODE;
  
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  return (stored as ResponseMode) || DEFAULT_MODE;
}

/**
 * Save response mode to localStorage (instant)
 */
export function setLocalResponseMode(mode: ResponseMode): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_KEY, mode);
}

/**
/**
 * Returns the saved mode or default if not found
 */
export async function getUserResponseMode(userId: string): Promise<ResponseMode> {
  try {
    const db = getFirebaseFirestore();
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const aiPreferences = userDoc.data().aiPreferences;
      if (aiPreferences?.responseMode) {
        return aiPreferences.responseMode as ResponseMode;
      }
    }
  } catch (error) {
    console.warn("Failed to fetch user AI preferences from Firestore:", error);
  }
  
  return DEFAULT_MODE;
}

/**
 * Save response mode to user's Firestore profile
 * Also updates localStorage for instant feedback
 */
export async function saveUserResponseMode(
  userId: string,
  mode: ResponseMode
): Promise<void> {
  // Update localStorage immediately
  setLocalResponseMode(mode);

  // Update Firestore asynchronously
  try {
    const db = getFirebaseFirestore();
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
      "aiPreferences.responseMode": mode,
      "aiPreferences.lastUpdated": new Date().toISOString(),
    });
  } catch (error) {
    console.warn("Failed to save AI response mode to Firestore:", error);
    // Still use localStorage as fallback, so UX doesn't break
  }
}

/**
 * Initialize response mode on app load
 * Strategy: check localStorage first (instant), then sync with Firestore
 */
export async function initializeResponseMode(userId: string | null): Promise<ResponseMode> {
  // Always get local version first (fast)
  const localMode = getLocalResponseMode();

  // If authenticated, sync with Firestore in background
  if (userId) {
    getUserResponseMode(userId)
      .then((firestoreMode) => {
        // If Firestore has a different mode, update localStorage
        if (firestoreMode !== localMode) {
          setLocalResponseMode(firestoreMode);
        }
      })
      .catch((error) => {
        console.warn("Failed to sync response mode from Firestore:", error);
        // Keep using localStorage
      });
  }

  return localMode;
}

import { cookies } from 'next/headers';
import { firebaseAdmin } from './firebaseAdmin';

export type EntitlementTier = 'FREE' | 'BASIC_PAID' | 'DEEPENING';

export interface EntitlementResult {
  uid: string | null;
  tier: EntitlementTier;
  isEntitled: boolean;
  error?: string;
}

/**
 * Check user's entitlement tier from session
 * @returns EntitlementResult with uid, tier, isEntitled flag
 */
export async function checkEntitlement(): Promise<EntitlementResult> {
  try {
    const cookieStore = await cookies();
    const devEntitlementCookie = cookieStore.get('DevEntitlement')?.value;
    let sessionCookie = cookieStore.get('FirebaseSession')?.value;
    let uid: string | null = null;

    // Dev fallback cookies/override so local testing and founder access doesn't break
    if (!sessionCookie && process.env.NODE_ENV !== 'production') {
      sessionCookie = cookieStore.get('FirebaseSessionDev')?.value;
    }

    // Dev override: explicit entitlement cookie for tests/local (non-production only)
    if (!sessionCookie && devEntitlementCookie && process.env.NODE_ENV !== 'production') {
      const devUid = process.env.DEV_FOUNDER_UID || 'dev-local-user';
      const forcedTier = devEntitlementCookie === 'founder'
        ? 'DEEPENING'
        : devEntitlementCookie === 'basic'
          ? 'BASIC_PAID'
          : 'FREE';
      const isEntitled = forcedTier !== 'FREE';
      return { uid: devUid, tier: forcedTier as EntitlementTier, isEntitled };
    }

    if (sessionCookie) {
      try {
        const decodedClaim = await firebaseAdmin.auth().verifySessionCookie(sessionCookie, true);
        uid = decodedClaim.uid;
      } catch (err) {
        uid = null;
      }
    }

    // Last-resort dev override: treat configured founder UID as logged in
    if (!uid && process.env.NODE_ENV !== 'production') {
      uid = process.env.DEV_FOUNDER_UID || 'dev-local-user';
    }

    if (!uid) {
      return { uid: null, tier: 'FREE', isEntitled: false };
    }

    const db = firebaseAdmin.firestore();
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return { uid, tier: 'FREE', isEntitled: false, error: 'User document not found' };
    }

    const userData = userDoc.data();
    
    // Check if user is a founder - founders have all access
    const isFounder = userData?.isFounder === true || userData?.role === "founder" || userData?.entitlementTier === "founder";
    
    // Determine tier from user data
    let tier: EntitlementTier = 'FREE';
    const membershipTier = (userData?.membership?.tier as EntitlementTier | undefined) ?? undefined;
    const entitlementTier = (userData?.entitlementTier as EntitlementTier | undefined) ?? undefined;
    const legacyTier = (userData?.tier as EntitlementTier | undefined) ?? undefined;

    // Founder override if uid matches configured founder
    const devFounderUid = process.env.DEV_FOUNDER_UID || 'dev-local-user';
    const isDevFounder = uid === devFounderUid;

    if (isFounder || isDevFounder) {
      tier = 'DEEPENING'; // Founders get highest tier
    } else if (entitlementTier) {
      tier = entitlementTier;
    } else if (membershipTier) {
      tier = membershipTier;
    } else if (legacyTier) {
      tier = legacyTier;
    }

    const entitlementActive = userData?.entitlement?.status === 'active';
    const membershipActive = userData?.membership?.status === 'active';

    // User is entitled if they have a paid tier with active status, membership active, or are a founder
    const isEntitled = isFounder || ((tier !== 'FREE') && (entitlementActive || membershipActive));

    return { uid, tier, isEntitled };
  } catch (error) {
    return { uid: null, tier: 'FREE', isEntitled: false, error: String(error) };
  }
}

/**
 * Check if user can access a specific tier
 * @param userTier User's current tier
 * @param requiredTier Required tier for access
 * @returns true if user can access
 */
export function canAccessTier(userTier: EntitlementTier, requiredTier: EntitlementTier): boolean {
  const tierRank = { FREE: 0, BASIC_PAID: 1, DEEPENING: 2 };
  return tierRank[userTier] >= tierRank[requiredTier];
}

/**
 * Get redirect URL if user is not entitled
 * @param uid User ID
 * @param tier User's tier
 * @param requiredTier Required tier for route
 * @returns Redirect URL or null if allowed
 */
export function checkAccessAndGetRedirect(
  uid: string | null,
  tier: EntitlementTier,
  requiredTier: EntitlementTier
): string | null {
  if (!uid) {
    return '/login';
  }
  
  if (!canAccessTier(tier, requiredTier)) {
    return '/enrollment-required';
  }
  
  return null;
}

/**
 * Legacy function for backwards compatibility
 */
export function redirectIfNotEntitled(uid: string | null, isEntitled: boolean) {
  if (!uid || !isEntitled) {
    return '/enrollment-required';
  }
  return null;
}

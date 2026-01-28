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
    const sessionCookie = cookieStore.get('FirebaseSession')?.value;

    if (!sessionCookie) {
      return { uid: null, tier: 'FREE', isEntitled: false };
    }

    const decodedClaim = await firebaseAdmin
      .auth()
      .verifySessionCookie(sessionCookie, true);
    const uid = decodedClaim.uid;

    const db = firebaseAdmin.firestore();
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return { uid, tier: 'FREE', isEntitled: false, error: 'User document not found' };
    }

    const userData = userDoc.data();
    
    // Determine tier from user data
    let tier: EntitlementTier = 'FREE';
    if (userData?.entitlementTier) {
      tier = userData.entitlementTier as EntitlementTier;
    } else if (userData?.tier) {
      tier = userData.tier as EntitlementTier;
    }

    // User is entitled if they have a paid tier
    const isEntitled = tier !== 'FREE' && userData?.entitlement?.status === 'active';

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

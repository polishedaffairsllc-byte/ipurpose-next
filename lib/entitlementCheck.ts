import { cookies } from 'next/headers';
import { firebaseAdmin } from './firebaseAdmin';
import { getRequestBearerAuth } from './firebase/requestAuth';

export type EntitlementTier = 'FREE' | 'BASIC_PAID' | 'DEEPENING';

export interface EntitlementResult {
  uid: string | null;
  tier: EntitlementTier;
  isEntitled: boolean;
  error?: string;
}

/**
 * Check user's entitlement tier from a verified native bearer token or the
 * existing website Firebase session cookie.
 */
export async function checkEntitlement(): Promise<EntitlementResult> {
  try {
    const bearerAuth = await getRequestBearerAuth();
    if (bearerAuth.attempted && !bearerAuth.uid) {
      return {
        uid: null,
        tier: 'FREE',
        isEntitled: false,
        error: bearerAuth.error || 'Invalid bearer token',
      };
    }

    const cookieStore = await cookies();
    const devEntitlementCookie = cookieStore.get('DevEntitlement')?.value;
    let sessionCookie = cookieStore.get('FirebaseSession')?.value;
    let uid: string | null = bearerAuth.uid;

    if (!uid && !sessionCookie && process.env.NODE_ENV !== 'production') {
      sessionCookie = cookieStore.get('FirebaseSessionDev')?.value;
    }

    if (!uid && !sessionCookie && devEntitlementCookie && process.env.NODE_ENV !== 'production') {
      const devUid = process.env.DEV_FOUNDER_UID || 'dev-local-user';
      const forcedTier = devEntitlementCookie === 'founder'
        ? 'DEEPENING'
        : devEntitlementCookie === 'basic'
          ? 'BASIC_PAID'
          : 'FREE';
      const isEntitled = forcedTier !== 'FREE';
      return { uid: devUid, tier: forcedTier as EntitlementTier, isEntitled };
    }

    if (!uid && sessionCookie) {
      try {
        const decodedClaim = await firebaseAdmin.auth().verifySessionCookie(sessionCookie, true);
        uid = decodedClaim.uid;
      } catch (_err) {
        uid = null;
      }
    }

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
    const isFounder = userData?.isFounder === true || userData?.role === "founder" || userData?.entitlementTier === "founder";

    let tier: EntitlementTier = 'FREE';
    const membershipTier = (userData?.membership?.tier as EntitlementTier | undefined) ?? undefined;
    const entitlementTier = (userData?.entitlementTier as EntitlementTier | undefined) ?? undefined;
    const legacyTier = (userData?.tier as EntitlementTier | undefined) ?? undefined;

    const devFounderUid = process.env.DEV_FOUNDER_UID || 'dev-local-user';
    const isDevFounder = uid === devFounderUid;

    if (isFounder || isDevFounder) {
      tier = 'DEEPENING';
    } else if (entitlementTier) {
      tier = entitlementTier;
    } else if (membershipTier) {
      tier = membershipTier;
    } else if (legacyTier) {
      tier = legacyTier;
    }

    const entitlementActive = userData?.entitlement?.status === 'active';
    const membershipActive = userData?.membership?.status === 'active';
    const isEntitled = isFounder || ((tier !== 'FREE') && (entitlementActive || membershipActive));

    return { uid, tier, isEntitled };
  } catch (error) {
    return { uid: null, tier: 'FREE', isEntitled: false, error: String(error) };
  }
}

export function canAccessTier(userTier: EntitlementTier, requiredTier: EntitlementTier): boolean {
  const tierRank = { FREE: 0, BASIC_PAID: 1, DEEPENING: 2 };
  return tierRank[userTier] >= tierRank[requiredTier];
}

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

export function redirectIfNotEntitled(uid: string | null, isEntitled: boolean) {
  if (!uid || !isEntitled) {
    return '/enrollment-required';
  }
  return null;
}

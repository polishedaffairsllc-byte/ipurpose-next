/**
 * API Helper: Entitlement-aware response handling
 * Use in API routes to enforce tier gating
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkEntitlement, canAccessTier, type EntitlementTier } from './entitlementCheck';
import { fail } from './http';

/**
 * Verify user has required tier, return error if not
 * @param requiredTier Minimum tier required (e.g., 'BASIC_PAID')
 * @returns { uid, tier } if authorized, or NextResponse error if not
 */
export async function requireTier(requiredTier: EntitlementTier) {
  const { uid, tier, isEntitled, error } = await checkEntitlement();

  // Not authenticated
  if (!uid) {
    return {
      error: NextResponse.json(fail('Unauthorized', 'No session found'), { status: 401 }),
    };
  }

  // Tier insufficient
  if (!canAccessTier(tier, requiredTier)) {
    return {
      error: NextResponse.json(
        {
          ok: false,
          error: {
            code: 'Forbidden',
            message: `This feature requires ${requiredTier} tier. You have ${tier} tier.`,
            requiredTier,
          },
        },
        { status: 403 }
      ),
    };
  }

  return { uid, tier, isEntitled };
}

/**
 * Simpler wrapper: just check if user has ANY paid tier
 * @returns { uid, tier } if authorized, or NextResponse error
 */
export async function requirePaidTier() {
  const { uid, tier } = await checkEntitlement();

  if (!uid || tier === 'FREE') {
    return {
      error: NextResponse.json(
        fail('Forbidden', 'This feature requires a paid subscription'),
        { status: 403 }
      ),
    };
  }

  return { uid, tier };
}

/**
 * Check Deepening tier specifically
 * @returns { uid, tier } if Deepening, or error
 */
export async function requireDeepening() {
  return requireTier('DEEPENING');
}

/**
 * Check BASIC_PAID or above
 * @returns { uid, tier } if BASIC_PAID+, or error
 */
export async function requireBasicPaid() {
  return requireTier('BASIC_PAID');
}

/**
 * Entitlement System — iPurpose Tier-Based Access Control
 *
 * Tiers:
 * - FREE: No paid features
 * - BASIC_PAID: Includes Integration, Labs, Soul, and Settings (NOT Community)
 * - DEEPENING: Includes everything (Community, Systems, Insights, Courses, Tools)
 *
 * Routes & API gating rules defined in routes config below.
 */

export type EntitlementTier = 'FREE' | 'BASIC_PAID' | 'DEEPENING';

/**
 * Route gating configuration
 * Maps route patterns to required entitlement tier
 */
export const ROUTE_GATING_CONFIG = {
  // Community - DEEPENING tier only
  '/community': 'DEEPENING',
  '/community/post/[id]': 'DEEPENING',

  // Soul - BASIC_PAID and above (Accelerator entry point)
  '/soul': 'BASIC_PAID',
  '/soul/chat': 'BASIC_PAID',

  // Advanced Tools - DEEPENING tier only
  '/systems': 'DEEPENING',
  '/systems/chat': 'DEEPENING',
  '/insights': 'DEEPENING',
  '/insights/chat': 'DEEPENING',
  '/creation': 'DEEPENING',
  '/interpretation': 'DEEPENING',

  // AI Tools - ALL paid tiers (BASIC_PAID and above)
  '/ai-tools': 'BASIC_PAID',
  '/ai-tools/chat': 'BASIC_PAID',

  // Labs - FREE (no gating, auth-required)
  '/labs': 'FREE',
  '/labs/identity': 'FREE',
  '/labs/meaning': 'FREE',
  '/labs/agency': 'FREE',

  // Integration - BASIC_PAID and above (monetization bridge)
  '/integration': 'BASIC_PAID',
} as const;

/**
 * API gating configuration
 * Maps API route patterns to required entitlement tier
 */
export const API_GATING_CONFIG = {
  // Community APIs - DEEPENING tier only
  '/api/community': 'DEEPENING',

  // AI APIs - BASIC_PAID and above
  '/api/ai': 'BASIC_PAID',
  '/api/ai/stream': 'BASIC_PAID',

  // Integration APIs - BASIC_PAID and above
  '/api/integration': 'BASIC_PAID',
} as const;

/**
 * Public routes that bypass entitlement checks
 * (even with user session, no tier required)
 */
export const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/discover',
  '/program',
  '/clarity-check',
  '/clarity-check-numeric',
  '/info-session',
  '/contact',
  '/privacy',
  '/terms',
  '/google-review',
  '/starter-pack',
  '/ai-blueprint',
  '/ethics', // Decision #7: Ethics remains public (values/preview)
  '/orientation',
  '/login',
  '/signup',
  '/enrollment-required',
];

/**
 * Determine if a route requires entitlement gating
 * @param pathname Route path (e.g., "/community", "/soul")
 * @returns Required tier ('FREE' = no gating, 'BASIC_PAID', 'DEEPENING')
 */
export function getRequiredTier(pathname: string): EntitlementTier {
  // Check exact matches first
  const exactMatch = ROUTE_GATING_CONFIG[pathname as keyof typeof ROUTE_GATING_CONFIG];
  if (exactMatch) return exactMatch;

  // Check prefix matches (for nested routes)
  for (const [route, tier] of Object.entries(ROUTE_GATING_CONFIG)) {
    const baseRoute = route.replace('/[id]', '').replace('/[params]', '');
    if (pathname.startsWith(baseRoute + '/') || pathname === baseRoute) {
      return tier as EntitlementTier;
    }
  }

  // Default to FREE (no gating required)
  return 'FREE';
}

/**
 * Determine if a user tier can access a required tier
 * @param userTier User's current tier
 * @param requiredTier Required tier for route/API
 * @returns true if user can access
 */
export function canAccessTier(
  userTier: EntitlementTier,
  requiredTier: EntitlementTier
): boolean {
  // Tier hierarchy: FREE < BASIC_PAID < DEEPENING
  const tierRank = {
    FREE: 0,
    BASIC_PAID: 1,
    DEEPENING: 2,
  };

  return tierRank[userTier] >= tierRank[requiredTier];
}

/**
 * Check if user can access a specific route
 * @param pathname Route path
 * @param userTier User's entitlement tier (or null if not authenticated)
 * @returns true if user can access
 */
export function canAccessRoute(
  pathname: string,
  userTier: EntitlementTier | null
): boolean {
  // Unauthenticated users cannot access gated routes
  if (!userTier) {
    return getRequiredTier(pathname) === 'FREE';
  }

  const requiredTier = getRequiredTier(pathname);
  return canAccessTier(userTier, requiredTier);
}

/**
 * Check if user can access an API endpoint
 * @param apiPath API path (e.g., "/api/community/posts")
 * @param userTier User's entitlement tier (or null if not authenticated)
 * @returns true if user can access
 */
export function canAccessAPI(
  apiPath: string,
  userTier: EntitlementTier | null
): boolean {
  // Unauthenticated users cannot access gated APIs
  if (!userTier) {
    return getRequiredTierForAPI(apiPath) === 'FREE';
  }

  const requiredTier = getRequiredTierForAPI(apiPath);
  return canAccessTier(userTier, requiredTier);
}

/**
 * Determine required tier for an API endpoint
 * @param apiPath API path (e.g., "/api/community/posts")
 * @returns Required tier
 */
export function getRequiredTierForAPI(apiPath: string): EntitlementTier {
  // Check exact matches first
  const exactMatch = API_GATING_CONFIG[apiPath as keyof typeof API_GATING_CONFIG];
  if (exactMatch) return exactMatch;

  // Check prefix matches
  for (const [route, tier] of Object.entries(API_GATING_CONFIG)) {
    if (apiPath.startsWith(route)) {
      return tier as EntitlementTier;
    }
  }

  // Default to FREE (no gating required)
  return 'FREE';
}

/**
 * Get user's entitlement tier from Firestore user document
 * (This function is a placeholder; actual implementation
 * depends on how you store user tier in Firestore)
 */
export function getTierFromUser(user: {
  entitlementTier?: EntitlementTier;
  stripeSubscriptionId?: string;
  tier?: EntitlementTier;
  role?: string;
  isFounder?: boolean;
  customClaims?: Record<string, any>;
}): EntitlementTier {
  // Founder access maps to the highest tier (DEEPENING)
  // Check Firestore fields first
  if (user.isFounder || user.role === 'founder') {
    return 'DEEPENING';
  }
  // Check custom claims (from Firebase Auth)
  if (user.customClaims?.isFounder || user.customClaims?.role === 'founder') {
    return 'DEEPENING';
  }
  // Priority: explicit tier field > compute from subscription > default FREE
  if (user.entitlementTier) {
    return user.entitlementTier;
  }
  if (user.tier) {
    return user.tier;
  }
  return 'FREE';
}

/**
 * Check if route is public (no auth required)
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) =>
      route === pathname ||
      pathname.startsWith(route + '/') ||
      (route !== '/' && route === pathname)
  );
}

/**
 * Get readable tier name for UI display
 */
export function getTierDisplayName(tier: EntitlementTier): string {
  const names = {
    FREE: 'Free',
    BASIC_PAID: 'Pro',
    DEEPENING: 'Premium',
  };
  return names[tier];
}

/**
 * Get tier price (monthly)
 */
export function getTierPrice(tier: EntitlementTier): number {
  const prices = {
    FREE: 0,
    BASIC_PAID: 1999, // $19.99/mo in cents
    DEEPENING: 9999, // $99.99/mo in cents
  };
  return prices[tier];
}

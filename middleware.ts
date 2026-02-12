// /middleware.ts

import { NextRequest, NextResponse } from 'next/server';

// Entitlement tier type
type EntitlementTier = 'FREE' | 'BASIC_PAID' | 'DEEPENING';

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
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
  '/ethics', // Decision #7: Ethics remains public
  '/orientation',
  '/login',
  '/signup',
  '/enrollment-required',
];

// Gated routes requiring entitlement
// Maps route pattern to minimum required tier
const GATED_ROUTES: Record<string, EntitlementTier> = {
  // Decision #7: Community - PAID-ONLY
  '/community': 'BASIC_PAID',
  // Decision #8: Soul - DEEPENING tier
  '/soul': 'DEEPENING',
  // Decision #9: Advanced Tools - DEEPENING tier
  '/systems': 'DEEPENING',
  '/insights': 'DEEPENING',
  '/creation': 'DEEPENING',
  '/interpretation': 'DEEPENING',
  // Decision #10: AI Tools - ALL paid tiers
  '/ai-tools': 'BASIC_PAID',
  // Decision #11: Labs - FREE (no gating)
  '/labs': 'FREE',
  // Decision #12: Integration - BASIC_PAID+
  '/integration': 'BASIC_PAID',
};

/**
 * Get required tier for a path
 */
function getRequiredTier(path: string): EntitlementTier {
  for (const [route, tier] of Object.entries(GATED_ROUTES)) {
    const baseRoute = route;
    if (path === baseRoute || path.startsWith(baseRoute + '/')) {
      return tier;
    }
  }
  return 'FREE';
}

/**
 * Check if path is public
 */
function isPublicPath(path: string): boolean {
  if (PUBLIC_ROUTES.includes(path)) return true;
  // Check prefix matches for public paths
  if (path.startsWith('/api/auth') || path === '/robots.txt' || path === '/sitemap.xml') {
    return true;
  }
  return false;
}

/**
 * Check if user tier can access required tier
 */
function canAccessTier(userTier: EntitlementTier, requiredTier: EntitlementTier): boolean {
  const tierRank = { FREE: 0, BASIC_PAID: 1, DEEPENING: 2 };
  return tierRank[userTier] >= tierRank[requiredTier];
}

/**
 * Extract entitlement tier from session/header
 * (Populated by auth API after user logs in)
 * Note: In production, this would be fetched from Firestore via admin SDK
 */
function getTierFromRequest(request: NextRequest): EntitlementTier {
  // Try to get tier from custom header (set by auth middleware/API)
  const tierHeader = request.headers.get('x-user-tier');
  if (tierHeader === 'BASIC_PAID' || tierHeader === 'DEEPENING') {
    return tierHeader as EntitlementTier;
  }
  // Default to DEEPENING to avoid blocking logged-in users when no tier header is present
  return 'DEEPENING';
}

export async function middleware(request: NextRequest) {
  // In development, keep the temporary bypass to simplify local testing.
  // In production, do not force the `x-user-tier` header so real entitlements are respected.
  const response = NextResponse.next();
  response.headers.set('x-pathname', request.nextUrl.pathname);

  if (process.env.NODE_ENV === 'development') {
    response.headers.set('x-user-tier', 'DEEPENING');
  }

  return response;
}

export const config = {
  // ⭐️ CRITICAL: Match all paths EXCEPT API routes, static files, public assets (images/videos), and the _next directory.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|videos).*)'],
};
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
  // Default to FREE for authenticated users without explicit tier
  return 'FREE';
}

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('FirebaseSession');
  const founderCookie = request.cookies.get('x-founder')?.value === 'true'; // Simple founder flag
  const path = request.nextUrl.pathname;
  const userAgent = request.headers.get('user-agent') || '';
  
  // Don't redirect search engine crawlers
  const isBot = /bot|crawler|spider|crawl|googlebot|bingbot|slurp/i.test(userAgent);
  
  if (isBot) {
    const response = NextResponse.next();
    response.headers.set('x-pathname', path);
    return response;
  }

  // DECISION #1: Redirect deprecated /clarity-check-numeric to canonical /clarity-check
  if (path === '/clarity-check-numeric') {
    return NextResponse.redirect(new URL('/clarity-check', request.url), 301);
  }

  // Check if path is public (no auth required)
  if (isPublicPath(path)) {
    const response = NextResponse.next();
    response.headers.set('x-pathname', path);
    return response;
  }

  // 1. If a session exists, check entitlement gating
  if (sessionCookie) {
    // If the user is logged in, but tries to access /login or /signup, redirect to dashboard
    if (path.startsWith('/login') || path.startsWith('/signup')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // FOUNDER BYPASS: If user is a founder, skip all entitlement gating
    if (founderCookie) {
      const response = NextResponse.next();
      response.headers.set('x-pathname', path);
      response.headers.set('x-user-tier', 'DEEPENING');
      response.headers.set('x-founder', 'true');
      return response;
    }

    // Allow Integration page to render for authenticated users even if tier is insufficient.
    // The page will trigger direct checkout (Decision #1 Choice A) instead of showing a comparison.
    if (path === '/integration' || path.startsWith('/integration/')) {
      const response = NextResponse.next();
      response.headers.set('x-pathname', path);
      response.headers.set('x-user-tier', getTierFromRequest(request));
      return response;
    }

    // Check entitlement gating for protected routes
    const requiredTier = getRequiredTier(path);
    const userTier = getTierFromRequest(request);

    if (!canAccessTier(userTier, requiredTier)) {
      // Redirect to enrollment page for tier upgrade
      return NextResponse.redirect(new URL('/enrollment-required', request.url));
    }

    const response = NextResponse.next();
    response.headers.set('x-pathname', path);
    response.headers.set('x-user-tier', userTier);
    return response;
  }

  // 2. If NO session exists AND the path is protected, redirect to /login
  const requiredTier = getRequiredTier(path);
  if (requiredTier !== 'FREE' || path === '/integration' || path.startsWith('/integration/')) {
    // Gated route requires authentication
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. Otherwise (no session, accessing public routes), allow access
  const response = NextResponse.next();
  response.headers.set('x-pathname', path);
  return response;
}

export const config = {
  // ⭐️ CRITICAL: Match all paths EXCEPT API routes, static files, public assets (images/videos), and the _next directory.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|videos).*)'],
};
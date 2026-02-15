// Conservative proxy translation of `middleware.ts`.
//
// NOTE: This file is a starting point for migrating the deprecated
// Conservative proxy translation of `middleware.ts`.
//
// NOTE: This file is a starting point for migrating the deprecated
// `middleware` convention to Next's `proxy` capability. Keep `middleware.ts`
// until you've validated the proxy behavior in your environment.

import { NextRequest, NextResponse } from 'next/server';

type EntitlementTier = 'FREE' | 'BASIC_PAID' | 'DEEPENING';

const PUBLIC_ROUTES: string[] = [
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
  '/ethics',
  '/orientation',
  '/login',
  '/signup',
  '/enrollment-required',
];

const GATED_ROUTES: Record<string, EntitlementTier> = { 
  '/community': 'BASIC_PAID',
  '/soul': 'DEEPENING',
  '/systems': 'DEEPENING',
  '/insights': 'DEEPENING',
  '/creation': 'DEEPENING',
  '/ai-tools': 'BASIC_PAID',
  '/labs': 'FREE',
  '/integration': 'BASIC_PAID',
};

function getRequiredTier(path: string): EntitlementTier {
  for (const [route, tier] of Object.entries(GATED_ROUTES)) {
    if (path === route || path.startsWith(route + '/')) return tier;
  }
  return 'FREE';
}
function canAccessTier(userTier: EntitlementTier, requiredTier: EntitlementTier) {
  const rank = { FREE: 0, BASIC_PAID: 1, DEEPENING: 2 };
  return rank[userTier] >= rank[requiredTier];
}

function getTierFromRequest(request: NextRequest): EntitlementTier | null {
  const header = request.headers.get('x-user-tier');
  if (header === 'BASIC_PAID' || header === 'DEEPENING' || header === 'FREE') return header as EntitlementTier;
  // Fallback: check for a logged-in cookie (client sets `ipurpose_logged_in`)
  const cookie = request.cookies.get('ipurpose_logged_in')?.value;
  if (cookie) return 'FREE'; // treat logged-in without tier header as FREE (app will resolve entitlements later)
  return null; // unknown / not-logged-in
}
export async function onProxy(request: NextRequest) {
  // Minimal header manipulation to match existing middleware behavior.
  const response = NextResponse.next();
  response.headers.set('x-pathname', request.nextUrl.pathname);

  if (process.env.NODE_ENV === 'development') {
    response.headers.set('x-user-tier', 'DEEPENING');
  }

  // Note: Access control decisions (redirects, gating) are intentionally
  // left to application logic rather than aggressively redirecting here.
  // This mirrors the middleware which primarily set headers in development.

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|videos).*)'],
};


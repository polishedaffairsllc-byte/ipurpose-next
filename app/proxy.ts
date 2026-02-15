// Conservative proxy translation of `middleware.ts`.
//
// NOTE: This file is a starting point for migrating the deprecated
// `middleware` convention to Next's `proxy` capability. Keep `middleware.ts`
// until you've validated the proxy behavior in your environment.

import { NextRequest, NextResponse } from 'next/server';

type EntitlementTier = 'FREE' | 'BASIC_PAID' | 'DEEPENING';

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

import { NextRequest, NextResponse } from 'next/server';

/**
 * Domain Consolidation Middleware
 * 
 * Implements permanent 301 redirects to canonical domain: https://ipurposesoul.com
 * 
 * Redirects:
 * - mshmltn.com → ipurposesoul.com
 * - www.mshmltn.com → ipurposesoul.com
 * - ipurposesoul.online → ipurposesoul.com
 * - www.ipurposesoul.online → ipurposesoul.com
 * - ipurpose.com → ipurposesoul.com
 * - www.ipurpose.com → ipurposesoul.com
 * - www.ipurposesoul.com → ipurposesoul.com (non-www canonical)
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  const search = request.nextUrl.search;
  
  // Canonical domain (lowercase for consistency)
  const CANONICAL_DOMAIN = 'ipurposesoul.com';
  
  // List of domains that should redirect to canonical (DO NOT include canonical domain itself)
  const REDIRECT_DOMAINS = [
    'mshmltn.com',
    'www.mshmltn.com',
    'ipurposesoul.online',
    'www.ipurposesoul.online',
    'ipurpose.com',
    'www.ipurpose.com',
    // NOTE: www.ipurposesoul.com is NOT listed here because Vercel handles www → non-www
    // at the DNS/infrastructure level. Adding it here creates an infinite loop.
  ];
  
  // Normalize host (remove port if present, lowercase)
  const normalizedHost = host.split(':')[0].toLowerCase();
  
  // Check if current host needs redirect
  // IMPORTANT: Only redirect if it's in the redirect list AND not already on canonical domain
  if (REDIRECT_DOMAINS.includes(normalizedHost) && normalizedHost !== CANONICAL_DOMAIN) {
    // Construct canonical URL
    const canonicalUrl = `https://${CANONICAL_DOMAIN}${pathname}${search}`;
    
    // Return 301 permanent redirect
    return NextResponse.redirect(canonicalUrl, {
      status: 301,
    });
  }
  
  // Allow request to continue if on canonical domain or unrecognized host
  return NextResponse.next();
}

/**
 * Configure which routes this middleware should run on
 * Run on all routes to ensure proper domain handling
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

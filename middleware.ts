// /middleware.ts

import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('FirebaseSession');
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

  // 1. If a session exists, allow access to all routes (including dashboard)
  if (sessionCookie) {
    // If the user is logged in, but tries to access /login or /signup, redirect to dashboard
    if (path.startsWith('/login') || path.startsWith('/signup')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    const response = NextResponse.next();
    response.headers.set('x-pathname', path);
    return response;
  }

  // 2. If NO session exists AND the path is protected, redirect to /login
  const publicPaths = ['/', '/about', '/discover', '/program', '/clarity-check', '/clarity-check-numeric', '/info-session', '/contact', '/privacy', '/terms', '/google-review', '/starter-pack', '/ai-blueprint'];
  const isPublicPath =
    publicPaths.includes(path) ||
    path.startsWith('/api/auth') ||
    path === '/robots.txt' ||
    path === '/sitemap.xml' ||
    path.startsWith('/orientation') ||
    path.startsWith('/ethics');
  const isProtectedPath = !isPublicPath && !path.startsWith('/login') && !path.startsWith('/signup');
  
  if (isProtectedPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. Otherwise (no session, accessing /login, /signup, or homepage), allow access
  const response = NextResponse.next();
  response.headers.set('x-pathname', path);
  return response;
}

export const config = {
  // ⭐️ CRITICAL: Match all paths EXCEPT API routes, static files, public assets (images/videos), and the _next directory.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|videos).*)'],
};
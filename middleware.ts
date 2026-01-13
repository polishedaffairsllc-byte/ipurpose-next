// /middleware.ts

import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('FirebaseSession');
  const path = request.nextUrl.pathname;

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
  const publicPaths = ['/', '/about', '/discover', '/program', '/clarity-check', '/info-session'];
  const isPublicPath = publicPaths.includes(path) || path.startsWith('/api/auth');
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
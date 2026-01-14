"use server";
import Link from "next/link";
import { cookies, headers } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import React from "react";

export default async function NavBar() {
  const cookieStore = await cookies();
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  
  // Hide navbar on login, signup, home, clarity-check, and dashboard pages
  const hiddenRoutes = ["/login", "/signup", "/", "", "/clarity-check"];
  const isHidden = hiddenRoutes.includes(pathname) || 
                   pathname.startsWith("/dashboard") || 
                   pathname.startsWith("/soul") || 
                   pathname.startsWith("/systems") || 
                   pathname.startsWith("/ai") || 
                   pathname.startsWith("/insights") || 
                   pathname.startsWith("/settings");
  
  if (isHidden) {
    return null;
  }

  const session = cookieStore.get("FirebaseSession")?.value ?? null;
  let displayName = "Guest";
  let isLoggedIn = false;

  if (session) {
    try {
      const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
      const user = await firebaseAdmin.auth().getUser(decoded.uid);
      displayName = user.displayName || (user.email ? user.email.split("@")[0] : "Friend");
      isLoggedIn = true;
    } catch (e) {
      // If verification fails, fall back to Guest
    }
  }

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-lavenderViolet/10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-8">
          {/* Left Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link 
              href="/" 
              className="px-4 py-2 rounded-lg text-sm font-medium text-warmCharcoal hover:bg-lavenderViolet/10 transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/discover" 
              className="px-4 py-2 rounded-lg text-sm font-medium text-warmCharcoal hover:bg-lavenderViolet/10 transition-colors"
            >
              Discover
            </Link>
            <Link 
              href="/about" 
              className="px-4 py-2 rounded-lg text-sm font-medium text-warmCharcoal hover:bg-lavenderViolet/10 transition-colors"
            >
              About
            </Link>
            <Link 
              href="/program" 
              className="px-4 py-2 rounded-lg text-sm font-medium text-warmCharcoal hover:bg-lavenderViolet/10 transition-colors"
            >
              6-Week Program
            </Link>
            {isLoggedIn && (
              <>
                <Link 
                  href="/dashboard" 
                  className="px-4 py-2 rounded-lg text-sm font-medium text-warmCharcoal hover:bg-lavenderViolet/10 transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/soul" 
                  className="px-4 py-2 rounded-lg text-sm font-medium text-warmCharcoal hover:bg-lavenderViolet/10 transition-colors"
                >
                  Soul
                </Link>
                <Link 
                  href="/systems" 
                  className="px-4 py-2 rounded-lg text-sm font-medium text-warmCharcoal hover:bg-lavenderViolet/10 transition-colors"
                >
                  Systems
                </Link>
                <Link 
                  href="/ai" 
                  className="px-4 py-2 rounded-lg text-sm font-medium text-warmCharcoal hover:bg-lavenderViolet/10 transition-colors"
                >
                  AI
                </Link>
              </>
            )}
          </nav>

          {/* Right Side - CTAs and Auth */}
          <div className="flex items-center gap-3 ml-auto">
            <Link
              href="/clarity-check"
              className="hidden sm:inline-block px-6 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-lavenderViolet to-indigoDeep hover:shadow-lg transition-all"
            >
              Clarity Check
            </Link>
            {isLoggedIn ? (
              <>
                <span className="hidden lg:block text-sm text-warmCharcoal/70">
                  {displayName}
                </span>
                <Link
                  href="/settings"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-warmCharcoal hover:bg-lavenderViolet/10 transition-colors"
                >
                  Settings
                </Link>
                <form action="/api/auth/logout" method="post">
                  <button 
                    type="submit" 
                    className="px-4 py-2 rounded-lg text-sm font-medium text-warmCharcoal hover:bg-salmonPeach/10 transition-colors"
                  >
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-warmCharcoal hover:bg-lavenderViolet/10 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-lavenderViolet to-salmonPeach hover:shadow-lg transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

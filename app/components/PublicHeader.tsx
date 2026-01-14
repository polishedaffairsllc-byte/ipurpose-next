"use server";
import Link from "next/link";
import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import React from "react";

export default async function PublicHeader() {
  const cookieStore = await cookies();
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
    <header className="relative z-20 w-full flex items-center justify-around p-6 lg:p-12 border-b border-white/10" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
      {/* Left Navigation Links */}
      <nav className="hidden md:flex items-center gap-1 mr-auto">
        <Link 
          href="/discover" 
          className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors"
        >
          Discover
        </Link>
        <Link 
          href="/about" 
          className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors"
        >
          About
        </Link>
        <Link 
          href="/program" 
          className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors"
        >
          6-Week Program
        </Link>
      </nav>

      {/* Right Side - CTAs and Auth */}
      <div className="flex items-center gap-3 ml-auto">
        <Link
          href="/clarity-check"
          className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-lavenderViolet to-indigoDeep hover:shadow-lg transition-all"
        >
          Clarity Check
        </Link>
        {isLoggedIn ? (
          <>
            <span className="hidden lg:block text-sm text-white/70">
              {displayName}
            </span>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors"
            >
              Dashboard
            </Link>
            <form action="/api/auth/logout" method="post">
              <button 
                type="submit" 
                className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors"
              >
                Logout
              </button>
            </form>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors"
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
    </header>
  );
}

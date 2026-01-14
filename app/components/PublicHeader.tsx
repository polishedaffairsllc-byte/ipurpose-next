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
    <header className="relative z-20 w-full flex flex-col md:flex-row items-center justify-between p-4 md:p-6 lg:p-12 border-b border-white/20 bg-gradient-to-r from-black/40 to-black/30 backdrop-blur-md gap-4 md:gap-0">
      {/* Left Navigation Links */}
      <nav className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3 w-full md:w-auto md:mr-auto">
        <Link 
          href="/discover" 
          className="px-4 md:px-5 py-2 rounded-lg text-xs md:text-sm font-semibold text-white bg-white/20 hover:bg-white/30 transition-colors whitespace-nowrap border border-white/30"
        >
          Discover
        </Link>
        <Link 
          href="/about" 
          className="px-4 md:px-5 py-2 rounded-lg text-xs md:text-sm font-semibold text-white bg-white/20 hover:bg-white/30 transition-colors whitespace-nowrap border border-white/30"
        >
          About
        </Link>
        <Link 
          href="/program" 
          className="px-4 md:px-5 py-2 rounded-lg text-xs md:text-sm font-semibold text-white bg-white/20 hover:bg-white/30 transition-colors whitespace-nowrap border border-white/30"
        >
          6-Week Program
        </Link>
      </nav>

      {/* Right Side - CTAs and Auth */}
      <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 md:gap-3 w-full md:w-auto md:ml-auto">
        <Link
          href="/clarity-check"
          className="px-5 md:px-6 py-2 rounded-lg text-xs md:text-sm font-semibold text-white bg-gradient-to-r from-lavenderViolet to-indigoDeep hover:shadow-lg hover:from-lavenderViolet/80 hover:to-indigoDeep/80 transition-all whitespace-nowrap"
        >
          Clarity Check
        </Link>
        {isLoggedIn ? (
          <>
            <span className="hidden lg:block text-xs md:text-sm font-medium text-white/90">
              {displayName}
            </span>
            <Link
              href="/dashboard"
              className="px-4 md:px-5 py-2 rounded-lg text-xs md:text-sm font-semibold text-white bg-white/20 hover:bg-white/30 transition-colors whitespace-nowrap border border-white/30"
            >
              Dashboard
            </Link>
            <form action="/api/auth/logout" method="post">
              <button 
                type="submit" 
                className="px-4 md:px-5 py-2 rounded-lg text-xs md:text-sm font-semibold text-white bg-white/20 hover:bg-white/30 transition-colors whitespace-nowrap border border-white/30"
              >
                Logout
              </button>
            </form>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="px-4 md:px-5 py-2 rounded-lg text-xs md:text-sm font-semibold text-white bg-white/20 hover:bg-white/30 transition-colors whitespace-nowrap border border-white/30"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-5 md:px-6 py-2 rounded-lg text-xs md:text-sm font-semibold text-white bg-gradient-to-r from-lavenderViolet to-salmonPeach hover:shadow-lg hover:from-lavenderViolet/80 hover:to-salmonPeach/80 transition-all whitespace-nowrap"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

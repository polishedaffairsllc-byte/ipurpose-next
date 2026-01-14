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
    <header className="relative z-20 w-full flex items-center justify-center gap-4 p-4 md:p-6 lg:p-8 border-b border-white/20 bg-gradient-to-r from-black/40 to-black/30 backdrop-blur-md">
      {/* Discover */}
      <Link 
        href="/discover" 
        className="px-4 md:px-5 py-2.5 rounded-full text-xs md:text-sm font-semibold text-white hover:opacity-80 transition-all whitespace-nowrap"
        style={{ backgroundColor: '#9C88FF' }}
      >
        Discover
      </Link>

      {/* About */}
      <Link 
        href="/about" 
        className="px-4 md:px-5 py-2.5 rounded-full text-xs md:text-sm font-semibold text-white hover:opacity-80 transition-all whitespace-nowrap"
        style={{ backgroundColor: '#5B4BA6' }}
      >
        About
      </Link>

      {/* 6-Week Program */}
      <Link 
        href="/program" 
        className="px-4 md:px-5 py-2.5 rounded-full text-xs md:text-sm font-semibold text-white hover:opacity-80 transition-all whitespace-nowrap"
        style={{ backgroundColor: '#E8967A' }}
      >
        6-Week Program
      </Link>

      {/* Clarity Check */}
      <Link
        href="/clarity-check"
        className="px-5 md:px-6 py-2.5 rounded-full text-xs md:text-sm font-semibold text-white hover:shadow-lg transition-all whitespace-nowrap"
        style={{ background: 'linear-gradient(90deg, #9C88FF 0%, #5B4BA6 100%)' }}
      >
        Clarity Check
      </Link>

      {/* Auth Section */}
      {isLoggedIn ? (
        <>
          <span className="hidden lg:block text-xs md:text-sm font-medium text-white/90 px-3">
            {displayName}
          </span>
          <Link
            href="/dashboard"
            className="px-4 md:px-5 py-2.5 rounded-full text-xs md:text-sm font-semibold text-white hover:opacity-80 transition-all whitespace-nowrap"
            style={{ backgroundColor: '#9C88FF' }}
          >
            Dashboard
          </Link>
          <form action="/api/auth/logout" method="post">
            <button 
              type="submit" 
              className="px-4 md:px-5 py-2.5 rounded-full text-xs md:text-sm font-semibold text-white hover:opacity-80 transition-all whitespace-nowrap"
              style={{ backgroundColor: '#E8967A' }}
            >
              Logout
            </button>
          </form>
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="px-4 md:px-5 py-2.5 rounded-full text-xs md:text-sm font-semibold text-white hover:opacity-80 transition-all whitespace-nowrap"
            style={{ backgroundColor: '#5B4BA6' }}
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-5 md:px-6 py-2.5 rounded-full text-xs md:text-sm font-semibold text-white hover:shadow-lg transition-all whitespace-nowrap"
            style={{ background: 'linear-gradient(90deg, #9C88FF 0%, #E8967A 100%)' }}
          >
            Get Started
          </Link>
        </>
      )}
    </header>
  );
}

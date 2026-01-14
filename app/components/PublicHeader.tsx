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
    <header className="relative z-20 w-full flex items-center justify-between p-6 lg:p-12 border-b border-white/20 bg-gradient-to-r from-black/40 to-black/30 backdrop-blur-md">
      <Link 
        href="/discover" 
        className="px-6 py-3 rounded-full font-italiana text-white text-lg flex-1 text-center mx-2 hover:opacity-90 transition-opacity"
        style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0))' }}
      >
        Discover
      </Link>

      <Link 
        href="/about" 
        className="px-6 py-3 rounded-full font-italiana text-white text-lg flex-1 text-center mx-2 hover:opacity-90 transition-opacity"
        style={{ background: 'linear-gradient(to right, #5B4BA6, rgba(91, 75, 166, 0))' }}
      >
        About
      </Link>

      <Link 
        href="/program" 
        className="px-6 py-3 rounded-full font-italiana text-white text-lg flex-1 text-center mx-2 hover:opacity-90 transition-opacity"
        style={{ background: 'linear-gradient(to right, #E8967A, rgba(232, 150, 122, 0))' }}
      >
        6-Week Program
      </Link>

      <Link
        href="/clarity-check"
        className="px-6 py-3 rounded-full font-italiana text-white text-lg flex-1 text-center mx-2 hover:opacity-90 transition-opacity"
        style={{ background: 'linear-gradient(to right, #9C88FF, rgba(91, 75, 166, 0))' }}
      >
        Clarity Check
      </Link>

      {isLoggedIn ? (
        <>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-full font-italiana text-white text-lg flex-1 text-center mx-2 hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(to right, #5B4BA6, rgba(91, 75, 166, 0))' }}
          >
            Dashboard
          </Link>
          <form action="/api/auth/logout" method="post" className="flex-1 mx-2">
            <button 
              type="submit" 
              className="w-full px-6 py-3 rounded-full font-italiana text-white text-lg hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(to right, #E8967A, rgba(232, 150, 122, 0))' }}
            >
              Logout
            </button>
          </form>
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="px-6 py-3 rounded-full font-italiana text-white text-lg flex-1 text-center mx-2 hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(to right, #5B4BA6, rgba(91, 75, 166, 0))' }}
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 rounded-full font-italiana text-white text-lg flex-1 text-center mx-2 hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(to right, #9C88FF, rgba(232, 150, 122, 0))' }}
          >
            Get Started
          </Link>
        </>
      )}
    </header>
  );
}

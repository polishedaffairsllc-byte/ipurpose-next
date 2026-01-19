'use client';
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function PublicHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check if user has session cookie
    const hasCookie = document.cookie.includes('FirebaseSession');
    setIsLoggedIn(!!hasCookie);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <header className="relative z-20 w-full flex flex-wrap items-center justify-between p-4 sm:p-6 lg:p-12 border-b border-white/20 bg-gradient-to-r from-black/40 to-black/30 backdrop-blur-md">
      <Link 
        href="/discover" 
        className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity text-xs sm:text-sm md:text-base"
        style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0))', color: '#FFFFFF' }}
      >
        Discover
      </Link>

      <Link 
        href="/about" 
        className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity text-xs sm:text-sm md:text-base"
        style={{ background: 'linear-gradient(to right, #5B4BA6, rgba(91, 75, 166, 0))', color: '#FFFFFF' }}
      >
        About
      </Link>

      <Link 
        href="/program" 
        className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity text-xs sm:text-sm md:text-base"
        style={{ background: 'linear-gradient(to right, #E8967A, rgba(232, 150, 122, 0))', color: '#FFFFFF' }}
      >
        Accelerator
      </Link>

      <Link
        href="/clarity-check"
        className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity text-xs sm:text-sm md:text-base"
        style={{ background: 'linear-gradient(to right, #9C88FF, rgba(91, 75, 166, 0))', color: '#FFFFFF' }}
      >
        Clarity Check
      </Link>

      <Link 
        href="/starter-pack" 
        className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity text-xs sm:text-sm md:text-base"
        style={{ background: 'linear-gradient(to right, #7DD3FC, rgba(125, 211, 252, 0))', color: '#FFFFFF' }}
      >
        Starter Pack
      </Link>

      <Link 
        href="/ai-blueprint" 
        className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity text-xs sm:text-sm md:text-base"
        style={{ background: 'linear-gradient(to right, #A78BFA, rgba(167, 139, 250, 0))', color: '#FFFFFF' }}
      >
        AI Blueprint
      </Link>

      {isLoggedIn ? (
        <>
          <Link
            href="/dashboard"
            className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity text-xs sm:text-sm md:text-base"
            style={{ background: 'linear-gradient(to right, #5B4BA6, rgba(91, 75, 166, 0))', color: '#FFFFFF' }}
          >
            Dashboard
          </Link>
          <form action="/api/auth/logout" method="post">
            <button 
              type="submit" 
              className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana hover:opacity-90 transition-opacity text-xs sm:text-sm md:text-base"
              style={{ background: 'linear-gradient(to right, #E8967A, rgba(232, 150, 122, 0))', color: '#FFFFFF' }}
            >
              Logout
            </button>
          </form>
        </>
      ) : (
        <Link
          href="/login"
          className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity text-xs sm:text-sm md:text-base"
          style={{ background: 'linear-gradient(to right, #E8967A, rgba(232, 150, 122, 0))', color: '#FFFFFF' }}
        >
          Login
        </Link>
      )}
    </header>
  );
}

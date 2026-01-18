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
    <header className="relative z-20 w-full flex items-center justify-between p-6 lg:p-12 border-b border-white/20 bg-gradient-to-r from-black/40 to-black/30 backdrop-blur-md">
      <Link 
        href="/discover" 
        className="px-6 py-3 rounded-full font-italiana flex-1 text-center mx-2 hover:opacity-90 transition-opacity"
        style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0))', fontSize: '24px', color: '#FFFFFF' }}
      >
        Discover
      </Link>

      <Link 
        href="/about" 
        className="px-6 py-3 rounded-full font-italiana flex-1 text-center mx-2 hover:opacity-90 transition-opacity"
        style={{ background: 'linear-gradient(to right, #5B4BA6, rgba(91, 75, 166, 0))', fontSize: '24px', color: '#FFFFFF' }}
      >
        About
      </Link>

      <Link 
        href="/program" 
        className="px-6 py-3 rounded-full font-italiana flex-1 text-center mx-2 hover:opacity-90 transition-opacity"
        style={{ background: 'linear-gradient(to right, #E8967A, rgba(232, 150, 122, 0))', fontSize: '24px', color: '#FFFFFF' }}
      >
        iPurpose Accelerator
      </Link>

      <Link
        href="/clarity-check"
        className="px-6 py-3 rounded-full font-italiana flex-1 text-center mx-2 hover:opacity-90 transition-opacity"
        style={{ background: 'linear-gradient(to right, #9C88FF, rgba(91, 75, 166, 0))', fontSize: '24px', color: '#FFFFFF' }}
      >
        Clarity Check
      </Link>

      <Link 
        href="/starter-pack" 
        className="px-6 py-3 rounded-full font-italiana flex-1 text-center mx-2 hover:opacity-90 transition-opacity"
        style={{ background: 'linear-gradient(to right, #7DD3FC, rgba(125, 211, 252, 0))', fontSize: '24px', color: '#FFFFFF' }}
      >
        Starter Pack
      </Link>

      <Link 
        href="/ai-blueprint" 
        className="px-6 py-3 rounded-full font-italiana flex-1 text-center mx-2 hover:opacity-90 transition-opacity"
        style={{ background: 'linear-gradient(to right, #A78BFA, rgba(167, 139, 250, 0))', fontSize: '24px', color: '#FFFFFF' }}
      >
        AI Blueprint
      </Link>

      {isLoggedIn ? (
        <>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-full font-italiana flex-1 text-center mx-2 hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(to right, #5B4BA6, rgba(91, 75, 166, 0))', fontSize: '24px', color: '#FFFFFF' }}
          >
            Dashboard
          </Link>
          <form action="/api/auth/logout" method="post" className="flex-1 mx-2">
            <button 
              type="submit" 
              className="w-full px-6 py-3 rounded-full font-italiana hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(to right, #E8967A, rgba(232, 150, 122, 0))', fontSize: '24px', color: '#FFFFFF' }}
            >
              Logout
            </button>
          </form>
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="px-6 py-3 rounded-full font-italiana flex-1 text-center mx-2 hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(to right, #5B4BA6, rgba(91, 75, 166, 0))', fontSize: '24px', color: '#FFFFFF' }}
          >
            Sign In
          </Link>
        </>
      )}
    </header>
  );
}

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
    <header className="relative z-20 w-full border-b border-white/20 backdrop-blur-md" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
      <div className="flex items-center justify-between gap-2 p-4 sm:p-6">
        <Link 
          href="/" 
          className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
          style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0.3))', color: '#FFFFFF', fontSize: '40px' }}
          aria-label="Home"
        >
          Home
        </Link>

        <Link 
          href="/discover" 
          className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
          style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0))', color: '#FFFFFF', fontSize: '40px' }}
        >
          Discover
        </Link>

        <Link 
          href="/about" 
          className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
          style={{ background: 'linear-gradient(to right, #4B4E6D, rgba(75, 78, 109, 0))', color: '#FFFFFF', fontSize: '40px' }}
        >
          About
        </Link>

        <Link 
          href="/program" 
          className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
          style={{ background: 'linear-gradient(to right, #FCC4B7, rgba(252, 196, 183, 0))', color: '#FFFFFF', fontSize: '40px' }}
        >
          iPurpose Accelerator™
        </Link>

        <Link
          href="/clarity-check"
          className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
          style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0))', color: '#FFFFFF', fontSize: '40px' }}
        >
          Clarity Check
        </Link>

        <Link 
          href="/starter-pack" 
          className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
          style={{ background: 'linear-gradient(to right, #E6C87C, rgba(230, 200, 124, 0))', color: '#FFFFFF', fontSize: '40px' }}
        >
          Starter Pack
        </Link>

        <Link 
          href="/ai-blueprint" 
          className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
          style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0))', color: '#FFFFFF', fontSize: '40px' }}
        >
          AI Blueprint
        </Link>

        {isLoggedIn ? (
          <>
            <Link
              href="/dashboard"
              className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
              style={{ background: 'linear-gradient(to right, #4B4E6D, rgba(75, 78, 109, 0))', color: '#FFFFFF', fontSize: '40px' }}
            >
              Dashboard
            </Link>
            <form action="/api/auth/logout" method="post">
              <button 
                type="submit" 
                className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana hover:opacity-90 transition-opacity whitespace-nowrap"
                style={{ background: 'linear-gradient(to right, #FCC4B7, rgba(252, 196, 183, 0))', color: '#FFFFFF', fontSize: '40px' }}
              >
                Logout
              </button>
            </form>
          </>
        ) : (
          <Link
            href="/login"
            className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
            style={{ background: 'linear-gradient(to right, #FCC4B7, rgba(252, 196, 183, 0))', color: '#FFFFFF', fontSize: '40px' }}
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}

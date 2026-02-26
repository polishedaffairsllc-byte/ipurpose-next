'use client';
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function PublicHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const hasCookie = document.cookie.includes('FirebaseSession');
    setIsLoggedIn(!!hasCookie);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <header className="relative z-20 w-full border-b border-white/20 backdrop-blur-md" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
      <div className="flex items-center justify-between gap-2 p-4 md:p-6">
        {/* Logo */}
        <Link 
          href="/" 
          className="px-3 md:px-4 py-2 md:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap text-lg md:text-xl"
          style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0.3))', color: '#FFFFFF' }}
          aria-label="Home"
        >
          Home
        </Link>

        {/* Desktop Navigation - Show on medium screens and up */}
        <nav className="hidden sm:flex items-center gap-1 flex-1 justify-center flex-wrap">
          <Link href="/discover" className="px-2 md:px-3 py-1 md:py-2 font-italiana hover:opacity-90 text-xs md:text-sm text-white">Discover</Link>
          <Link href="/about" className="px-2 md:px-3 py-1 md:py-2 font-italiana hover:opacity-90 text-xs md:text-sm text-white">About</Link>
          <Link href="/program" className="px-2 md:px-3 py-1 md:py-2 font-italiana hover:opacity-90 text-xs md:text-sm text-white">Accelerator™</Link>
          <Link href="/clarity-check" className="px-2 md:px-3 py-1 md:py-2 font-italiana hover:opacity-90 text-xs md:text-sm text-white">Clarity Check</Link>
          <Link href="/starter-pack" className="px-2 md:px-3 py-1 md:py-2 rounded-full font-italiana text-center hover:opacity-90 text-xs md:text-sm text-white" style={{ background: 'linear-gradient(to right, #E6C87C, rgba(230, 200, 124, 0))' }}>Starter Pack</Link>
          <Link href="/ai-blueprint" className="px-2 md:px-3 py-1 md:py-2 font-italiana hover:opacity-90 text-xs md:text-sm text-white">AI Blueprint</Link>
        </nav>

        {/* Desktop Auth Menu */}
        <div className="hidden sm:flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="px-2 md:px-3 py-1 md:py-2 font-italiana text-center hover:opacity-90 text-xs md:text-sm text-white"
              >
                Dashboard
              </Link>
              <form action="/api/auth/logout" method="post">
                <button 
                  type="submit" 
                  className="px-2 md:px-3 py-1 md:py-2 rounded-full font-italiana hover:opacity-90 text-xs md:text-sm text-white"
                  style={{ background: 'linear-gradient(to right, #FCC4B7, rgba(252, 196, 183, 0))' }}
                >
                  Logout
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="px-2 md:px-3 py-1 md:py-2 rounded-full font-italiana text-center hover:opacity-90 text-xs md:text-sm text-white"
              style={{ background: 'linear-gradient(to right, #4B4E6D, rgba(75, 78, 109, 0))' }}
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Button - Large and legible */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden p-3 text-white hover:opacity-75 transition-opacity"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="sm:hidden border-t border-white/20 bg-black/90 backdrop-blur-md">
          <div className="flex flex-col p-3">
            <Link href="/" className="px-4 py-3 text-base text-white hover:bg-white/10 rounded" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link href="/discover" className="px-4 py-3 text-base text-white hover:bg-white/10 rounded" onClick={() => setMobileMenuOpen(false)}>Discover</Link>
            <Link href="/about" className="px-4 py-3 text-base text-white hover:bg-white/10 rounded" onClick={() => setMobileMenuOpen(false)}>About</Link>
            <Link href="/program" className="px-4 py-3 text-base text-white hover:bg-white/10 rounded" onClick={() => setMobileMenuOpen(false)}>Accelerator™</Link>
            <Link href="/clarity-check" className="px-4 py-3 text-base text-white hover:bg-white/10 rounded" onClick={() => setMobileMenuOpen(false)}>Clarity Check</Link>
            <Link href="/starter-pack" className="px-4 py-3 text-base text-white hover:bg-white/10 rounded" onClick={() => setMobileMenuOpen(false)}>Starter Pack</Link>
            <Link href="/ai-blueprint" className="px-4 py-3 text-base text-white hover:bg-white/10 rounded" onClick={() => setMobileMenuOpen(false)}>AI Blueprint</Link>
            <div className="border-t border-white/20 mt-3 pt-3">
              {isLoggedIn ? (
                <>
                  <Link href="/dashboard" className="block px-4 py-3 text-base text-white hover:bg-white/10 rounded" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                  <form action="/api/auth/logout" method="post" className="w-full">
                    <button type="submit" className="w-full text-left px-4 py-3 text-base text-white hover:bg-white/10 rounded">Logout</button>
                  </form>
                </>
              ) : (
                <Link href="/login" className="block px-4 py-3 text-base text-white hover:bg-white/10 rounded" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

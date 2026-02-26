'use client';
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function PublicHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

        {/* Desktop Navigation - Hidden on mobile (under 768px) */}
        <nav className="hidden md:flex items-center gap-2 flex-1 justify-center flex-wrap">
          <Link 
            href="/discover" 
            className="px-2 lg:px-3 py-1 lg:py-2 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
            style={{ fontSize: '14px', color: '#FFFFFF' }}
          >
            Discover
          </Link>

          <Link 
            href="/about" 
            className="px-2 lg:px-3 py-1 lg:py-2 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
            style={{ fontSize: '14px', color: '#FFFFFF' }}
          >
            About
          </Link>

          <Link 
            href="/program" 
            className="px-2 lg:px-3 py-1 lg:py-2 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
            style={{ fontSize: '14px', color: '#FFFFFF' }}
          >
            Accelerator™
          </Link>

          <Link
            href="/clarity-check"
            className="px-2 lg:px-3 py-1 lg:py-2 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
            style={{ fontSize: '14px', color: '#FFFFFF' }}
          >
            Clarity Check
          </Link>

          <Link 
            href="/starter-pack" 
            className="px-2 lg:px-3 py-1 lg:py-2 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
            style={{ background: 'linear-gradient(to right, #E6C87C, rgba(230, 200, 124, 0))', color: '#FFFFFF', fontSize: '14px' }}
          >
            Starter Pack
          </Link>

          <Link 
            href="/ai-blueprint" 
            className="px-2 lg:px-3 py-1 lg:py-2 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
            style={{ fontSize: '14px', color: '#FFFFFF' }}
          >
            AI Blueprint
          </Link>
        </nav>

        {/* Desktop Auth Menu - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="px-2 lg:px-3 py-1 lg:py-2 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
                style={{ fontSize: '14px', color: '#FFFFFF' }}
              >
                Dashboard
              </Link>
              <form action="/api/auth/logout" method="post">
                <button 
                  type="submit" 
                  className="px-2 lg:px-3 py-1 lg:py-2 rounded-full font-italiana hover:opacity-90 transition-opacity whitespace-nowrap"
                  style={{ background: 'linear-gradient(to right, #FCC4B7, rgba(252, 196, 183, 0))', color: '#FFFFFF', fontSize: '14px' }}
                >
                  Logout
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="px-2 lg:px-3 py-1 lg:py-2 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
              style={{ background: 'linear-gradient(to right, #FCC4B7, rgba(252, 196, 183, 0))', color: '#FFFFFF', fontSize: '14px' }}
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Button - Only visible under 768px */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white hover:opacity-75 transition-opacity"
          style={{ color: '#FFFFFF' }}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown - Only visible under 768px */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-white/20 bg-black/95 backdrop-blur-md">
          <div className="flex flex-col p-4">
            <Link 
              href="/discover" 
              className="px-4 py-3 text-sm font-italiana hover:bg-white/10 rounded transition-colors"
              style={{ color: '#FFFFFF' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Discover
            </Link>
            <Link 
              href="/about" 
              className="px-4 py-3 text-sm font-italiana hover:bg-white/10 rounded transition-colors"
              style={{ color: '#FFFFFF' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              href="/program" 
              className="px-4 py-3 text-sm font-italiana hover:bg-white/10 rounded transition-colors"
              style={{ color: '#FFFFFF' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Accelerator™
            </Link>
            <Link
              href="/clarity-check"
              className="px-4 py-3 text-sm font-italiana hover:bg-white/10 rounded transition-colors"
              style={{ color: '#FFFFFF' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Clarity Check
            </Link>
            <Link 
              href="/starter-pack" 
              className="px-4 py-3 text-sm font-italiana hover:bg-white/10 rounded transition-colors"
              style={{ color: '#FFFFFF' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Starter Pack
            </Link>
            <Link 
              href="/ai-blueprint" 
              className="px-4 py-3 text-sm font-italiana hover:bg-white/10 rounded transition-colors"
              style={{ color: '#FFFFFF' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              AI Blueprint
            </Link>
            <div className="border-t border-white/20 mt-3 pt-3">
              {isLoggedIn ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="block px-4 py-3 text-sm font-italiana hover:bg-white/10 rounded transition-colors"
                    style={{ color: '#FFFFFF' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <form action="/api/auth/logout" method="post" className="w-full">
                    <button 
                      type="submit" 
                      className="w-full text-left px-4 py-3 text-sm font-italiana hover:bg-white/10 rounded transition-colors"
                      style={{ color: '#FFFFFF' }}
                    >
                      Logout
                    </button>
                  </form>
                </>
              ) : (
                <Link 
                  href="/login" 
                  className="block px-4 py-3 text-sm font-italiana hover:bg-white/10 rounded transition-colors"
                  style={{ color: '#FFFFFF' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

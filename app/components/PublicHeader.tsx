'use client';
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function PublicHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(true);

  useEffect(() => {
    // Check if user has session cookie
    const hasCookie = document.cookie.includes('FirebaseSession');
    setIsLoggedIn(!!hasCookie);
    
    // Check screen size
    setIsLargeScreen(window.innerWidth >= 1024);
    
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    
    window.addEventListener('resize', handleResize);
    setMounted(true);
    
    return () => window.removeEventListener('resize', handleResize);
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

        {/* Desktop Navigation - HIDDEN on mobile/tablet */}
        <Link 
          href="/discover" 
          className="hidden lg:inline-block px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
          style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0))', color: '#FFFFFF', fontSize: '40px' }}
        >
          Discover
        </Link>

        <Link 
          href="/about" 
          className="hidden lg:inline-block px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
          style={{ background: 'linear-gradient(to right, #4B4E6D, rgba(75, 78, 109, 0))', color: '#FFFFFF', fontSize: '40px' }}
        >
          About
        </Link>

        <Link 
          href="/program" 
          className="hidden lg:inline-block px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
          style={{ background: 'linear-gradient(to right, #FCC4B7, rgba(252, 196, 183, 0))', color: '#FFFFFF', fontSize: '40px' }}
        >
          iPurpose Accelerator™
        </Link>

        <Link
          href="/clarity-check"
          className="hidden lg:inline-block px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
          style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0))', color: '#FFFFFF', fontSize: '40px' }}
        >
          Clarity Check
        </Link>

        <Link 
          href="/starter-pack" 
          className="hidden lg:inline-block px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
          style={{ background: 'linear-gradient(to right, #E6C87C, rgba(230, 200, 124, 0))', color: '#FFFFFF', fontSize: '40px' }}
        >
          Starter Pack
        </Link>

        <Link 
          href="/ai-blueprint" 
          className="hidden lg:inline-block px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
          style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0))', color: '#FFFFFF', fontSize: '40px' }}
        >
          AI Blueprint
        </Link>

        {/* Desktop Auth - HIDDEN on mobile/tablet */}
        {isLoggedIn ? (
          <>
            <Link
              href="/dashboard"
              className="hidden lg:inline-block px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
              style={{ background: 'linear-gradient(to right, #4B4E6D, rgba(75, 78, 109, 0))', color: '#FFFFFF', fontSize: '40px' }}
            >
              Dashboard
            </Link>
            <form action="/api/auth/logout" method="post" className="hidden lg:inline-block">
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
            className="hidden lg:inline-block px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
            style={{ background: 'linear-gradient(to right, #FCC4B7, rgba(252, 196, 183, 0))', color: '#FFFFFF', fontSize: '40px' }}
          >
            Login
          </Link>
        )}

        {/* Mobile Menu Button - Only visible on small screens */}
        {!isLargeScreen && (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 ml-2 text-white hover:opacity-75"
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
        )}
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && !isLargeScreen && (
        <nav className="lg:hidden border-t border-white/20 bg-black/95 backdrop-blur-md">
          <div className="flex flex-col p-4">
            <Link 
              href="/discover" 
              className="px-4 py-2 text-sm hover:bg-white/10 rounded"
              style={{ color: '#FFFFFF' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Discover
            </Link>
            <Link 
              href="/about" 
              className="px-4 py-2 text-sm hover:bg-white/10 rounded"
              style={{ color: '#FFFFFF' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              href="/program" 
              className="px-4 py-2 text-sm hover:bg-white/10 rounded"
              style={{ color: '#FFFFFF' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Accelerator™
            </Link>
            <Link
              href="/clarity-check"
              className="px-4 py-2 text-sm hover:bg-white/10 rounded"
              style={{ color: '#FFFFFF' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Clarity Check
            </Link>
            <Link 
              href="/starter-pack" 
              className="px-4 py-2 text-sm hover:bg-white/10 rounded"
              style={{ color: '#FFFFFF' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Starter Pack
            </Link>
            <Link 
              href="/ai-blueprint" 
              className="px-4 py-2 text-sm hover:bg-white/10 rounded"
              style={{ color: '#FFFFFF' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              AI Blueprint
            </Link>
            <div className="border-t border-white/20 mt-2 pt-2">
              {isLoggedIn ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="block px-4 py-2 text-sm hover:bg-white/10 rounded"
                    style={{ color: '#FFFFFF' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <form action="/api/auth/logout" method="post" className="w-full">
                    <button 
                      type="submit" 
                      className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 rounded"
                      style={{ color: '#FFFFFF' }}
                    >
                      Logout
                    </button>
                  </form>
                </>
              ) : (
                <Link 
                  href="/login" 
                  className="block px-4 py-2 text-sm hover:bg-white/10 rounded"
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

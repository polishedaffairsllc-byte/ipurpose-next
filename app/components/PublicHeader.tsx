'use client';
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useId, useRef, useState } from "react";
import styles from './PublicHeader.module.css';

function Link(props: React.ComponentProps<typeof NextLink>) {
  const pathname = usePathname();
  const href = typeof props.href === 'string' ? props.href : props.href.pathname;
  const current = pathname === href || (href && href !== '/' && pathname.startsWith(`${href}/`));
  return <NextLink {...props} aria-current={current ? 'page' : undefined} />;
}

export default function PublicHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(true);
  const [clarityCheckDone, setClarityCheckDone] = useState(false);
  const menuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Preserve 40px where it fits; scale only the longer historical link sets.
  const desktopFontSize = clarityCheckDone
    ? isLoggedIn ? 'clamp(20px, 2.1vw, 40px)' : 'clamp(22px, 2.5vw, 40px)'
    : isLoggedIn ? 'clamp(28px, 3.4vw, 40px)' : '40px';

  useEffect(() => {
    // Check if user has session cookie
    const hasCookie = document.cookie.includes('FirebaseSession');
    setIsLoggedIn(!!hasCookie);
    
    // Check if clarity check has been completed
    const quizDone = localStorage.getItem('clarityCheckCompleted') === 'true';
    setClarityCheckDone(quizDone);
    
    // Check screen size
    setIsLargeScreen(window.innerWidth >= 1024);
    
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    
    window.addEventListener('resize', handleResize);
    setMounted(true);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!mounted) {
    // Show a skeleton header instead of nothing — prevents blank page flash
    return (
      <header className="relative z-20 w-full border-b border-white/20 backdrop-blur-md" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
        <div className="flex items-center justify-between gap-2 p-4 sm:p-6">
          <div className="h-10 w-24 rounded-full bg-white/10 animate-pulse" />
          <div className="h-10 w-32 rounded-full bg-white/10 animate-pulse" />
        </div>
      </header>
    );
  }

  return (
    <header
      className={`${styles.header} relative z-20 w-full border-b border-white/20 backdrop-blur-md`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && mobileMenuOpen) {
          setMobileMenuOpen(false);
          menuButtonRef.current?.focus();
        }
      }}
    >
      <div
        className={styles.row}
        style={{ '--nav-font-size': isLargeScreen ? desktopFontSize : '40px' } as React.CSSProperties}
      >
        <Link 
          href="/" 
          className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
          style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0.3))', color: '#FFFFFF', fontSize: '40px' }}
          aria-label="Home"
        >
          Home
        </Link>

        {/* Desktop Navigation - Show only on large screens */}
        {isLargeScreen && (
          <>
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

            {clarityCheckDone && (
              <Link 
                href="/program" 
                className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
                style={{ background: 'linear-gradient(to right, #FCC4B7, rgba(252, 196, 183, 0))', color: '#FFFFFF', fontSize: '40px' }}
              >
                iPurpose Accelerator™
              </Link>
            )}

            <Link
              href="/clarity-check"
              className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
              style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0))', color: '#FFFFFF', fontSize: '40px' }}
            >
              Clarity Check
            </Link>

            {clarityCheckDone && (
              <Link 
                href="/starter-pack" 
                className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
                style={{ background: 'linear-gradient(to right, #E6C87C, rgba(230, 200, 124, 0))', color: '#FFFFFF', fontSize: '40px' }}
              >
                Starter Pack
              </Link>
            )}

            {/* Desktop Auth - Show only on large screens */}
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
          </>
        )}

        {/* Mobile Menu Button - Only visible on small screens */}
        {!isLargeScreen && (
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={styles.menuButton}
            style={{ color: '#FFFFFF' }}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            aria-controls={menuId}
          >
            {mobileMenuOpen ? (
              <svg width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && !isLargeScreen && (
        <nav id={menuId} className={styles.mobileMenu} aria-label="Public navigation">
          <div className={styles.mobileLinks}>
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
            {clarityCheckDone && (
              <Link 
                href="/program" 
                className="px-4 py-2 text-sm hover:bg-white/10 rounded"
                style={{ color: '#FFFFFF' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Accelerator™
              </Link>
            )}
            <Link
              href="/clarity-check"
              className="px-4 py-2 text-sm hover:bg-white/10 rounded"
              style={{ color: '#FFFFFF' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Clarity Check
            </Link>
            {clarityCheckDone && (
              <Link 
                href="/starter-pack" 
                className="px-4 py-2 text-sm hover:bg-white/10 rounded"
                style={{ color: '#FFFFFF' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Starter Pack
              </Link>
            )}
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

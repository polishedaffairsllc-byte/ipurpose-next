'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Navigation from './Navigation';

const navItems = [
  { label: 'Orientation', href: '/orientation' },
  { label: 'Labs', href: '/labs' },
  { label: 'Compass', href: '/ai' },
  { label: 'Settings', href: '/settings' },
];

export default function InternalNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Hide on public pages
  const isPublicPage = pathname === '/' || pathname === '/login' || pathname === '/signup' || pathname === '/about' || pathname === '/contact' || pathname === '/privacy' || pathname === '/terms' || pathname === '/discover' || pathname === '/clarity-check' || pathname === '/clarity-check-numeric' || pathname === '/program' || pathname === '/google-review' || pathname === '/info-session' || pathname === '/ipurpose-6-week' || pathname === '/starter-pack' || pathname === '/ai-blueprint';
  const isOrientationRoute = pathname === '/orientation' || pathname.startsWith('/orientation/');
  const isIntegrationRoute = pathname === '/integration' || pathname.startsWith('/integration/');
  const isLearningRoute = pathname === '/learning-path' || pathname === '/ethics' || pathname === '/onboarding';
  
  // Hide on public pages and other learning routes
  if (isPublicPage || isLearningRoute) return null;

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  // Integration renders its own nav; skip global nav
  if (isIntegrationRoute) return null;

  // Show specialized authenticated journey nav for orientation only
  if (isOrientationRoute) {
    return (
      <nav className="sticky top-0 z-50 bg-[#141527]/95 backdrop-blur-sm border-b border-white/5">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/labs" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-lavenderViolet rounded-full flex items-center justify-center font-italiana text-xl text-[#0f1017] group-hover:brightness-110 transition-all">
                iP
              </div>
              <span className="font-italiana text-2xl text-lavenderViolet hidden sm:block">
                iPurpose
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.href)
                      ? 'bg-lavenderViolet/20 text-lavenderViolet'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              <form action="/api/auth/logout" method="post" className="ml-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-salmonPeach hover:bg-white/5 transition-all"
                >
                  Logout
                </button>
              </form>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/5 bg-[#141527]">
            <div className="container max-w-7xl mx-auto px-6 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.href)
                      ? 'bg-lavenderViolet/20 text-lavenderViolet'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-white/70 hover:text-salmonPeach hover:bg-white/5 transition-all"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        )}
      </nav>
    );
  }

  // For all other routes (dashboard, labs hub, compass, settings, etc), use the standard Navigation
  return <Navigation />;
}

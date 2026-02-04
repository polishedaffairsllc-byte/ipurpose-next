'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = {
  label: string;
  href: string;
  gradient: string;
  glow: string;
};

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', gradient: 'linear-gradient(90deg, #9C88FF, rgba(156, 136, 255, 0.3))', glow: 'rgba(156, 136, 255, 0.45)' },
  { label: 'Soul', href: '/soul', gradient: 'linear-gradient(90deg, #A78BFA, rgba(167, 139, 250, 0.25))', glow: 'rgba(167, 139, 250, 0.45)' },
  { label: 'Systems', href: '/systems', gradient: 'linear-gradient(90deg, #7DD3FC, rgba(125, 211, 252, 0.2))', glow: 'rgba(125, 211, 252, 0.35)' },
  { label: 'Compass', href: '/ai', gradient: 'linear-gradient(90deg, #5B4BA6, rgba(91, 75, 166, 0.25))', glow: 'rgba(91, 75, 166, 0.45)' },
  { label: 'Insights', href: '/insights', gradient: 'linear-gradient(90deg, #E8967A, rgba(232, 150, 122, 0.25))', glow: 'rgba(232, 150, 122, 0.4)' },
  { label: 'Labs', href: '/labs', gradient: 'linear-gradient(90deg, #9C88FF, rgba(91, 75, 166, 0.15))', glow: 'rgba(156, 136, 255, 0.45)' },
  { label: 'Community', href: '/community', gradient: 'linear-gradient(90deg, #7DD3FC, rgba(167, 139, 250, 0.15))', glow: 'rgba(125, 211, 252, 0.35)' },
  { label: 'Settings', href: '/settings', gradient: 'linear-gradient(90deg, #E8967A, rgba(232, 150, 122, 0.15))', glow: 'rgba(232, 150, 122, 0.4)' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const navButtonBase = 'w-full lg:flex-1 px-6 py-3 rounded-full text-center font-italiana text-base tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40';

  const getButtonStyle = (gradient: string, glow: string, active: boolean): React.CSSProperties => ({
    background: gradient,
    color: '#FFFFFF',
    boxShadow: active ? `0 15px 35px ${glow}` : '0 10px 25px rgba(0, 0, 0, 0.35)',
    border: active ? '1px solid rgba(255, 255, 255, 0.35)' : '1px solid rgba(255, 255, 255, 0.15)',
    opacity: active ? 1 : 0.9,
  });

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#05010d]/90 backdrop-blur-xl shadow-[0_20px_45px_rgba(0,0,0,0.65)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/dashboard" className="flex items-center gap-3 group text-white">
            <div className="w-12 h-12 bg-lavenderViolet rounded-full flex items-center justify-center font-italiana text-2xl text-[#0f1017] group-hover:brightness-110 transition-all">
              iP
            </div>
            <div className="flex flex-col">
              <span className="font-italiana text-2xl leading-none">iPurpose</span>
              <span className="text-xs uppercase tracking-[0.35em] text-white/60 mt-1">Navigator</span>
            </div>
          </Link>

          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-full text-white/80 border border-white/15 hover:border-white/40 transition-colors"
            aria-label="Toggle menu"
          >
            <span className="text-sm">Menu</span>
            <svg
              className="w-5 h-5"
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

        <div className="mt-6 hidden lg:flex flex-wrap gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={navButtonBase}
              style={getButtonStyle(item.gradient, item.glow, isActive(item.href))}
            >
              {item.label}
            </Link>
          ))}

          <form action="/api/auth/logout" method="post" className="lg:flex-1">
            <button
              type="submit"
              className={`${navButtonBase} font-semibold`}
              style={getButtonStyle('linear-gradient(90deg, #E8967A, rgba(232, 150, 122, 0.35))', 'rgba(232, 150, 122, 0.45)', false)}
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#05010d]/95 px-4 sm:px-6 pb-6">
          <div className="flex flex-col gap-3 py-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={navButtonBase}
                style={getButtonStyle(item.gradient, item.glow, isActive(item.href))}
              >
                {item.label}
              </Link>
            ))}

            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className={`${navButtonBase} font-semibold`}
                style={getButtonStyle('linear-gradient(90deg, #E8967A, rgba(232, 150, 122, 0.35))', 'rgba(232, 150, 122, 0.45)', false)}
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}

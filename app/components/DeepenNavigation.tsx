'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DeepenNavigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Systems', href: '/systems', gradient: 'linear-gradient(to right, #E6C87C, rgba(230, 200, 124, 0.3))' },
    { label: 'Reflections', href: '/insights', gradient: 'linear-gradient(to right, #4B4E6D, rgba(75, 78, 109, 0.3))' },
    { label: 'Community', href: '/community', gradient: 'linear-gradient(to right, #FCC4B7, rgba(252, 196, 183, 0.3))' },
    { label: 'Home', href: '/deepen', gradient: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0.3))' },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <header className="relative z-20 w-full border-b border-white/20 backdrop-blur-md" style={{ backgroundColor: '#4B4E6D' }}>
      {/* Desktop Nav */}
      <div className="hidden md:flex items-center w-full gap-2 p-4 sm:p-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap ${
              isActive(item.href) ? 'ring-2 ring-white/40' : ''
            }`}
            style={{ background: item.gradient, color: '#FFFFFF', fontSize: '36px' }}
          >
            {item.label}
          </Link>
        ))}

        <form action="/api/auth/logout" method="post" className="flex-1">
          <button
            type="submit"
            className="w-full px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana hover:opacity-90 transition-opacity whitespace-nowrap"
            style={{ background: 'linear-gradient(to right, #d4af37, rgba(212, 175, 55, 0.3))', color: '#FFFFFF', fontSize: '36px' }}
          >
            Logout
          </button>
        </form>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden flex items-center justify-between p-4">
        <Link href="/deepen" className="font-italiana text-white" style={{ fontSize: '28px' }}>
          ✦ Deepen
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-white/70 hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-7 h-7" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 px-4 py-4 space-y-2" style={{ backgroundColor: '#4B4E6D' }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-full font-italiana text-center text-white hover:opacity-90 transition-opacity ${
                isActive(item.href) ? 'ring-2 ring-white/40' : ''
              }`}
              style={{ background: item.gradient, fontSize: '28px' }}
            >
              {item.label}
            </Link>
          ))}
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              onClick={() => setMobileOpen(false)}
              className="w-full px-4 py-3 rounded-full font-italiana text-center text-white hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(to right, #d4af37, rgba(212, 175, 55, 0.3))', fontSize: '28px' }}
            >
              Logout
            </button>
          </form>
        </div>
      )}
    </header>
  );
}

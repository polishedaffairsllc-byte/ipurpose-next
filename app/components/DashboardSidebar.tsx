'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardSidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Profile', href: '/profile' },
    { label: 'Soul', href: '/soul' },
    { label: 'Systems', href: '/systems' },
    { label: 'Insights', href: '/insights' },
    { label: 'AI Assistant', href: '/ai' },
    { label: 'Settings', href: '/settings' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="w-64 h-screen bg-offWhite border-r border-warmCharcoal/10 flex flex-col">
      {/* Brand block */}
      <div className="p-6 border-b border-warmCharcoal/10">
        <h2 className="font-italiana text-2xl text-indigoDeep">iPurpose</h2>
        <p className="font-marcellus text-sm text-warmCharcoal/60 mt-1">
          Your Personal Growth Platform
        </p>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 py-6 px-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`
              block px-4 py-3 rounded-lg text-warmCharcoal font-medium transition-all
              ${
                isActive(item.href)
                  ? 'bg-salmonPeach text-warmCharcoal shadow-sm'
                  : 'hover:bg-lavenderViolet/10 hover:text-indigoDeep'
              }
            `}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-warmCharcoal/10">
        <p className="text-xs text-warmCharcoal/50 text-center font-montserrat">
          © 2024 iPurpose
        </p>
      </div>
    </aside>
  );
}

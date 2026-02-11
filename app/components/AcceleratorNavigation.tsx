'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Home', href: '/', color: '#4b4e6d' },
  { label: 'Dashboard', href: '/dashboard', color: '#9c88ff' },
  { label: 'Week 1', href: '/accelerator/week/1', color: '#9C88FF' },
  { label: 'Week 2', href: '/accelerator/week/2', color: '#FCC4B7' },
  { label: 'Week 3', href: '/accelerator/week/3', color: '#4B4E6D' },
  { label: 'Week 4', href: '/accelerator/week/4', color: '#E6C87C' },
  { label: 'Week 5', href: '/accelerator/week/5', color: '#88b04b' },
  { label: 'Week 6', href: '/accelerator/week/6', color: '#d4af37' },
  { label: 'Deepen', href: '/deepen', color: '#fcc4b7' },
];

export default function AcceleratorNavigation() {
  const pathname = usePathname();

  return (
    <header className="relative z-20 w-full border-b border-white/20 backdrop-blur-md" style={{ backgroundColor: '#000000' }}>
      <div className="flex items-center w-full gap-2 p-4 overflow-x-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 px-4 py-2 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
              style={{
                background: isActive
                  ? `linear-gradient(to right, ${item.color}, ${item.color})`
                  : `linear-gradient(to right, ${item.color}, ${item.color}4D)`,
                color: '#FFFFFF',
                fontSize: '18px',
                opacity: isActive ? 1 : 0.85,
              }}
            >
              {item.label}
            </Link>
          );
        })}

        <form action="/api/auth/logout" method="post">
          <button
            type="submit"
            className="flex-1 px-4 py-2 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
            style={{ background: 'linear-gradient(to right, #d4af37, rgba(212, 175, 55, 0.3))', color: '#FFFFFF', fontSize: '18px' }}
          >
            Logout
          </button>
        </form>
      </div>
    </header>
  );
}

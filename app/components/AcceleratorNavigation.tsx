'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Home', href: '/', color: '#4b4e6d' },
  { label: 'Dashboard', href: '/dashboard', color: '#9c88ff' },
  { label: 'Deepen', href: '/deepen', color: '#fcc4b7' },
  { label: 'Week 1', href: '/accelerator/week/1', color: '#9C88FF' },
  { label: 'Week 2', href: '/accelerator/week/2', color: '#FCC4B7' },
  { label: 'Week 3', href: '/accelerator/week/3', color: '#4B4E6D' },
  { label: 'Week 4', href: '/accelerator/week/4', color: '#E6C87C' },
  { label: 'Week 5', href: '/accelerator/week/5', color: '#88b04b' },
  { label: 'Week 6', href: '/accelerator/week/6', color: '#d4af37' },
];

export default function AcceleratorNavigation() {
  const pathname = usePathname();

  return (
    <header className="relative z-20 w-full border-b border-white/20 backdrop-blur-md" style={{ backgroundColor: '#000000' }}>
      {/* Desktop: single scrollable row */}
      <div className="hidden lg:flex items-center w-full gap-2 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 px-3 py-2 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
              style={{
                background: isActive
                  ? `linear-gradient(to right, ${item.color}, ${item.color})`
                  : `linear-gradient(to right, ${item.color}, ${item.color}4D)`,
                color: '#FFFFFF',
                fontSize: '14px',
                opacity: isActive ? 1 : 0.85,
              }}
            >
              {item.label}
            </Link>
          );
        })}

        <form action="/api/auth/logout" method="post" className="flex-1">
          <button
            type="submit"
            className="w-full px-3 py-2 rounded-full font-italiana hover:opacity-90 transition-opacity whitespace-nowrap"
            style={{ background: 'linear-gradient(to right, #d4af37, rgba(212, 175, 55, 0.3))', color: '#FFFFFF', fontSize: '14px' }}
          >
            Logout
          </button>
        </form>
      </div>

      {/* Tablet: two rows */}
      <div className="hidden sm:flex lg:hidden flex-col gap-2 p-4">
        {/* Row 1: Home, Dashboard, Deepen */}
        <div className="flex items-center gap-2">
          {navItems.slice(0, 3).map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 px-3 py-2 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
                style={{
                  background: isActive
                    ? `linear-gradient(to right, ${item.color}, ${item.color})`
                    : `linear-gradient(to right, ${item.color}, ${item.color}4D)`,
                  color: '#FFFFFF',
                  fontSize: '14px',
                  opacity: isActive ? 1 : 0.85,
                }}
              >
                {item.label}
              </Link>
            );
          })}
          <form action="/api/auth/logout" method="post" className="flex-1">
            <button
              type="submit"
              className="w-full px-3 py-2 rounded-full font-italiana hover:opacity-90 transition-opacity whitespace-nowrap"
              style={{ background: 'linear-gradient(to right, #d4af37, rgba(212, 175, 55, 0.3))', color: '#FFFFFF', fontSize: '14px' }}
            >
              Logout
            </button>
          </form>
        </div>
        {/* Row 2: Week 1–6 */}
        <div className="flex items-center gap-2">
          {navItems.slice(3).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 px-3 py-2 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
                style={{
                  background: isActive
                    ? `linear-gradient(to right, ${item.color}, ${item.color})`
                    : `linear-gradient(to right, ${item.color}, ${item.color}4D)`,
                  color: '#FFFFFF',
                  fontSize: '14px',
                  opacity: isActive ? 1 : 0.85,
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile: stacked compact layout */}
      <div className="flex sm:hidden flex-col gap-2 p-3">
        {/* Row 1: Home, Dashboard, Deepen, Logout */}
        <div className="flex items-center gap-1.5">
          {navItems.slice(0, 3).map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 px-2 py-1.5 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
                style={{
                  background: isActive
                    ? `linear-gradient(to right, ${item.color}, ${item.color})`
                    : `linear-gradient(to right, ${item.color}, ${item.color}4D)`,
                  color: '#FFFFFF',
                  fontSize: '12px',
                  opacity: isActive ? 1 : 0.85,
                }}
              >
                {item.label}
              </Link>
            );
          })}
          <form action="/api/auth/logout" method="post" className="flex-1">
            <button
              type="submit"
              className="w-full px-2 py-1.5 rounded-full font-italiana hover:opacity-90 transition-opacity whitespace-nowrap"
              style={{ background: 'linear-gradient(to right, #d4af37, rgba(212, 175, 55, 0.3))', color: '#FFFFFF', fontSize: '12px' }}
            >
              Logout
            </button>
          </form>
        </div>
        {/* Row 2: Week 1–3 */}
        <div className="flex items-center gap-1.5">
          {navItems.slice(3, 6).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 px-2 py-1.5 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
                style={{
                  background: isActive
                    ? `linear-gradient(to right, ${item.color}, ${item.color})`
                    : `linear-gradient(to right, ${item.color}, ${item.color}4D)`,
                  color: '#FFFFFF',
                  fontSize: '12px',
                  opacity: isActive ? 1 : 0.85,
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        {/* Row 3: Week 4–6 */}
        <div className="flex items-center gap-1.5">
          {navItems.slice(6).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 px-2 py-1.5 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
                style={{
                  background: isActive
                    ? `linear-gradient(to right, ${item.color}, ${item.color})`
                    : `linear-gradient(to right, ${item.color}, ${item.color}4D)`,
                  color: '#FFFFFF',
                  fontSize: '12px',
                  opacity: isActive ? 1 : 0.85,
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}

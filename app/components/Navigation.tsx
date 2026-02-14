'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <header className="relative z-20 w-full border-b border-white/20 backdrop-blur-md" style={{ backgroundColor: '#000000' }}>
      <div className="flex items-center w-full gap-2 p-4 sm:p-6">
        <Link 
          href="/" 
          className="flex-1 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
          style={{ background: 'linear-gradient(to right, #4b4e6d, rgba(75, 78, 109, 0.3))', color: '#FFFFFF', fontSize: '54px' }}
        >
          Home
        </Link>

        <Link 
          href="/dashboard"
          className="flex-1 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
          style={{ background: 'linear-gradient(to right, #9c88ff, rgba(156, 136, 255, 0.3))', color: '#FFFFFF', fontSize: '54px' }}
        >
          Orientation
        </Link>

        <Link
          href="/soul"
          className="flex-1 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
          style={{ background: 'linear-gradient(to right, #fcc4b7, rgba(252, 196, 183, 0.3))', color: '#FFFFFF', fontSize: '54px' }}
        >
          Soul
        </Link>

        <Link
          href="/labs"
          className="flex-1 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
          style={{ background: 'linear-gradient(to right, #88b04b, rgba(136, 176, 75, 0.3))', color: '#FFFFFF', fontSize: '54px' }}
        >
          Labs
        </Link>

        <Link
          href="/settings"
          className="flex-1 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
          style={{ background: 'linear-gradient(to right, #e6c87c, rgba(230, 200, 124, 0.3))', color: '#FFFFFF', fontSize: '54px' }}
        >
          Settings
        </Link>

        <form action="/api/auth/logout" method="post" className="flex-1">
          <button 
            type="submit" 
            className="w-full px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana hover:opacity-90 transition-opacity whitespace-nowrap"
            style={{ background: 'linear-gradient(to right, #d4af37, rgba(212, 175, 55, 0.3))', color: '#FFFFFF', fontSize: '54px' }}
          >
            Logout
          </button>
        </form>
      </div>
    </header>
  );
}

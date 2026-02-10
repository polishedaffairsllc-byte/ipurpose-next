'use client';

import React from 'react';
import Link from 'next/link';

export default function DeepenNavigation() {
  return (
    <header className="relative z-20 w-full border-b border-white/20 backdrop-blur-md" style={{ backgroundColor: '#000000' }}>
      <div className="flex items-center w-full gap-2 p-4 sm:p-6">
        <Link
          href="/"
          className="flex-1 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
          style={{ background: 'linear-gradient(to right, #4b4e6d, rgba(75, 78, 109, 0.3))', color: '#FFFFFF', fontSize: '40px' }}
        >
          Home
        </Link>

        <Link
          href="/deepen"
          className="flex-1 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
          style={{ background: 'linear-gradient(to right, #9c88ff, rgba(156, 136, 255, 0.3))', color: '#FFFFFF', fontSize: '40px' }}
        >
          Dashboard
        </Link>

        <Link
          href="/systems"
          className="flex-1 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
          style={{ background: 'linear-gradient(to right, #e6c87c, rgba(230, 200, 124, 0.3))', color: '#FFFFFF', fontSize: '40px' }}
        >
          Systems
        </Link>

        <Link
          href="/insights"
          className="flex-1 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
          style={{ background: 'linear-gradient(to right, #4b4e6d, rgba(75, 78, 109, 0.3))', color: '#FFFFFF', fontSize: '40px' }}
        >
          Reflections
        </Link>

        <Link
          href="/community"
          className="flex-1 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
          style={{ background: 'linear-gradient(to right, #fcc4b7, rgba(252, 196, 183, 0.3))', color: '#FFFFFF', fontSize: '40px' }}
        >
          Community
        </Link>

        <form action="/api/auth/logout" method="post" className="flex-1">
          <button
            type="submit"
            className="w-full px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana hover:opacity-90 transition-opacity whitespace-nowrap"
            style={{ background: 'linear-gradient(to right, #d4af37, rgba(212, 175, 55, 0.3))', color: '#FFFFFF', fontSize: '40px' }}
          >
            Logout
          </button>
        </form>
      </div>
    </header>
  );
}

'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';

const subscribe = () => () => undefined;

export default function PublicHeaderAuthControls({ mobile = false }: { mobile?: boolean }) {
  const isLoggedIn = useSyncExternalStore(
    subscribe,
    () => document.cookie.includes('FirebaseSession'),
    () => false,
  );

  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        className={mobile
          ? 'block px-4 py-2 text-sm hover:bg-white/10 rounded'
          : 'px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap'}
        style={mobile ? { color: '#FFFFFF' } : {
          background: 'linear-gradient(to right, #FCC4B7, transparent)',
          color: '#FFFFFF',
          fontSize: '40px',
        }}
      >
        Login
      </Link>
    );
  }

  return (
    <>
      <Link
        href="/dashboard"
        className={mobile
          ? 'block px-4 py-2 text-sm hover:bg-white/10 rounded'
          : 'px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap'}
        style={mobile ? { color: '#FFFFFF' } : {
          background: 'linear-gradient(to right, #4B4E6D, transparent)',
          color: '#FFFFFF',
          fontSize: '40px',
        }}
      >
        Dashboard
      </Link>
      <form action="/api/auth/logout" method="post">
        <button
          type="submit"
          className={mobile
            ? 'w-full text-left px-4 py-2 text-sm hover:bg-white/10 rounded'
            : 'px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana hover:opacity-90 transition-opacity whitespace-nowrap'}
          style={mobile ? { color: '#FFFFFF' } : {
            background: 'linear-gradient(to right, #FCC4B7, transparent)',
            color: '#FFFFFF',
            fontSize: '40px',
          }}
        >
          Logout
        </button>
      </form>
    </>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function LogoCompass() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, mounted]);

  if (!mounted) return null;

  const links = [
    { href: '/clarity-check', label: 'Start with Clarity', icon: '◆' },
    { href: '/discover', label: 'Explore Discover', icon: '◇' },
    { href: '/program', label: 'See the Accelerator', icon: '◆' }
  ];

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="logo-compass-panel"
        aria-label="Navigation compass"
        className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:opacity-70 transition-opacity"
        style={{ color: '#9C88FF' }}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
        </svg>
        <span className="text-xs font-semibold hidden sm:inline">Compass</span>
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          id="logo-compass-panel"
          className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-lavenderViolet/20 overflow-hidden z-40 min-w-max"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-lavenderViolet/5 to-salmonPeach/5 border-b border-lavenderViolet/10">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-italiana" style={{ color: '#FFFFFF' }}>
                Where would you like to begin?
              </p>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close compass"
                className="p-1 hover:bg-warmCharcoal/10 rounded transition-colors"
              >
                <svg className="w-4 h-4" style={{ color: '#9C88FF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-xs font-marcellus" style={{ color: '#FFFFFF' }}>
              No wrong way—this just helps you choose.
            </p>
          </div>

          {/* Links */}
          <div className="py-2">
            {links.map((link, idx) => (
              <Link
                key={idx}
                href={link.href}
                className="block px-4 py-2.5 text-sm font-marcellus hover:bg-lavenderViolet/10 transition-colors border-b border-lavenderViolet/5 last:border-b-0"
                style={{ color: '#FFFFFF' }}
                onClick={() => setIsOpen(false)}
              >
                <span className="text-lavenderViolet mr-2">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

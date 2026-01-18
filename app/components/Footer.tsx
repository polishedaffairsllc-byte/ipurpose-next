'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Footer() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user is authenticated by looking for Firebase session cookie
    setIsAuthenticated(document.cookie.includes('FirebaseSession'));
  }, []);

  if (!mounted) return null;

  return (
    <footer className="mt-20 bg-black/40 backdrop-blur-sm border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        {/* Footer Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
          {/* Column 1 - Platform */}
          <div>
            <h3 className="text-sm font-semibold text-white/80 mb-4 uppercase tracking-wide">
              Platform
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/discover"
                  className="text-sm text-white/60 hover:text-white/80 transition-colors"
                >
                  Discover
                </Link>
              </li>
              <li>
                <Link
                  href="/program"
                  className="text-sm text-white/60 hover:text-white/80 transition-colors"
                >
                  iPurpose Accelerator
                </Link>
              </li>
              <li>
                <Link
                  href="/starter-pack"
                  className="text-sm text-white/60 hover:text-white/80 transition-colors"
                >
                  Starter Pack
                </Link>
              </li>
              <li>
                <Link
                  href="/ai-blueprint"
                  className="text-sm text-white/60 hover:text-white/80 transition-colors"
                >
                  AI Blueprint
                </Link>
              </li>
              <li>
                <Link
                  href="/clarity-check"
                  className="text-sm text-white/60 hover:text-white/80 transition-colors"
                >
                  Clarity Check
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-white/60 hover:text-white/80 transition-colors"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2 - Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white/80 mb-4 uppercase tracking-wide">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-white/60 hover:text-white/80 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-white/60 hover:text-white/80 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Account */}
          <div>
            <h3 className="text-sm font-semibold text-white/80 mb-4 uppercase tracking-wide">
              Account
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/login"
                  className="text-sm text-white/60 hover:text-white/80 transition-colors"
                >
                  Sign In
                </Link>
              </li>
              {isAuthenticated && (
                <li>
                  <Link
                    href="/dashboard"
                    className="text-sm text-white/60 hover:text-white/80 transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8">
          {/* Footer Bottom */}
          <p className="text-xs text-white/50 text-center">
            © 2026 iPurpose. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

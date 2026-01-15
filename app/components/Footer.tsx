'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-20 py-12 px-6 lg:px-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        {/* Links Grid - 2 columns on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          {/* Column 1 */}
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <Link href="/discover" className="text-sm text-gray-400 hover:text-gray-300 transition-colors">
              Discover
            </Link>
            <Link href="/program" className="text-sm text-gray-400 hover:text-gray-300 transition-colors">
              6-Week Program
            </Link>
            <Link href="/about" className="text-sm text-gray-400 hover:text-gray-300 transition-colors">
              About
            </Link>
            <Link href="/clarity-check" className="text-sm text-gray-400 hover:text-gray-300 transition-colors">
              Clarity Check
            </Link>
          </div>

          {/* Column 2 */}
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <Link href="/privacy" className="text-sm text-gray-400 hover:text-gray-300 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-gray-400 hover:text-gray-300 transition-colors">
              Terms
            </Link>
            <Link href="/contact" className="text-sm text-gray-400 hover:text-gray-300 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

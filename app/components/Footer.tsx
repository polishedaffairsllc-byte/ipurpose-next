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
    <>
      {/* Deepen CTA — above footer */}
      {isAuthenticated && (
        <div className="w-full flex flex-col items-center py-12 px-4 sm:px-6 gap-4" style={{ backgroundColor: '#4B4E6D' }}>
          <p className="font-italiana text-white text-center" style={{ fontSize: '36px' }}>
            Ready for the next level?
          </p>
          <p className="font-marcellus text-white/70 text-center max-w-xl" style={{ fontSize: '20px' }}>
            Unlock systems, reflections, and community — $29/month, cancel anytime.
          </p>
          <Link
            href="/deepen"
            className="px-6 sm:px-8 py-3 sm:py-4 rounded-full font-marcellus text-white text-center hover:opacity-90 transition-opacity mt-2"
            style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0))', fontSize: '35px', color: '#FFFFFF' }}
          >
            ✦ Deepen Your Experience
          </Link>
        </div>
      )}

      <footer className="relative border-t border-white/10" style={{ zIndex: 10, backgroundColor: '#4b4e6d' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        {/* Footer Grid - Horizontal Layout */}
        <div className="flex flex-col items-center gap-8 mb-8">
          
          {/* Brand Anchor */}
          <div className="text-center">
            <Link 
              href="/" 
              className="inline-block hover:opacity-80 transition-colors"
            >
              <img 
                src="/images/my-logo.png" 
                alt="iPurpose Logo" 
                style={{ height: '160px', width: 'auto', margin: '0 auto', display: 'block' }}
              />
              <h3 className="font-semibold tracking-wide" style={{ fontSize: '40px', fontFamily: 'Italiana', color: '#FFFFFF', marginBottom: '0', marginTop: '0' }}>
                iPurpose<span style={{ fontSize: '0.5em', verticalAlign: 'super' }}>™</span>
              </h3>
            </Link>
            <p className="leading-relaxed" style={{ fontSize: '28px', fontFamily: 'Marcellus', color: 'rgba(255, 255, 255, 0.9)', marginTop: '0' }}>
              Where inner alignment becomes coherent action.
            </p>
          </div>

          {/* Navigation Links - Horizontal */}
          <div className="flex flex-wrap justify-center items-center" style={{ gap: '1.5rem' }}>
            <Link
              href="/"
              className="hover:opacity-80 transition-colors"
              style={{ fontSize: '28px', color: '#FFFFFF' }}
            >
              Orientation
            </Link>
            <span style={{ fontSize: '28px', color: 'rgba(255, 255, 255, 0.4)', margin: '0 0.5rem' }}>|</span>
            <Link
              href="/soul"
              className="hover:opacity-80 transition-colors"
              style={{ fontSize: '28px', color: '#FFFFFF' }}
            >
              Soul
            </Link>
            <span style={{ fontSize: '28px', color: 'rgba(255, 255, 255, 0.4)', margin: '0 0.5rem' }}>|</span>
            <Link
              href="/systems"
              className="hover:opacity-80 transition-colors"
              style={{ fontSize: '28px', color: '#FFFFFF' }}
            >
              Systems
            </Link>
            <span style={{ fontSize: '28px', color: 'rgba(255, 255, 255, 0.4)', margin: '0 0.5rem' }}>|</span>
            <Link
              href="/compass"
              className="hover:opacity-80 transition-colors"
              style={{ fontSize: '28px', color: '#FFFFFF' }}
            >
              Compass
            </Link>
            <span style={{ fontSize: '28px', color: 'rgba(255, 255, 255, 0.4)', margin: '0 0.5rem' }}>|</span>
            <Link
              href="/program"
              className="hover:opacity-80 transition-colors"
              style={{ fontSize: '28px', color: '#FFFFFF' }}
            >
              Accelerator
            </Link>
            
            <span style={{ fontSize: '28px', color: 'rgba(255, 255, 255, 0.4)', margin: '0 0.5rem' }}>|</span>
            
            <Link
              href="/privacy"
              className="hover:opacity-80 transition-colors"
              style={{ fontSize: '28px', color: '#FFFFFF' }}
            >
              Privacy Policy
            </Link>
            <span style={{ fontSize: '28px', color: 'rgba(255, 255, 255, 0.4)', margin: '0 0.5rem' }}>|</span>
            <Link
              href="/terms"
              className="hover:opacity-80 transition-colors"
              style={{ fontSize: '28px', color: '#FFFFFF' }}
            >
              Terms of Use
            </Link>
            <span style={{ fontSize: '28px', color: 'rgba(255, 255, 255, 0.4)', margin: '0 0.5rem' }}>|</span>
            <Link
              href="/disclaimer"
              className="hover:opacity-80 transition-colors"
              style={{ fontSize: '28px', color: '#FFFFFF' }}
            >
              Disclaimer
            </Link>
            
            <span style={{ fontSize: '28px', color: 'rgba(255, 255, 255, 0.4)', margin: '0 0.5rem' }}>|</span>
            
            <Link
              href="/support"
              className="hover:opacity-80 transition-colors"
              style={{ fontSize: '28px', color: '#FFFFFF' }}
            >
              Help Center
            </Link>
            <span style={{ fontSize: '28px', color: 'rgba(255, 255, 255, 0.4)', margin: '0 0.5rem' }}>|</span>
            <a
              href="/contact"
              className="hover:opacity-80 transition-colors"
              style={{ fontSize: '28px', color: '#FFFFFF' }}
            >
              Contact Us
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8">
          {/* Footer Bottom - All Horizontal */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-center">
            <p style={{ fontSize: '28px', color: 'rgba(255, 255, 255, 0.9)' }}>
              © 2026 iPurpose. All rights reserved.
            </p>
            
            <span className="hidden md:inline" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>•</span>
            
            <p className="italic" style={{ fontSize: '26px', color: 'rgba(255, 255, 255, 0.9)' }}>
              This platform is designed to support—not replace—professional care.
            </p>
            
            <span className="hidden md:inline" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>•</span>
            
            <p style={{ fontSize: '24px', color: 'rgba(255, 255, 255, 0.8)' }}>
              Privacy-first by design
            </p>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}

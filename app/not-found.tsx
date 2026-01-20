'use client';

import Link from 'next/link';
import FloatingLogo from './components/FloatingLogo';
import PublicHeader from './components/PublicHeader';
import Footer from './components/Footer';

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-white">
      {/* Floating Logo */}
      <FloatingLogo />
      
      {/* Public Header */}
      <PublicHeader />
      
      {/* 404 Section */}
      <div className="relative min-h-[calc(100vh-200px)] flex items-center justify-center px-6">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* Large 404 */}
          <div>
            <h1 className="text-9xl md:text-[120px] font-marcellus text-warmCharcoal/20 mb-2">
              404
            </h1>
            <h2 className="text-4xl md:text-5xl font-marcellus text-warmCharcoal mb-4">
              Page Not Found
            </h2>
            <p className="text-xl md:text-2xl text-warmCharcoal/70 mb-8">
              This page doesn't exist. Let's get you back on track.
            </p>
          </div>

          {/* Quick Links */}
          <div className="ipurpose-glow-container">
            <div className="ipurpose-card px-8 py-8">
              <p className="text-sm font-medium text-warmCharcoal/60 uppercase mb-6 tracking-widest">
                Suggested Pages
              </p>
              <div className="space-y-3">
                <Link
                  href="/"
                  className="block px-6 py-3 bg-lavenderViolet text-white rounded-lg font-marcellus hover:bg-indigoDeep transition"
                >
                  Back to Home
                </Link>
                <Link
                  href="/program"
                  className="block px-6 py-3 border-2 border-lavenderViolet text-lavenderViolet rounded-lg font-marcellus hover:bg-lavenderViolet/5 transition"
                >
                  Explore Program
                </Link>
                <Link
                  href="/discover"
                  className="block px-6 py-3 border-2 border-warmCharcoal/20 text-warmCharcoal rounded-lg font-marcellus hover:bg-warmCharcoal/5 transition"
                >
                  Discover iPurpose
                </Link>
                <Link
                  href="/clarity-check"
                  className="block px-6 py-3 border-2 border-salmonPeach text-salmonPeach rounded-lg font-marcellus hover:bg-salmonPeach/5 transition"
                >
                  Take Clarity Check
                </Link>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className="text-center text-warmCharcoal/60">
            <p className="text-sm">
              Can't find what you're looking for?{' '}
              <Link href="/" className="text-lavenderViolet hover:underline font-medium">
                Return home
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

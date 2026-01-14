'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ClarityCheckPage() {
  const googleFormUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdeqCKVGTFlVma5ws5cHIICSqU74dR6ZbpTzawj-Cx4_wcApQ/viewform?usp=sharing&ouid=108847680085116613841';

  useEffect(() => {
    // Redirect after 500ms to allow page to render
    const timer = setTimeout(() => {
      window.location.href = googleFormUrl;
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-20 bg-white/80 backdrop-blur-lg border-b border-lavenderViolet/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-marcellus text-2xl text-warmCharcoal hover:opacity-80 transition-opacity">
            iPurpose
          </Link>
          <div className="flex gap-4">
            <Link href="/login" className="text-warmCharcoal hover:text-lavenderViolet transition-colors font-semibold">
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container max-w-2xl mx-auto px-6 py-20 text-center space-y-8">
        <div className="space-y-4">
          <h1 className="heading-hero mb-6 text-warmCharcoal">
            Discover Your Alignment Type
          </h1>
          <p className="text-xl text-warmCharcoal/75">
            Opening alignment type assessment...
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-warmCharcoal/60">
            If the form doesn't open automatically, click the button below.
          </p>
          <a
            href={googleFormUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-gradient-to-r from-lavenderViolet to-indigoDeep text-white font-semibold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity"
          >
            Continue to Alignment Type Assessment
          </a>
        </div>

        <Link href="/" className="text-sm text-lavenderViolet hover:underline block">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

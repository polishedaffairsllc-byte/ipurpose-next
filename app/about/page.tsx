'use client';

import { Metadata } from 'next';
import Link from 'next/link';

// Note: Can't export metadata in client component, but we'll add it via layout if needed

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-lavenderViolet/10">
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
      <div className="container max-w-4xl mx-auto px-6 py-20 space-y-20">
        
        {/* Hero */}
        <section className="text-center space-y-6">
          <h1 className="heading-hero mb-6 text-warmCharcoal">
            About iPurpose
          </h1>
        </section>

        {/* Why iPurpose Exists */}
        <section className="space-y-6">
          <h2 className="text-4xl font-marcellus text-warmCharcoal">
            Why iPurpose exists
          </h2>
          <p className="text-lg text-warmCharcoal/75">
            iPurpose exists for people who are capable and driven—but feel disconnected from what they're building. It's designed to help you reconnect to what matters, reduce internal friction, and build with clarity.
          </p>
        </section>

        {/* The Method */}
        <section className="space-y-6">
          <h2 className="text-4xl font-marcellus text-warmCharcoal">
            The method
          </h2>
          <p className="text-lg text-warmCharcoal/75 mb-6">
            The framework is simple: Soul → Systems → AI.
          </p>
          <ul className="space-y-4 text-lg text-warmCharcoal/75">
            <li className="flex gap-3">
              <span className="text-lavenderViolet font-bold">•</span>
              <span><strong>Soul:</strong> alignment, truth, and inner clarity</span>
            </li>
            <li className="flex gap-3">
              <span className="text-lavenderViolet font-bold">•</span>
              <span><strong>Systems:</strong> structure, follow-through, and momentum</span>
            </li>
            <li className="flex gap-3">
              <span className="text-lavenderViolet font-bold">•</span>
              <span><strong>AI:</strong> gentle support that amplifies what's already true</span>
            </li>
          </ul>
        </section>

        {/* What Makes It Different */}
        <section className="space-y-6">
          <h2 className="text-4xl font-marcellus text-warmCharcoal">
            What makes it different
          </h2>
          <ul className="space-y-4 text-lg text-warmCharcoal/75">
            <li className="flex gap-3">
              <span className="text-lavenderViolet font-bold">✦</span>
              <span>Not performance-based</span>
            </li>
            <li className="flex gap-3">
              <span className="text-lavenderViolet font-bold">✦</span>
              <span>Not hustle-based</span>
            </li>
            <li className="flex gap-3">
              <span className="text-lavenderViolet font-bold">✦</span>
              <span>Built for thoughtful people who want real alignment</span>
            </li>
          </ul>
        </section>

        {/* Next Steps */}
        <section className="space-y-8 bg-gradient-to-br from-lavenderViolet/5 to-salmonPeach/5 rounded-2xl p-8 border border-lavenderViolet/10">
          <h2 className="text-4xl font-marcellus text-warmCharcoal">
            Next steps
          </h2>
          <div className="space-y-3">
            <Link
              href="/program"
              className="block w-full bg-gradient-to-r from-lavenderViolet to-indigoDeep text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity text-center"
            >
              View the 6-Week Program
            </Link>
            <Link href="/discover" className="text-lavenderViolet hover:underline block text-center">
              Discover iPurpose
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}

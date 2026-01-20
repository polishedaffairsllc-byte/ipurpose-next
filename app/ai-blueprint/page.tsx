'use client';

import { useState } from 'react';
import Link from 'next/link';
import PublicHeader from '../components/PublicHeader';
import Footer from '../components/Footer';

export default function AIBlueprintPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: 'ai_blueprint' }),
      });

      const data = await response.json();
      if (data.error) {
        setError(data.error);
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      setError('Failed to start checkout. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-white">
      <PublicHeader />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-lavenderViolet/10 via-transparent to-salmonPeach/10">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32">
          <section 
            className="relative text-center space-y-4 sm:space-y-6 py-16 sm:py-24 px-4 sm:px-6 rounded-2xl overflow-hidden mb-6"
            style={{
              backgroundImage: 'url(/images/this-serene-scene-features-vibrant-plants-beside-a-tranquil-water-surface-enhanced-by-gentle-raindrops-all-set-against-a-dreamy-blurred-natural-background-that-evokes-calmness-and-peace-photo.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/50"></div>
            
            <h1 className="heading-hero mb-6 text-white relative z-10 text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
              iPurpose Blueprint
            </h1>
            <p className="text-white relative z-10 font-italiana px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-lg sm:text-2xl md:text-3xl lg:text-4xl" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', color: '#FFFFFF' }}>
              Design your purpose-aligned systems with AI
            </p>
          </section>
          <div className="text-center">
            <p className="text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl text-warmCharcoal/80 mb-6 sm:mb-8">
              Use AI without losing your voice, values, or peace.
            </p>
            <p className="text-sm sm:text-base md:text-lg text-warmCharcoal/70 mb-8 sm:mb-12 max-w-2xl mx-auto">
              A practical, beginner-friendly guide to help you integrate AI into your workflow ethically—so you can plan, write, organize, and create with more ease.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8">
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg bg-gradient-to-r from-lavenderViolet to-indigoDeep text-white rounded-full font-marcellus hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Get the AI Blueprint — $47'}
            </button>
            <Link
              href="/starter-pack"
              className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg border-2 border-lavenderViolet text-lavenderViolet rounded-full font-marcellus hover:bg-lavenderViolet/5 transition-colors"
            >
              Start with Purpose First
            </Link>
            </div>
          </div>
        </div>
      </div>

      {/* What You'll Receive */}
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-24">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-marcellus text-warmCharcoal mb-12 text-center">
          What You'll Receive
        </h2>
        <div className="space-y-6">
          <div className="p-4 sm:p-6 bg-gradient-to-br from-lavenderViolet/5 to-transparent rounded-lg border border-lavenderViolet/20">
            <h3 className="text-lg sm:text-xl md:text-2xl font-marcellus text-warmCharcoal mb-2">
              Plain-Language AI Explanation
            </h3>
            <p className="text-sm sm:text-base md:text-lg text-warmCharcoal/70">
              No tech jargon. Just clarity on what AI can do, what it can't, and why that matters for your work and integrity.
            </p>
          </div>
          <div className="p-4 sm:p-6 bg-gradient-to-br from-salmonPeach/5 to-transparent rounded-lg border border-salmonPeach/20">
            <h3 className="text-lg sm:text-xl md:text-2xl font-marcellus text-warmCharcoal mb-2">
              Guided Prompts for Real Work
            </h3>
            <p className="text-sm sm:text-base md:text-lg text-warmCharcoal/70">
              Ready-to-use templates for clarity, content, planning, and workflow. Designed for your actual projects, not hypotheticals.
            </p>
          </div>
          <div className="p-4 sm:p-6 bg-gradient-to-br from-indigoDeep/5 to-transparent rounded-lg border border-indigoDeep/20">
            <h3 className="text-lg sm:text-xl md:text-2xl font-marcellus text-warmCharcoal mb-2">
              Simple Examples You Can Copy
            </h3>
            <p className="text-sm sm:text-base md:text-lg text-warmCharcoal/70">
              See how AI supports your work without replacing you. Real-world examples show what to automate and what to keep human.
            </p>
          </div>
          <div className="p-4 sm:p-6 bg-gradient-to-br from-softGold/5 to-transparent rounded-lg border border-softGold/20">
            <h3 className="text-lg sm:text-xl md:text-2xl font-marcellus text-warmCharcoal mb-2">
              Boundaries & Best Practices
            </h3>
            <p className="text-sm sm:text-base md:text-lg text-warmCharcoal/70">
              Feel safe and grounded. Clear guidelines on ethical AI use so you're not just chasing trends.
            </p>
          </div>
        </div>
      </div>

      {/* Who It's For */}
      <div className="bg-gradient-to-br from-lavenderViolet/5 via-transparent to-salmonPeach/5">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-24">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-marcellus text-warmCharcoal mb-12 text-center">
            Who It's For
          </h2>
          <div className="space-y-4 text-sm sm:text-base md:text-lg text-warmCharcoal/80">
            <p>
              <strong>You feel behind on AI</strong> and want a clean starting point that doesn't overwhelm.
            </p>
            <p>
              <strong>You want structure, not tool overload.</strong> No 47 different tools—just the essentials, done right.
            </p>
            <p>
              <strong>You care about integrity</strong> and don't want to build "soulless automation."
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-24">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-marcellus text-warmCharcoal mb-12 text-center">
          FAQ
        </h2>
        <div className="space-y-6">
          <div className="border-l-4 border-lavenderViolet pl-4 sm:pl-6">
            <h3 className="text-lg sm:text-xl md:text-2xl font-marcellus text-warmCharcoal mb-2">
              Do I need ChatGPT Plus or any paid tools?
            </h3>
            <p className="text-sm sm:text-base md:text-lg text-warmCharcoal/70">
              No. This guide works with free versions of popular AI tools. You can start immediately.
            </p>
          </div>
          <div className="border-l-4 border-salmonPeach pl-4 sm:pl-6">
            <h3 className="text-lg sm:text-xl md:text-2xl font-marcellus text-warmCharcoal mb-2">
              Is this a full course?
            </h3>
            <p className="text-sm sm:text-base md:text-lg text-warmCharcoal/70">
              No. It's a focused mini-offer and guide built for fast implementation. Not a 12-week program.
            </p>
          </div>
          <div className="border-l-4 border-indigoDeep pl-4 sm:pl-6">
            <h3 className="text-lg sm:text-xl md:text-2xl font-marcellus text-warmCharcoal mb-2">
              Will this teach advanced automation?
            </h3>
            <p className="text-sm sm:text-base md:text-lg text-warmCharcoal/70">
              No. This is foundational and intentional—designed to help you feel confident and grounded, not overwhelmed by complexity.
            </p>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-br from-lavenderViolet/10 via-transparent to-salmonPeach/10">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-24 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-marcellus text-warmCharcoal mb-6 sm:mb-8">
            Ready to Use AI With Intention?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-warmCharcoal/70 mb-8 sm:mb-12 max-w-2xl mx-auto">
            Get your practical blueprint today.
          </p>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="px-8 sm:px-12 py-3 sm:py-5 text-base sm:text-lg md:text-xl bg-gradient-to-r from-lavenderViolet to-indigoDeep text-white rounded-full font-marcellus hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Get the AI Blueprint — $47'}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

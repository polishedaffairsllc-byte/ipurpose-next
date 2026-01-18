'use client';

import { useState } from 'react';
import Link from 'next/link';
import FloatingLogo from '../components/FloatingLogo';
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
      <FloatingLogo />
      <PublicHeader />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-lavenderViolet/10 via-transparent to-salmonPeach/10">
        <div className="container max-w-4xl mx-auto px-6 py-32 text-center">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-marcellus text-warmCharcoal mb-6">
            AI Blueprint for Purpose-Driven Work
          </h1>
          <p className="text-2xl md:text-3xl lg:text-4xl text-warmCharcoal/80 mb-8">
            Use AI without losing your voice, values, or peace.
          </p>
          <p className="text-lg md:text-xl text-warmCharcoal/70 mb-12 max-w-2xl mx-auto">
            A practical, beginner-friendly guide to help you integrate AI into your workflow ethically—so you can plan, write, organize, and create with more ease.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-lavenderViolet to-indigoDeep text-white rounded-full font-marcellus text-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Get the AI Blueprint — $47'}
            </button>
            <Link
              href="/starter-pack"
              className="px-8 py-4 border-2 border-lavenderViolet text-lavenderViolet rounded-full font-marcellus text-xl hover:bg-lavenderViolet/5 transition-colors"
            >
              Start with Purpose First
            </Link>
          </div>
        </div>
      </div>

      {/* What You'll Receive */}
      <div className="container max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-5xl md:text-6xl font-marcellus text-warmCharcoal mb-12 text-center">
          What You'll Receive
        </h2>
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-br from-lavenderViolet/5 to-transparent rounded-lg border border-lavenderViolet/20">
            <h3 className="text-2xl font-marcellus text-warmCharcoal mb-2">
              Plain-Language AI Explanation
            </h3>
            <p className="text-warmCharcoal/70">
              No tech jargon. Just clarity on what AI can do, what it can't, and why that matters for your work and integrity.
            </p>
          </div>
          <div className="p-6 bg-gradient-to-br from-salmonPeach/5 to-transparent rounded-lg border border-salmonPeach/20">
            <h3 className="text-2xl font-marcellus text-warmCharcoal mb-2">
              Guided Prompts for Real Work
            </h3>
            <p className="text-warmCharcoal/70">
              Ready-to-use templates for clarity, content, planning, and workflow. Designed for your actual projects, not hypotheticals.
            </p>
          </div>
          <div className="p-6 bg-gradient-to-br from-indigoDeep/5 to-transparent rounded-lg border border-indigoDeep/20">
            <h3 className="text-2xl font-marcellus text-warmCharcoal mb-2">
              Simple Examples You Can Copy
            </h3>
            <p className="text-warmCharcoal/70">
              See how AI supports your work without replacing you. Real-world examples show what to automate and what to keep human.
            </p>
          </div>
          <div className="p-6 bg-gradient-to-br from-softGold/5 to-transparent rounded-lg border border-softGold/20">
            <h3 className="text-2xl font-marcellus text-warmCharcoal mb-2">
              Boundaries & Best Practices
            </h3>
            <p className="text-warmCharcoal/70">
              Feel safe and grounded. Clear guidelines on ethical AI use so you're not just chasing trends.
            </p>
          </div>
        </div>
      </div>

      {/* Who It's For */}
      <div className="bg-gradient-to-br from-lavenderViolet/5 via-transparent to-salmonPeach/5">
        <div className="container max-w-4xl mx-auto px-6 py-20">
          <h2 className="text-5xl md:text-6xl font-marcellus text-warmCharcoal mb-12 text-center">
            Who It's For
          </h2>
          <div className="space-y-4 text-lg text-warmCharcoal/80">
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
      <div className="container max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-5xl md:text-6xl font-marcellus text-warmCharcoal mb-12 text-center">
          FAQ
        </h2>
        <div className="space-y-6">
          <div className="border-l-4 border-lavenderViolet pl-6">
            <h3 className="text-2xl font-marcellus text-warmCharcoal mb-2">
              Do I need ChatGPT Plus or any paid tools?
            </h3>
            <p className="text-warmCharcoal/70">
              No. This guide works with free versions of popular AI tools. You can start immediately.
            </p>
          </div>
          <div className="border-l-4 border-salmonPeach pl-6">
            <h3 className="text-2xl font-marcellus text-warmCharcoal mb-2">
              Is this a full course?
            </h3>
            <p className="text-warmCharcoal/70">
              No. It's a focused mini-offer and guide built for fast implementation. Not a 12-week program.
            </p>
          </div>
          <div className="border-l-4 border-indigoDeep pl-6">
            <h3 className="text-2xl font-marcellus text-warmCharcoal mb-2">
              Will this teach advanced automation?
            </h3>
            <p className="text-warmCharcoal/70">
              No. This is foundational and intentional—designed to help you feel confident and grounded, not overwhelmed by complexity.
            </p>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-br from-lavenderViolet/10 via-transparent to-salmonPeach/10">
        <div className="container max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="text-5xl md:text-6xl font-marcellus text-warmCharcoal mb-8">
            Ready to Use AI With Intention?
          </h2>
          <p className="text-xl text-warmCharcoal/70 mb-8 max-w-2xl mx-auto">
            Get your practical blueprint today.
          </p>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="px-12 py-5 bg-gradient-to-r from-lavenderViolet to-indigoDeep text-white rounded-full font-marcellus text-2xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Get the AI Blueprint — $47'}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

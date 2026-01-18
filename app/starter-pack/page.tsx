'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FloatingLogo from '../components/FloatingLogo';
import PublicHeader from '../components/PublicHeader';
import Footer from '../components/Footer';

export default function StarterPackPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleCheckout = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: 'starter_pack' }),
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
            Purpose Starter Pack
          </h1>
          <p className="text-2xl md:text-3xl lg:text-4xl text-warmCharcoal/80 mb-8">
            Get clear on your direction — without committing to a full program.
          </p>
          <p className="text-lg md:text-xl text-warmCharcoal/70 mb-12 max-w-2xl mx-auto">
            A short, guided starter experience to help you reconnect to what matters, name your purpose clearly, and take your next step with calm structure.
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
              {loading ? 'Loading...' : 'Get the Starter Pack — $27'}
            </button>
            <Link
              href="/clarity-check"
              className="px-8 py-4 border-2 border-lavenderViolet text-lavenderViolet rounded-full font-marcellus text-xl hover:bg-lavenderViolet/5 transition-colors"
            >
              Not ready? Try Clarity Check
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
              Guided Soul Alignment Prompts
            </h3>
            <p className="text-warmCharcoal/70">
              Reduce fog and overwhelm with intentional questions designed to reconnect you with what actually matters to you.
            </p>
          </div>
          <div className="p-6 bg-gradient-to-br from-salmonPeach/5 to-transparent rounded-lg border border-salmonPeach/20">
            <h3 className="text-2xl font-marcellus text-warmCharcoal mb-2">
              Purpose Statement Framework
            </h3>
            <p className="text-warmCharcoal/70">
              Name your direction in plain language — not buzzwords. A simple template that helps you articulate what you're building, why it matters, and who it serves.
            </p>
          </div>
          <div className="p-6 bg-gradient-to-br from-indigoDeep/5 to-transparent rounded-lg border border-indigoDeep/20">
            <h3 className="text-2xl font-marcellus text-warmCharcoal mb-2">
              Simple Systems Map
            </h3>
            <p className="text-warmCharcoal/70">
              See what supports you and what drains you. A visual exercise to understand your current environment so you can build with intention.
            </p>
          </div>
          <div className="p-6 bg-gradient-to-br from-softGold/5 to-transparent rounded-lg border border-softGold/20">
            <h3 className="text-2xl font-marcellus text-warmCharcoal mb-2">
              Next Step Pathway
            </h3>
            <p className="text-warmCharcoal/70">
              Don't stall after insight. Get a concrete, grounded action you can take this week — no overwhelm, just clarity.
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
              <strong>You feel called to build something</strong> but you're not clear what or how.
            </p>
            <p>
              <strong>You want a structured starting point</strong> that still feels soulful and human.
            </p>
            <p>
              <strong>You don't want a long course</strong> — you want movement now, not six weeks from now.
            </p>
            <p>
              <strong>You're tired of vague inspiration</strong> and ready for something actionable.
            </p>
          </div>
        </div>
      </div>

      {/* What Changes After */}
      <div className="container max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-5xl md:text-6xl font-marcellus text-warmCharcoal mb-12 text-center">
          After 60–90 Minutes, You'll Have:
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="text-3xl text-lavenderViolet font-marcellus">✓</div>
              <div>
                <h3 className="text-xl font-marcellus text-warmCharcoal mb-2">
                  A Clearer Sense of Direction
                </h3>
                <p className="text-warmCharcoal/70">
                  Not perfect clarity, but real movement from fog to focus.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-3xl text-lavenderViolet font-marcellus">✓</div>
              <div>
                <h3 className="text-xl font-marcellus text-warmCharcoal mb-2">
                  Words for What You're Building
                </h3>
                <p className="text-warmCharcoal/70">
                  Even if it's early and evolving, you'll have language to share it.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="text-3xl text-lavenderViolet font-marcellus">✓</div>
              <div>
                <h3 className="text-xl font-marcellus text-warmCharcoal mb-2">
                  A Grounded Next Step
                </h3>
                <p className="text-warmCharcoal/70">
                  Something concrete you can take this week — no overwhelm.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery */}
      <div className="bg-gradient-to-br from-indigoDeep/5 to-transparent">
        <div className="container max-w-4xl mx-auto px-6 py-20">
          <h2 className="text-5xl md:text-6xl font-marcellus text-warmCharcoal mb-12 text-center">
            Delivery & Support
          </h2>
          <div className="space-y-6 text-lg text-warmCharcoal/80">
            <div>
              <h3 className="text-2xl font-marcellus text-warmCharcoal mb-2">Format</h3>
              <p>Digital access via download</p>
            </div>
            <div>
              <h3 className="text-2xl font-marcellus text-warmCharcoal mb-2">Access</h3>
              <p>Delivered immediately after checkout</p>
            </div>
            <div>
              <h3 className="text-2xl font-marcellus text-warmCharcoal mb-2">Support</h3>
              <p>Self-guided (no live calls, but all materials are self-explanatory)</p>
            </div>
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
              Is this the full program?
            </h3>
            <p className="text-warmCharcoal/70">
              No. This is a starter experience designed to give you clarity and momentum. The iPurpose Accelerator is our full 6-week cohort program with live mentorship.
            </p>
          </div>
          <div className="border-l-4 border-salmonPeach pl-6">
            <h3 className="text-2xl font-marcellus text-warmCharcoal mb-2">
              Do I need any special knowledge?
            </h3>
            <p className="text-warmCharcoal/70">
              No. This is designed for beginners. No prerequisite knowledge needed.
            </p>
          </div>
          <div className="border-l-4 border-indigoDeep pl-6">
            <h3 className="text-2xl font-marcellus text-warmCharcoal mb-2">
              Can I apply this toward the Accelerator later?
            </h3>
            <p className="text-warmCharcoal/70">
              Keep your receipt. Occasionally we offer credit or discounts during launches—we'll reach out if you're eligible.
            </p>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-br from-lavenderViolet/10 via-transparent to-salmonPeach/10">
        <div className="container max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="text-5xl md:text-6xl font-marcellus text-warmCharcoal mb-8">
            Ready to Start?
          </h2>
          <p className="text-xl text-warmCharcoal/70 mb-8 max-w-2xl mx-auto">
            Get clear on your direction in 60–90 minutes.
          </p>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="px-12 py-5 bg-gradient-to-r from-lavenderViolet to-indigoDeep text-white rounded-full font-marcellus text-2xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Get the Starter Pack — $27'}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

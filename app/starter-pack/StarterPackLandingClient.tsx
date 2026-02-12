"use client";

import { useState } from 'react';
import Link from 'next/link';
import PublicHeader from '../components/PublicHeader';
import Footer from '../components/Footer';

export default function StarterPackLanding() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      <PublicHeader />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-lavenderViolet/10 via-transparent to-salmonPeach/10">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32">
          <section
            className="relative text-center space-y-4 sm:space-y-6 py-16 sm:py-24 px-4 sm:px-6 rounded-2xl overflow-hidden mb-6"
            style={{
              backgroundImage: 'url(/images/cosmic-timetraveler-pYyOZ8q7AII-unsplash.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/50"></div>
            <h1 className="heading-hero mb-6 text-white relative z-10 text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
              iPurpose Starter Pack
            </h1>
            <p className="text-white relative z-10 font-italiana px-4 sm:px-6 py-2 sm:py-3 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)', fontSize: '55px' }}>
              Your foundation for purpose-driven work
            </p>
          </section>

          <div className="text-center">
            <p className="text-[35px] text-warmCharcoal/80 mb-6 sm:mb-8 text-center">
              Get clear on your direction — without committing to a full program.
            </p>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
            )}
          </div>
        </div>
      </div>

      {/* Short feature list + CTA */}
      <div className="container max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-6">What you get</h2>
        <p className="mb-8">Guided prompts, a purpose-statement framework, and a clear next step pathway.</p>

        <div className="space-y-3 sm:space-y-4 flex flex-col items-center">
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="px-6 sm:px-8 py-3 sm:py-4 rounded-full font-marcellus text-white text-center hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(to right, #E6C87C, rgba(230, 200, 124, 0))', fontSize: '20px' }}
          >
            {loading ? 'Starting checkout…' : 'Buy Starter Pack — $27'}
          </button>

          <Link href="/clarity-check" className="text-sm text-indigo-600 underline mt-4">
            Not ready? Try the Clarity Check
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}

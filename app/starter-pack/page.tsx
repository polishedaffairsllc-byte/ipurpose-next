'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/50"></div>
            
            <h1 className="heading-hero mb-6 text-white relative z-10 text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
              iPurpose Starter Pack
            </h1>
            <p className="text-white relative z-10 font-italiana px-4 sm:px-6 py-2 sm:py-3 rounded-lg" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', color: '#FFFFFF', fontSize: '55px' }}>
              Your foundation for purpose-driven work
            </p>
          </section>
          <div className="text-center">
            <p className="text-[35px] text-warmCharcoal/80 mb-6 sm:mb-8 text-center">
              Get clear on your direction — without committing to a full program.
            </p>
            <p className="text-[35px] text-warmCharcoal/70 mb-8 sm:mb-12 max-w-2xl mx-auto text-center">
              A short, guided starter experience to help you reconnect to what matters, name your purpose clearly, and take your next step with calm structure.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* What You'll Receive */}
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <h2 className="text-[55px] font-marcellus text-warmCharcoal mb-8 sm:mb-12 text-center">
          What You'll Receive
        </h2>
        <div className="space-y-10">
          <div className="p-6 bg-gradient-to-br from-lavenderViolet/5 to-transparent rounded-lg">
            <h3 className="text-[45px] font-marcellus text-warmCharcoal mb-2 text-center">
              Guided Soul Alignment Prompts
            </h3>
            <p className="text-[35px] text-warmCharcoal/70 text-center">
              Reduce fog and overwhelm with intentional questions designed to reconnect you with what actually matters to you.
            </p>
            <div className="flex items-center justify-center gap-3 w-full max-w-md mx-auto mt-6" aria-hidden="true">
              <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #9C88FF, transparent)' }}></div>
              <span style={{ fontSize: '20px', color: '#9C88FF' }}>✦</span>
              <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #9C88FF, transparent)' }}></div>
            </div>
          </div>
          <div className="p-6 bg-gradient-to-br from-salmonPeach/5 to-transparent rounded-lg">
            <h3 className="text-[45px] font-marcellus text-warmCharcoal mb-2 text-center">
              Purpose Statement Framework
            </h3>
            <p className="text-[35px] text-warmCharcoal/70 text-center">
              Name your direction in plain language — not buzzwords. A simple template that helps you articulate what you're building, why it matters, and who it serves.
            </p>
            <div className="flex items-center justify-center gap-3 w-full max-w-md mx-auto mt-6" aria-hidden="true">
              <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #FCC4B7, transparent)' }}></div>
              <span style={{ fontSize: '20px', color: '#FCC4B7' }}>✦</span>
              <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #FCC4B7, transparent)' }}></div>
            </div>
          </div>
          <div className="p-6 bg-gradient-to-br from-indigoDeep/5 to-transparent rounded-lg">
            <h3 className="text-[45px] font-marcellus text-warmCharcoal mb-2 text-center">
              Simple Systems Map
            </h3>
            <p className="text-[35px] text-warmCharcoal/70 text-center">
              See what supports you and what drains you. A visual exercise to understand your current environment so you can build with intention.
            </p>
            <div className="flex items-center justify-center gap-3 w-full max-w-md mx-auto mt-6" aria-hidden="true">
              <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #4B4E6D, transparent)' }}></div>
              <span style={{ fontSize: '20px', color: '#4B4E6D' }}>✦</span>
              <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #4B4E6D, transparent)' }}></div>
            </div>
          </div>
          <div className="p-6 bg-gradient-to-br from-softGold/5 to-transparent rounded-lg">
            <h3 className="text-[45px] font-marcellus text-warmCharcoal mb-2 text-center">
              Next Step Pathway
            </h3>
            <p className="text-[35px] text-warmCharcoal/70 text-center">
              Don't stall after insight. Get a concrete, grounded action you can take this week — no overwhelm, just clarity.
            </p>
          </div>
        </div>
      </div>

      {/* Who It's For */}
      <div className="bg-gradient-to-br from-lavenderViolet/5 via-transparent to-salmonPeach/5">
        <div className="container max-w-4xl mx-auto px-6 py-20">
          <div className="flex items-center justify-center gap-3 w-full max-w-md mx-auto mb-6" aria-hidden="true">
            <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #9C88FF, transparent)' }}></div>
            <span style={{ fontSize: '20px', color: '#9C88FF' }}>✦</span>
            <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #9C88FF, transparent)' }}></div>
          </div>
          <h2 className="text-[45px] font-marcellus text-warmCharcoal mb-12 text-center">
            Who It's For
          </h2>
          <div className="space-y-4 text-[35px] text-warmCharcoal/80 text-center">
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
        <h2 className="text-[45px] font-marcellus text-warmCharcoal mb-12 text-center">
          After 60–90 Minutes, You'll Have:
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="text-3xl text-lavenderViolet font-marcellus">✓</div>
              <div>
                <h3 className="text-[45px] font-marcellus text-warmCharcoal mb-2 text-center">
                  A Clearer Sense of Direction
                </h3>
                <p className="text-[35px] text-warmCharcoal/70 text-center">
                  Not perfect clarity, but real movement from fog to focus.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="text-3xl text-lavenderViolet font-marcellus">✓</div>
              <div>
                <h3 className="text-[45px] font-marcellus text-warmCharcoal mb-2 text-center">
                  Words for What You're Building
                </h3>
                <p className="text-[35px] text-warmCharcoal/70 text-center">
                  Even if it's early and evolving, you'll have language to share it.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="text-3xl text-lavenderViolet font-marcellus">✓</div>
              <div>
                <h3 className="text-[45px] font-marcellus text-warmCharcoal mb-2 text-center">
                  A Grounded Next Step
                </h3>
                <p className="text-[35px] text-warmCharcoal/70 text-center">
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
          <h2 className="text-[45px] font-marcellus text-warmCharcoal mb-12 text-center">
            Delivery & Support
          </h2>
          <div className="space-y-6 text-[35px] text-warmCharcoal/80 text-center">
            <div>
              <h3 className="text-2xl font-marcellus text-warmCharcoal mb-2 text-center">Format</h3>
              <p>Digital access via download</p>
            </div>
            <div>
              <h3 className="text-2xl font-marcellus text-warmCharcoal mb-2 text-center">Access</h3>
              <p>Delivered immediately after checkout</p>
            </div>
            <div>
              <h3 className="text-2xl font-marcellus text-warmCharcoal mb-2 text-center">Support</h3>
              <p>Self-guided (no live calls, but all materials are self-explanatory)</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="container max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-[45px] font-marcellus text-warmCharcoal mb-12 text-center">
          FAQ
        </h2>
        <div className="space-y-12">
          <div className="space-y-4 text-center">
            <h3 className="text-[45px] font-marcellus text-warmCharcoal mb-2 text-center">
              Is this the full program?
            </h3>
            <p className="text-[35px] text-warmCharcoal/70 text-center">
              No. This is a starter experience designed to give you clarity and momentum. The iPurpose Accelerator is our full cohort program with live mentorship.
            </p>
          </div>
          <div className="space-y-4 text-center">
            <h3 className="text-[45px] font-marcellus text-warmCharcoal mb-2 text-center">
              Do I need any special knowledge?
            </h3>
            <p className="text-[35px] text-warmCharcoal/70 text-center">
              No. This is designed for beginners. No prerequisite knowledge needed.
            </p>
          </div>
          <div className="space-y-4 text-center">
            <h3 className="text-[45px] font-marcellus text-warmCharcoal mb-2 text-center">
              Can I apply this toward the Accelerator later?
            </h3>
            <p className="text-[35px] text-warmCharcoal/70 text-center">
              Keep your receipt. Occasionally we offer credit or discounts during launches—we'll reach out if you're eligible.
            </p>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-br from-lavenderViolet/10 via-transparent to-salmonPeach/10">
        <div className="container max-w-4xl mx-auto px-6 py-20">
          <div className="flex items-center justify-center gap-3 w-full max-w-md mx-auto mb-6" aria-hidden="true">
            <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #E6C87C, transparent)' }}></div>
            <span style={{ fontSize: '20px', color: '#E6C87C' }}>✦</span>
            <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #E6C87C, transparent)' }}></div>
          </div>
          <h2 className="text-[45px] font-marcellus text-warmCharcoal mb-8 text-center">
            Ready to Start?
          </h2>
          <p className="text-[35px] text-warmCharcoal/70 mb-8 max-w-2xl mx-auto text-center">
            Get clear on your direction in 60–90 minutes.
          </p>
          <div className="space-y-3 sm:space-y-4 flex flex-col">
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-full font-marcellus text-white text-center hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(to right, #E6C87C, rgba(230, 200, 124, 0))', fontSize: '35px' }}
            >
              {loading ? 'Loading...' : 'Get the Starter Pack — $27'}
            </button>
            <Link
              href="/clarity-check"
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-full font-marcellus text-white text-center hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0))', fontSize: '35px' }}
            >
              Not ready? Try Clarity Check
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

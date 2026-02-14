"use client";

import { useState } from 'react';
import Link from 'next/link';
import PublicHeader from '../components/PublicHeader';
import StarterPackNav from '../components/StarterPackNav';
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
    <div className="relative z-10 min-h-screen bg-white">
      <PublicHeader />

      {/* ── Hero ── */}
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
            <div className="absolute inset-0 bg-black/50" />
            <h1 className="heading-hero mb-4 text-white relative z-10 text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
              <span style={{ fontFamily: 'Marcellus, serif', fontSize: '135px', color: '#FFFFFF' }}>iPurpose Starter Pack</span>
            </h1>
            <p className="relative z-10 font-italiana text-xl sm:text-2xl md:text-3xl px-4 sm:px-6 py-2 sm:py-3 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)', color: '#FFFFFF' }}>
              <span style={{ fontFamily: 'Italiana, serif', fontSize: '112px', color: '#FFFFFF' }}>Begin your clarity journey. Start simple. Start grounded.</span>
            </p>
          </section>

          <div className="text-center max-w-2xl mx-auto">
            <p className="text-warmCharcoal/80 leading-relaxed" style={{ fontFamily: 'Italiana, serif', fontSize: '54px' }}>
              If you're feeling pulled in a hundred directions, unsure where to focus, or ready to finally get intentional about your next season — this is your first step.
            </p>
            <p className="mt-4 text-warmCharcoal/70 leading-relaxed" style={{ fontFamily: 'Italiana, serif', fontSize: '54px' }}>
              The Starter Pack is a guided entry point into the <strong>Soul → Systems → AI™</strong> journey. It helps you slow down, get honest about where you are, and begin building from clarity instead of pressure.
            </p>
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-base">{error}</div>
            )}
          </div>
        </div>
      </div>

      {/* ── What This Is ── */}
      <section className="container max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-6" style={{ fontFamily: 'Marcellus, serif', fontSize: '79px', color: '#2A2A2A' }}>What This Is</h2>
        <p className="text-center text-warmCharcoal/80 mb-8" style={{ fontFamily: 'Italiana, serif', fontSize: '54px' }}>
          A simple, structured starting place designed to help you:
        </p>
        <ul className="space-y-3 text-base sm:text-lg text-warmCharcoal/80 max-w-xl mx-auto">
          <li className="flex items-start gap-3" style={{ fontFamily: 'Italiana, serif', fontSize: '35px' }}><span className="text-lavenderViolet mt-1">✦</span> Get clear on who you are right now</li>
          <li className="flex items-start gap-3" style={{ fontFamily: 'Italiana, serif', fontSize: '35px' }}><span className="text-lavenderViolet mt-1">✦</span> Understand what matters most in this season</li>
          <li className="flex items-start gap-3" style={{ fontFamily: 'Italiana, serif', fontSize: '35px' }}><span className="text-lavenderViolet mt-1">✦</span> Identify where you feel stuck, scattered, or uncertain</li>
          <li className="flex items-start gap-3" style={{ fontFamily: 'Italiana, serif', fontSize: '35px' }}><span className="text-lavenderViolet mt-1">✦</span> Begin moving forward with intention</li>
        </ul>
        <p className="text-center mt-8 text-base text-warmCharcoal/60 italic">
          <span style={{ fontFamily: 'Italiana, serif', fontSize: '35px' }}>This is not a course. It's a starting point.</span>
        </p>
      </section>

      {/* ── What You'll Receive ── */}
      <section className="bg-gradient-to-b from-white to-lavenderViolet/5 py-16">
        <div className="container max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ fontFamily: 'Marcellus, serif', fontSize: '79px', color: '#2A2A2A' }}>What You'll Receive</h2>

          <div className="grid gap-8 sm:grid-cols-2">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl shadow-sm border border-lavenderViolet/10 p-6 sm:p-8">
              <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: 'Marcellus, serif', fontSize: '54px', color: '#2A2A2A' }}>Clarity Check Experience</h3>
              <p className="text-base text-warmCharcoal/70 mb-4">A guided reflection that helps you see your current life and direction more clearly.</p>
              <p className="text-sm font-medium text-warmCharcoal/60 mb-2">You'll explore:</p>
              <ul className="space-y-2 text-sm text-warmCharcoal/70">
                <li className="flex items-start gap-2"><span className="text-softGold">•</span> Where your energy is going</li>
                <li className="flex items-start gap-2"><span className="text-softGold">•</span> What feels aligned vs. misaligned</li>
                <li className="flex items-start gap-2"><span className="text-softGold">•</span> What you're carrying that may no longer fit</li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl shadow-sm border border-lavenderViolet/10 p-6 sm:p-8">
              <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: 'Marcellus, serif', fontSize: '54px', color: '#2A2A2A' }}>Purpose Reflection Prompts</h3>
              <p className="text-base text-warmCharcoal/70 mb-4">Simple, thoughtful prompts that help you slow down and listen inward.</p>
              <p className="text-sm font-medium text-warmCharcoal/60 mb-2">Designed to help you:</p>
              <ul className="space-y-2 text-sm text-warmCharcoal/70">
                <li className="flex items-start gap-2"><span className="text-softGold">•</span> Notice patterns in your life</li>
                <li className="flex items-start gap-2"><span className="text-softGold">•</span> Recognize what keeps calling you</li>
                <li className="flex items-start gap-2"><span className="text-softGold">•</span> Put language to what you've been feeling</li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl shadow-sm border border-lavenderViolet/10 p-6 sm:p-8">
              <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: 'Marcellus, serif', fontSize: '54px', color: '#2A2A2A' }}>Personal Insight Snapshot</h3>
              <p className="text-base text-warmCharcoal/70 mb-4">A grounded look at where you are right now — not who you "should" be.</p>
              <p className="text-sm font-medium text-warmCharcoal/60 mb-2">This helps you:</p>
              <ul className="space-y-2 text-sm text-warmCharcoal/70">
                <li className="flex items-start gap-2"><span className="text-softGold">•</span> Name your current season</li>
                <li className="flex items-start gap-2"><span className="text-softGold">•</span> See your strengths more clearly</li>
                <li className="flex items-start gap-2"><span className="text-softGold">•</span> Identify your next small step</li>
              </ul>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-2xl shadow-sm border border-lavenderViolet/10 p-6 sm:p-8">
              <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: 'Marcellus, serif', fontSize: '54px', color: '#2A2A2A' }}>Gentle Direction Forward</h3>
              <p className="text-base text-warmCharcoal/70 mb-4">Once you complete the Starter Pack, you'll have a clearer sense of:</p>
              <ul className="space-y-2 text-sm text-warmCharcoal/70">
                <li className="flex items-start gap-2"><span className="text-softGold">•</span> What you want to build</li>
                <li className="flex items-start gap-2"><span className="text-softGold">•</span> What needs healing or attention</li>
                <li className="flex items-start gap-2"><span className="text-softGold">•</span> Whether you're ready to go deeper</li>
              </ul>
              <p className="mt-4 text-sm text-warmCharcoal/60 italic">From there, you can move into the next stage when the timing feels right.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Who This Is For / What This Is Not ── */}
      <section className="container max-w-4xl mx-auto px-6 py-16">
        <div className="grid gap-12 sm:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Marcellus, serif', fontSize: '79px', color: '#2A2A2A' }}>Who This Is For</h2>
            <p className="text-base text-warmCharcoal/70 mb-4">This is for you if:</p>
            <ul className="space-y-3 text-base text-warmCharcoal/70">
              <li className="flex items-start gap-3"><span className="text-lavenderViolet">✦</span> You feel stuck but can't explain why</li>
              <li className="flex items-start gap-3"><span className="text-lavenderViolet">✦</span> You have ideas but no clear direction</li>
              <li className="flex items-start gap-3"><span className="text-lavenderViolet">✦</span> You've been pouring into others and lost focus on yourself</li>
              <li className="flex items-start gap-3"><span className="text-lavenderViolet">✦</span> You're ready for clarity, not overwhelm</li>
              <li className="flex items-start gap-3"><span className="text-lavenderViolet">✦</span> You want a starting point that feels safe and grounded</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Marcellus, serif', fontSize: '79px', color: '#2A2A2A' }}>What This Is Not</h2>
            <ul className="space-y-3 text-base text-warmCharcoal/70">
              <li className="flex items-start gap-3"><span className="text-salmonPeach">✕</span> Not a personality test</li>
              <li className="flex items-start gap-3"><span className="text-salmonPeach">✕</span> Not a hustle plan</li>
              <li className="flex items-start gap-3"><span className="text-salmonPeach">✕</span> Not a pressure-filled transformation program</li>
            </ul>
            <p className="mt-6 text-lg font-italiana text-warmCharcoal/60 italic">It's a calm beginning.</p>
          </div>
        </div>
      </section>

      {/* ── Your Investment / CTA ── */}
      <section className="bg-gradient-to-br from-lavenderViolet/5 via-transparent to-softGold/5 py-20">
        <div className="container max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Marcellus, serif', fontSize: '79px', color: '#2A2A2A' }}>Your Investment</h2>
          <p className="text-xl text-warmCharcoal/80 mb-2">Starter Pack — <strong>$27</strong> <span className="text-base text-warmCharcoal/60">(one-time)</span></p>
          <p className="text-base text-warmCharcoal/60 mb-8">A small step that opens the door to deeper clarity.</p>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="px-8 py-4 rounded-full font-marcellus text-white text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            style={{ background: 'linear-gradient(135deg, #9C88FF, #E6C87C)', fontSize: '79px', fontFamily: 'Marcellus, serif' }}
            style={{ background: 'linear-gradient(135deg, #9C88FF, #E6C87C)' }}
          >
            {loading ? 'Starting checkout…' : 'Start with the Starter Pack'}
          </button>

          <p className="mt-4 text-sm text-warmCharcoal/50">
            Not ready? <Link href="/clarity-check" className="underline text-lavenderViolet">Try the free Clarity Check first</Link>
          </p>

          <p className="mt-2 text-sm text-warmCharcoal/50">
            Already purchased? <Link href="/login?next=/starter-pack" className="underline text-lavenderViolet">Sign in to access your Starter Pack</Link>
          </p>
        </div>
      </section>

      {/* ── Where This Leads ── */}
      <section className="container max-w-3xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Marcellus, serif', fontSize: '79px', color: '#2A2A2A' }}>Where This Leads</h2>
        <p className="text-base text-warmCharcoal/70 mb-8">
          The Starter Pack is the entry point into the iPurpose path.<br />
          From here, you may choose to continue into:
        </p>
        <div className="grid gap-4 sm:grid-cols-3 text-left">
          <div className="p-5 rounded-xl border border-lavenderViolet/10 bg-white">
            <h3 className="font-semibold text-base mb-1" style={{ fontFamily: 'Marcellus, serif', fontSize: '54px', color: '#2A2A2A' }}>AI Blueprint</h3>
            <p className="text-sm text-warmCharcoal/60">For learning how to use AI with intention</p>
          </div>
          <div className="p-5 rounded-xl border border-lavenderViolet/10 bg-white">
            <h3 className="font-semibold text-base mb-1" style={{ fontFamily: 'Marcellus, serif', fontSize: '54px', color: '#2A2A2A' }}>Deepen</h3>
            <p className="text-sm text-warmCharcoal/60">For ongoing inner work and alignment</p>
          </div>
          <div className="p-5 rounded-xl border border-lavenderViolet/10 bg-white">
            <h3 className="font-semibold text-base mb-1" style={{ fontFamily: 'Marcellus, serif', fontSize: '54px', color: '#2A2A2A' }}>Accelerator</h3>
            <p className="text-sm text-warmCharcoal/60">For building systems, offers, and income around your purpose</p>
          </div>
        </div>
        <p className="mt-6 text-sm text-warmCharcoal/50 italic">
          There's no pressure to move forward. You'll know when you're ready.
        </p>
      </section>

      {/* ── Final Invitation ── */}
      <section className="bg-gradient-to-b from-white to-lavenderViolet/5 py-20">
        <div className="container max-w-2xl mx-auto px-6 text-center">
          <p className="text-lg text-warmCharcoal/70 mb-2">If you've been waiting for the "right time" to get clear…</p>
          <p className="text-2xl font-italiana text-warmCharcoal/90 mb-8">This is a gentle place to begin.</p>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="px-8 py-4 rounded-full font-marcellus text-white text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            style={{ background: 'linear-gradient(135deg, #9C88FF, #E6C87C)', fontSize: '79px', fontFamily: 'Marcellus, serif' }}
            style={{ background: 'linear-gradient(135deg, #9C88FF, #E6C87C)' }}
          >
            {loading ? 'Starting checkout…' : 'Start with the Starter Pack'}
          </button>

          <p className="mt-6 text-sm text-warmCharcoal/50">
            Already purchased? <Link href="/login?next=/starter-pack" className="underline text-lavenderViolet">Sign in to access your Starter Pack</Link>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

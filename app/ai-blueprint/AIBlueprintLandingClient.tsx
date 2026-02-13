'use client';

import { useState } from 'react';
import Link from 'next/link';
import PublicHeader from '../components/PublicHeader';
import Footer from '../components/Footer';

export default function AIBlueprintLandingClient() {
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
    <div className="relative z-10 min-h-screen bg-white">
      <PublicHeader />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-lavenderViolet/10 via-transparent to-salmonPeach/10">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32">
          <section 
            className="relative text-center space-y-4 sm:space-y-6 py-16 sm:py-24 px-4 sm:px-6 rounded-2xl overflow-hidden mb-6"
            style={{
              backgroundImage: 'url(/images/cosmic-timetraveler-XPraChyTx68-unsplash.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/50"></div>
            
            <h1 className="heading-hero mb-6 text-white relative z-10 text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
              iPurpose<span style={{ fontSize: '0.5em', verticalAlign: 'super' }}>™</span> Blueprint
            </h1>
            <p className="text-white relative z-10 font-italiana px-4 sm:px-6 py-2 sm:py-3 rounded-lg" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', color: '#FFFFFF', fontSize: '55px' }}>
              Design your purpose-aligned systems with AI
            </p>
          </section>
          <div className="text-center">
            <p className="text-warmCharcoal/80 mb-6 sm:mb-8 text-[45px] text-center">
              Use AI without losing your voice, values, or peace.
            </p>
            <p className="text-warmCharcoal/70 mb-8 sm:mb-12 max-w-2xl mx-auto text-[45px] text-center">
              A practical, beginner-friendly guide to help you integrate AI into your workflow ethically—so you can plan, write, organize, and create with more ease.
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
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-24">
        <div className="flex items-center justify-center gap-3 w-full max-w-md mx-auto mb-6" aria-hidden="true">
          <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #9C88FF, transparent)' }}></div>
          <span style={{ fontSize: '20px', color: '#9C88FF' }}>✦</span>
          <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #9C88FF, transparent)' }}></div>
        </div>
        <h2 className="text-[55px] font-marcellus text-warmCharcoal mb-12 text-center">
          What You'll Receive
        </h2>
        <div className="space-y-8">
          <div className="p-4 sm:p-6 bg-gradient-to-br from-lavenderViolet/5 to-transparent rounded-lg border border-lavenderViolet/20 text-center">
            <h3 className="text-[45px] font-marcellus text-warmCharcoal mb-2 text-center">
              AI Readiness Assessment
            </h3>
            <p className="text-warmCharcoal/70 text-[45px] text-center">
              Know exactly where you stand with AI — no judgment, just clarity. Identify your comfort level, hesitations, and what excites you most.
            </p>
          </div>
          <div className="p-4 sm:p-6 bg-gradient-to-br from-salmonPeach/5 to-transparent rounded-lg border border-salmonPeach/20 text-center">
            <h3 className="text-[45px] font-marcellus text-warmCharcoal mb-2 text-center">
              Your Personal Values Filter
            </h3>
            <p className="text-warmCharcoal/70 text-[45px] text-center">
              Define what stays human and what AI can support. Set clear boundaries so you never lose your voice or integrity.
            </p>
          </div>
          <div className="p-4 sm:p-6 bg-gradient-to-br from-indigoDeep/5 to-transparent rounded-lg border border-indigoDeep/20 text-center">
            <h3 className="text-[45px] font-marcellus text-warmCharcoal mb-2 text-center">
              Ready-to-Use Prompt Library
            </h3>
            <p className="text-warmCharcoal/70 text-[45px] text-center">
              Categorized prompts for clarity, content, planning, and messaging — designed for your actual projects. Try them, then write your own.
            </p>
          </div>
          <div className="p-4 sm:p-6 bg-gradient-to-br from-softGold/5 to-transparent rounded-lg border border-softGold/20 text-center">
            <h3 className="text-[45px] font-marcellus text-warmCharcoal mb-2 text-center">
              AI Workflow Map + Ethical Guardrails
            </h3>
            <p className="text-warmCharcoal/70 text-[45px] text-center">
              Map every part of your work to decide what AI handles vs. what stays human. Then write your personal AI ethics agreement.
            </p>
          </div>
          <div className="p-4 sm:p-6 bg-gradient-to-br from-lavenderViolet/10 to-indigoDeep/5 rounded-lg border border-indigoDeep/20 text-center">
            <h3 className="text-[45px] font-marcellus text-warmCharcoal mb-2 text-center">
              🔓 AI Tools Studio Access
            </h3>
            <p className="text-warmCharcoal/70 text-[45px] text-center">
              Put your Blueprint into action. Get access to the iPurpose AI Tools Studio — a live playground for content creation, brainstorming, and strategic writing.
            </p>
          </div>
        </div>
      </div>

      {/* Who It's For */}
      <div className="bg-gradient-to-br from-lavenderViolet/5 via-transparent to-salmonPeach/5">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-24">
          <div className="flex items-center justify-center gap-3 w-full max-w-md mx-auto mb-6" aria-hidden="true">
            <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #9C88FF, transparent)' }}></div>
            <span style={{ fontSize: '20px', color: '#9C88FF' }}>✦</span>
            <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #9C88FF, transparent)' }}></div>
          </div>
          <h2 className="text-[55px] font-marcellus text-warmCharcoal mb-12 text-center">
            Who It's For
          </h2>
          <div className="space-y-4 text-warmCharcoal/80 text-[45px] text-center">
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
        <div className="flex items-center justify-center gap-3 w-full max-w-md mx-auto mb-6" aria-hidden="true">
          <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #9C88FF, transparent)' }}></div>
          <span style={{ fontSize: '20px', color: '#9C88FF' }}>✦</span>
          <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #9C88FF, transparent)' }}></div>
        </div>
        <h2 className="text-[55px] font-marcellus text-warmCharcoal mb-12 text-center">
          FAQ
        </h2>
        <div className="space-y-8 text-center">
          <div className="space-y-2">
            <h3 className="text-[45px] font-marcellus text-warmCharcoal mb-2 text-center">
              Do I need ChatGPT Plus or any paid tools?
            </h3>
            <p className="text-warmCharcoal/70 text-[45px] text-center">
              No. The workbook and prompts work with free versions of popular AI tools. You also get access to the iPurpose AI Tools Studio — no extra subscriptions needed.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-[45px] font-marcellus text-warmCharcoal mb-2 text-center">
              Is this a full course?
            </h3>
            <p className="text-warmCharcoal/70 text-[45px] text-center">
              No. It's an interactive workbook with 5 guided sections you can complete in about an hour. Plus access to AI tools you can use anytime.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-[45px] font-marcellus text-warmCharcoal mb-2 text-center">
              Can I come back and update my answers?
            </h3>
            <p className="text-warmCharcoal/70 text-[45px] text-center">
              Yes! Your workbook auto-saves as you go. Come back anytime to refine your values, update your workflow map, or try new prompts.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-[45px] font-marcellus text-warmCharcoal mb-2 text-center">
              Can I download or print my Blueprint?
            </h3>
            <p className="text-warmCharcoal/70 text-[45px] text-center">
              Yes. When you complete the workbook, you can download a beautifully formatted PDF of your entire Blueprint to keep forever.
            </p>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-br from-lavenderViolet/10 via-transparent to-salmonPeach/10">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-24">
          <div className="flex items-center justify-center gap-3 w-full max-w-md mx-auto mb-6" aria-hidden="true">
            <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #9C88FF, transparent)' }}></div>
            <span style={{ fontSize: '20px', color: '#9C88FF' }}>✦</span>
            <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #9C88FF, transparent)' }}></div>
          </div>
          <h2 className="text-[55px] font-marcellus text-warmCharcoal mb-6 sm:mb-8 text-center">
            Ready to Use AI With Intention?
          </h2>
          <p className="text-warmCharcoal/70 mb-8 sm:mb-12 max-w-2xl mx-auto text-[45px] text-center">
            Get your practical blueprint today.
          </p>
          <div className="space-y-3 sm:space-y-4 flex flex-col">
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-full font-marcellus text-white text-center hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0))', fontSize: '35px' }}
            >
              {loading ? 'Loading...' : 'Get the AI Blueprint — $47'}
            </button>
            <Link
              href="/starter-pack"
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-full font-marcellus text-white text-center hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(to right, #E6C87C, rgba(230, 200, 124, 0))', fontSize: '35px' }}
            >
              Start with Purpose First
            </Link>
            <p className="text-sm text-warmCharcoal/50 text-center mt-4">
              Already purchased? <Link href="/login?next=/ai-blueprint" className="underline text-lavenderViolet">Sign in to access your Blueprint</Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

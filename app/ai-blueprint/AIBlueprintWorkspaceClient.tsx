"use client";

import Link from 'next/link';
import PublicHeader from '../components/PublicHeader';
import Footer from '../components/Footer';
import AIBlueprintClient from './AIBlueprintClient';

export default function AIBlueprintWorkspace({ email, claimed }: { email?: string | null; claimed?: boolean }) {
  return (
    <div className="relative z-10 min-h-screen bg-white">
      <PublicHeader />

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-indigoDeep/10 via-transparent to-lavenderViolet/10">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32">
          <section
            className="relative text-center space-y-4 sm:space-y-6 py-16 sm:py-24 px-4 sm:px-6 rounded-2xl overflow-hidden mb-6"
            style={{
              backgroundImage: 'url(/images/cosmic-timetraveler-XPraChyTx68-unsplash.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/50" />
            <h1 className="heading-hero mb-4 text-white relative z-10 text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
              Your AI Blueprint
            </h1>
            <p className="relative z-10 font-italiana text-xl sm:text-2xl md:text-3xl px-4 sm:px-6 py-2 sm:py-3 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)', color: '#FFFFFF' }}>
              Use AI without losing your voice
            </p>
          </section>

          {claimed && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-center font-marcellus">
              ✦ AI Blueprint claimed — welcome! Your workbook is ready below.
            </div>
          )}

          {email && (
            <p className="text-center text-sm text-warmCharcoal/60 font-marcellus">
              Signed in as <strong>{email}</strong>
            </p>
          )}

          <p className="text-center text-base sm:text-lg text-warmCharcoal/70 mt-4 max-w-2xl mx-auto leading-relaxed">
            Work through each section to build your personal AI operating system — from readiness to ethical guardrails.
          </p>
        </div>
      </div>

      {/* ── Modules Overview ── */}
      <section className="container max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="bg-white rounded-2xl shadow-sm border border-indigoDeep/10 p-6 sm:p-8 flex flex-col">
            <div className="w-10 h-10 rounded-full bg-indigoDeep/10 flex items-center justify-center mb-4">
              <span className="text-indigoDeep font-bold">🧭</span>
            </div>
            <h2 className="text-lg font-semibold mb-2">Assess & Align</h2>
            <p className="text-sm text-warmCharcoal/70 mb-4 flex-1">Check your AI readiness and define your values filter for ethical AI use.</p>
            <a
              href="#begin"
              className="inline-block text-center px-5 py-3 rounded-full font-marcellus text-white text-sm hover:opacity-90 transition-opacity shadow-md"
              style={{ background: 'linear-gradient(135deg, #6B5B95, #9C88FF)' }}
            >
              Begin Blueprint
            </a>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-indigoDeep/10 p-6 sm:p-8 flex flex-col">
            <div className="w-10 h-10 rounded-full bg-lavenderViolet/10 flex items-center justify-center mb-4">
              <span className="text-lavenderViolet font-bold">✍️</span>
            </div>
            <h2 className="text-lg font-semibold mb-2">Practice & Prompt</h2>
            <p className="text-sm text-warmCharcoal/70 flex-1">Try real prompts for clarity, content, planning, and messaging — then write your own.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-indigoDeep/10 p-6 sm:p-8 flex flex-col">
            <div className="w-10 h-10 rounded-full bg-softGold/10 flex items-center justify-center mb-4">
              <span className="text-softGold font-bold">🤖</span>
            </div>
            <h2 className="text-lg font-semibold mb-2">Map & Commit</h2>
            <p className="text-sm text-warmCharcoal/70 flex-1">Build your AI workflow map and write your personal ethics agreement.</p>
          </div>
        </div>
      </section>

      {/* ── Interactive Workbook ── */}
      <section className="bg-gradient-to-b from-white to-indigoDeep/5 py-16">
        <div id="begin" className="container max-w-4xl mx-auto px-4 sm:px-6">
          <AIBlueprintClient />
        </div>
      </section>

      {/* ── AI Tools Unlock ── */}
      <section className="container max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-gradient-to-br from-indigoDeep/5 to-lavenderViolet/5 rounded-2xl border border-indigoDeep/10 p-6 sm:p-8 text-center">
          <span className="text-4xl mb-4 block">⚡</span>
          <h2 className="text-xl sm:text-2xl font-semibold font-marcellus mb-3">Your AI Tools Are Unlocked</h2>
          <p className="text-warmCharcoal/70 mb-6 max-w-lg mx-auto">
            As a Blueprint owner, you have access to the iPurpose AI Tools Studio. Use the prompts you practiced above in a live AI playground.
          </p>
          <Link
            href="/ai-tools"
            className="inline-block px-6 py-3 rounded-full font-marcellus text-white text-sm hover:opacity-90 transition-opacity shadow-md"
            style={{ background: 'linear-gradient(135deg, #6B5B95, #9C88FF)' }}
          >
            Open AI Tools Studio →
          </Link>
        </div>
      </section>

      {/* ── Support ── */}
      <section className="container max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
        <p className="text-sm text-warmCharcoal/50 font-marcellus">
          If you have trouble accessing the AI Blueprint,{' '}
          <Link href="/contact" className="underline text-lavenderViolet hover:text-indigoDeep transition-colors">
            contact support
          </Link>
          .
        </p>
      </section>

      <Footer />
    </div>
  );
}

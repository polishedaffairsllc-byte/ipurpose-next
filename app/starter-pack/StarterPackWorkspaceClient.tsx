"use client";

import Link from 'next/link';
import PublicHeader from '../components/PublicHeader';
import Footer from '../components/Footer';
import StarterPackClient from './StarterPackClient';

export default function StarterPackWorkspace({ email, claimed }: { email?: string | null; claimed?: boolean }) {
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
              <span style={{ fontFamily: 'Marcellus, serif', fontSize: '135px', color: '#FFFFFF' }}>Welcome to the Starter Pack</span>
            </h1>
            <p className="relative z-10 font-italiana text-xl sm:text-2xl md:text-3xl px-4 sm:px-6 py-2 sm:py-3 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)', color: '#FFFFFF' }}>
              <span style={{ fontFamily: 'Italiana, serif', fontSize: '112px', color: '#FFFFFF' }}>Your clarity journey begins now</span>
            </p>
          </section>

          {claimed && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-center font-marcellus">
              <span style={{ fontFamily: 'Marcellus, serif', fontSize: '54px', color: '#2A2A2A' }}>✦ Starter Pack claimed — welcome! Your workbook is ready below.</span>
            </div>
          )}

          {email && (
            <p className="text-center text-sm text-warmCharcoal/60 font-marcellus">
              <span style={{ fontFamily: 'Marcellus, serif', fontSize: '35px', color: '#2A2A2A' }}>Signed in as <strong>{email}</strong></span>
            </p>
          )}

          <p className="text-center text-base sm:text-lg text-warmCharcoal/70 mt-4 max-w-2xl mx-auto leading-relaxed">
            <span style={{ fontFamily: 'Marcellus, serif', fontSize: '54px', color: '#2A2A2A' }}>You now have access to the Starter Pack workspace. Use the materials below to begin.</span>
          </p>
        </div>
      </div>

      {/* ── Modules ── */}
      <section className="container max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid gap-6 sm:grid-cols-3">
          {/* Module 1 */}
          <div className="bg-white rounded-2xl shadow-sm border border-lavenderViolet/10 p-6 sm:p-8 flex flex-col">
            <div className="w-10 h-10 rounded-full bg-lavenderViolet/10 flex items-center justify-center mb-4">
              <span className="text-lavenderViolet font-bold">1</span>
            </div>
            <h2 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Marcellus, serif', fontSize: '79px', color: '#2A2A2A' }}>Reflection Prompts</h2>
            <p className="text-sm text-warmCharcoal/70 mb-4 flex-1">A guided set of questions to help you name what's most important.</p>
                     <p className="text-[2.5rem] sm:text-[3rem] text-warmCharcoal/70 mb-4 flex-1">A guided set of questions to help you name what's most important.</p>
                     <p className="text-[4rem] sm:text-[5rem] text-warmCharcoal/70 mb-4 flex-1">A guided set of questions to help you name what's most important.</p>
            <a
              href="#begin"
              className="inline-block text-center px-5 py-3 rounded-full font-marcellus text-white text-sm hover:opacity-90 transition-opacity shadow-md"
              style={{ background: 'linear-gradient(135deg, #9C88FF, #E6C87C)' }}
            >
              Begin Starter Pack
            </a>
          </div>

          {/* Module 2 */}
          <div className="bg-white rounded-2xl shadow-sm border border-lavenderViolet/10 p-6 sm:p-8 flex flex-col">
            <div className="w-10 h-10 rounded-full bg-softGold/10 flex items-center justify-center mb-4">
              <span className="text-softGold font-bold">2</span>
            </div>
            <h2 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Marcellus, serif', fontSize: '79px', color: '#2A2A2A' }}>Purpose Statement Framework</h2>
            <p className="text-sm text-warmCharcoal/70 flex-1">A short template and examples to craft a clear purpose statement.</p>
          </div>

          {/* Module 3 */}
          <div className="bg-white rounded-2xl shadow-sm border border-lavenderViolet/10 p-6 sm:p-8 flex flex-col">
            <div className="w-10 h-10 rounded-full bg-salmonPeach/10 flex items-center justify-center mb-4">
              <span className="text-salmonPeach font-bold">3</span>
            </div>
            <h2 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Marcellus, serif', fontSize: '79px', color: '#2A2A2A' }}>Simple Systems Map</h2>
            <p className="text-sm text-warmCharcoal/70 flex-1" style={{ fontSize: '54px', fontFamily: 'Marcellus, serif' }}>Visualize supports and drains so you can design for what sustains you.</p>
          </div>
        </div>
      </section>

      {/* ── Interactive Workbook ── */}
      <section className="bg-gradient-to-b from-white to-lavenderViolet/5 py-16">
        <div id="begin" className="container max-w-4xl mx-auto px-4 sm:px-6">
          <StarterPackClient />
        </div>
      </section>

      {/* ── Support ── */}
      <section className="container max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
        <p className="text-sm text-warmCharcoal/50 font-marcellus">
          If you have trouble accessing the Starter Pack,{' '}
          <Link href="/contact" className="underline text-lavenderViolet hover:text-indigoDeep transition-colors">
            contact support
          </Link>.
        </p>
      </section>

      <Footer />
    </div>
  );
}

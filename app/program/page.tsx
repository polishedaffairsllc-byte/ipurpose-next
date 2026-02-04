import { Metadata } from 'next';
import Link from 'next/link';
import PublicHeader from '../components/PublicHeader';
import Footer from '../components/Footer';
import ProgramEnrollButton from './ProgramEnrollButton';

export const metadata: Metadata = {
  title: 'iPurpose Accelerator™ — From Insight to Action',
  description: 'A guided cohort-based experience helping creators remove internal blocks and turn clarity into simple, structured steps using alignment, systems, and AI support.',
  openGraph: {
    title: 'iPurpose Accelerator™ — From Insight to Action',
    description: 'A guided cohort-based experience helping creators remove internal blocks and turn clarity into simple, structured steps using alignment, systems, and AI support.',
    type: 'website',
  },
  robots: 'index, follow',
};

export default function ProgramPage() {
  return (
    <div className="relative min-h-screen bg-white">
      {/* Public Header */}
      <PublicHeader />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-lavenderViolet/10 via-transparent to-salmonPeach/10">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-16 sm:py-20 md:py-32">
          <section 
            className="relative text-center space-y-4 sm:space-y-6 py-16 sm:py-24 px-4 sm:px-6 rounded-2xl overflow-hidden"
            style={{
              backgroundImage: 'url(/images/360_F_781098715_ieqRgf5DPUnTI9d3vqjmowMGQx2VS0rr.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/50"></div>
            
            <h1 className="heading-hero mb-6 text-white relative z-10 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
              iPurpose Accelerator™
            </h1>
            <p className="text-white relative z-10 font-italiana px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-lg sm:text-2xl md:text-3xl lg:text-4xl" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', color: '#FFFFFF' }}>
              Six weeks to clarify your purpose and build aligned systems
            </p>
          </section>
        </div>
      </div>

      {/* What You'll Get */}
      <div className="w-full px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <img 
          src="/images/program-page/ChatGPT Image Feb 4, 2026, 01_26_47 PM.png" 
          alt="What's Included" 
          className="w-full object-cover"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>

      {/* Decorative Divider */}
      <div className="flex items-center justify-center gap-4 py-8">
        <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #E6C87C, transparent)' }}></div>
        <span style={{ fontSize: '24px', color: '#E6C87C' }}>✦</span>
        <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #E6C87C, transparent)' }}></div>
      </div>

      {/* Outcomes */}
      <div className="bg-gradient-to-br from-softGold/10 via-transparent to-lavenderViolet/10 py-12 sm:py-16 md:py-20">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-marcellus text-warmCharcoal text-center mb-8 sm:mb-12" style={{ fontSize: '50px' }}>
            By the End, You'll Have Built:
          </h2>
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="font-marcellus text-warmCharcoal mb-2" style={{ fontSize: '40px' }}>A Defined Purpose & Priorities Statement</h3>
              <p className="text-warmCharcoal/75" style={{ fontSize: '40px' }}>A documented articulation of what you're building and why.</p>
            </div>
            <div className="text-center">
              <h3 className="font-marcellus text-warmCharcoal mb-2" style={{ fontSize: '40px' }}>Core Systems Aligned to Your Goals</h3>
              <p className="text-warmCharcoal/75" style={{ fontSize: '40px' }}>Workflows, processes, and strategy designed to support your direction.</p>
            </div>
            <div className="text-center">
              <h3 className="font-marcellus text-warmCharcoal mb-2" style={{ fontSize: '40px' }}>A Practical AI Usage Plan</h3>
              <p className="text-warmCharcoal/75" style={{ fontSize: '40px' }}>Clear guidelines for where and how AI supports your work.</p>
            </div>
            <div className="text-center">
              <h3 className="font-marcellus text-warmCharcoal mb-2" style={{ fontSize: '40px' }}>Peer Network</h3>
              <p className="text-warmCharcoal/75" style={{ fontSize: '40px' }}>A small cohort of thoughtful builders navigating similar challenges.</p>
            </div>
            <div className="text-center">
              <h3 className="font-marcellus text-warmCharcoal mb-2" style={{ fontSize: '40px' }}>A Defined Direction Forward</h3>
              <p className="text-warmCharcoal/75" style={{ fontSize: '40px' }}>Clear next steps based on the systems and decisions you've built.</p>
            </div>
            <div className="text-center">
              <h3 className="font-marcellus text-warmCharcoal mb-2" style={{ fontSize: '40px' }}>Clarity Blueprint</h3>
              <p className="text-warmCharcoal/75" style={{ fontSize: '40px' }}>A documented plan you'll reference for months to come.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Divider */}
      <div className="flex items-center justify-center gap-4 py-8">
        <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #9C88FF, transparent)' }}></div>
        <span style={{ fontSize: '24px', color: '#9C88FF' }}>✦</span>
        <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #9C88FF, transparent)' }}></div>
      </div>

      {/* Who It's For / Not For */}
      <div className="w-full px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <img 
          src="/images/program-page/ChatGPT Image Feb 4, 2026, 01_37_09 PM.png" 
          alt="Who This Program Is For" 
          className="w-full object-cover"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>

      {/* Format & Next Cohort */}
      <div className="bg-gradient-to-br from-lavenderViolet/5 via-transparent to-salmonPeach/5 py-20">
        <div className="container max-w-4xl mx-auto px-6">
          <h2 className="font-marcellus text-warmCharcoal text-center mb-12" style={{ fontSize: '50px' }}>
            Program Format & Cohorts
          </h2>
          <div className="space-y-6 text-warmCharcoal/75 mb-8 sm:mb-12 mx-auto max-w-2xl text-center" style={{ fontSize: '40px' }}>
            <p>
              <strong>Format:</strong> 6 weekly 90-minute group calls + asynchronous work between sessions. Totally online and cohort-based.
            </p>
            <p>
              <strong>Cohort Size:</strong> 8–12 people to keep it intimate and real.
            </p>
            <p>
              <strong>Next Cohort:</strong> Launching March 2026. Limited spots available.
            </p>
            <p>
              <strong>Time Commitment:</strong> ~3–4 hours per week (1.5 hours live + 1.5–2.5 hours self-guided work).
            </p>
          </div>
          <div className="bg-white/50 border border-lavenderViolet/20 rounded-2xl p-4 sm:p-6 md:p-8 text-center">
            <p className="text-warmCharcoal mb-4 sm:mb-6" style={{ fontSize: '40px' }}>
              Want to learn more before committing? Join our upcoming info session.
            </p>
            <Link
              href="/info-session"
              className="inline-block px-8 py-4 bg-lavenderViolet text-white rounded-full font-marcellus hover:bg-indigoDeep transition"
              style={{ fontSize: '40px' }}
            >
              Reserve Your Info Session Spot
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 text-center">
        <h2 className="font-marcellus text-warmCharcoal mb-4 sm:mb-6" style={{ fontSize: '50px' }}>
          Next Steps
        </h2>
        <p className="text-warmCharcoal/75 mb-8 sm:mb-12" style={{ fontSize: '40px' }}>
          Understand your fit through a clarity check, or attend an info session to ask questions about the program structure and community.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center flex-wrap">
          <ProgramEnrollButton />
          <Link
            href="/clarity-check"
            className="px-8 py-4 rounded-full font-marcellus text-white text-center hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0))', fontSize: '35px' }}
          >
            Take the Clarity Check
          </Link>
          <Link
            href="/info-session"
            className="px-8 py-4 rounded-full font-marcellus text-white text-center hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(to right, #E8967A, rgba(232, 150, 122, 0))', fontSize: '35px' }}
          >
            Join the Info Session
          </Link>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

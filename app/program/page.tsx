import { Metadata } from 'next';
import Link from 'next/link';
import FloatingLogo from '../components/FloatingLogo';
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
      {/* Floating Logo */}
      <FloatingLogo />
      
      {/* Public Header */}
      <PublicHeader />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-lavenderViolet/10 via-transparent to-salmonPeach/10">
        <div className="container max-w-6xl mx-auto px-[100px] py-32 text-center">
          <h1 className="heading-hero mb-6 text-warmCharcoal text-[72px] md:text-[96px] lg:text-[120px]">
            iPurpose Accelerator™
          </h1>
          <p className="text-3xl md:text-4xl lg:text-5xl text-warmCharcoal/80 mb-8">
            A cohort-based journey to clarify your purpose, build aligned systems, and expand through AI.
          </p>
          <p className="text-2xl md:text-3xl lg:text-4xl text-warmCharcoal/70">
            Small group. Live mentorship. Tangible outcomes.
          </p>
        </div>
      </div>

      {/* What You'll Get */}
      <div className="container max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-marcellus text-warmCharcoal mb-12 text-center">
          What's Included
        </h2>
        <div className="space-y-8 flex flex-col items-center">
          <div className="w-full max-w-2xl">
            <h3 className="text-3xl md:text-4xl font-marcellus text-warmCharcoal mb-2 text-center">Live Group Sessions</h3>
            <p className="text-xl md:text-2xl text-warmCharcoal/70 text-center">
              Six weeks of guided group calls with mentors and peers who understand your journey. Real conversations, not recordings.
            </p>
          </div>
          <div className="w-full max-w-2xl">
            <h3 className="text-3xl md:text-4xl font-marcellus text-warmCharcoal mb-2 text-center">Soul Work</h3>
            <p className="text-xl md:text-2xl text-warmCharcoal/70 text-center">
              Clarify your values, articulate what success means to you, and document your purpose framework. Reflection exercises + workbooks.
            </p>
          </div>
          <div className="w-full max-w-2xl">
            <h3 className="text-3xl md:text-4xl font-marcellus text-warmCharcoal mb-2 text-center">Systems Building</h3>
            <p className="text-xl md:text-2xl text-warmCharcoal/70 text-center">
              Design workflows, clarify your offer, and build aligned strategy. Templates, worksheets, and one-on-one guidance.
            </p>
          </div>
          <div className="w-full max-w-2xl">
            <h3 className="text-3xl md:text-4xl font-marcellus text-warmCharcoal mb-2 text-center">AI Integration</h3>
            <p className="text-xl md:text-2xl text-warmCharcoal/70 text-center">
              Learn where AI adds value without compromising your voice. Get access to iPurpose Mentor—an AI coach configured for your specific framework.
            </p>
          </div>
          <div className="w-full max-w-2xl">
            <h3 className="text-3xl md:text-4xl font-marcellus text-warmCharcoal mb-2 text-center">Community</h3>
            <p className="text-xl md:text-2xl text-warmCharcoal/70 text-center">
              Connect with 8–12 other thoughtful leaders. Accountability, support, and lasting relationships beyond the program.
            </p>
          </div>
          <div className="w-full max-w-2xl">
            <h3 className="text-3xl md:text-4xl font-marcellus text-warmCharcoal mb-2 text-center">Your Clarity Blueprint</h3>
            <p className="text-xl md:text-2xl text-warmCharcoal/70 text-center">
              Walk away with a documented clarity statement, strategic roadmap, and AI integration plan you can execute immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Outcomes */}
      <div className="bg-gradient-to-br from-softGold/10 via-transparent to-lavenderViolet/10 py-20">
        <div className="container max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-marcellus text-warmCharcoal text-center mb-12">
            By the End, You'll Have Built:
          </h2>
          <div className="space-y-6 flex flex-col items-center">
            <div className="flex gap-4 w-full max-w-2xl text-center justify-center">
              <span className="text-3xl flex-shrink-0">✓</span>
              <div>
                <h3 className="font-marcellus text-lg text-warmCharcoal mb-2">A Defined Purpose & Priorities Statement</h3>
                <p className="text-warmCharcoal/70 text-center" style={{ fontSize: '24px' }}>A documented articulation of what you're building and why.</p>
              </div>
            </div>
            <div className="flex gap-4 w-full max-w-2xl text-center justify-center">
              <span className="text-3xl flex-shrink-0">✓</span>
              <div>
                <h3 className="font-marcellus text-lg text-warmCharcoal mb-2">Core Systems Aligned to Your Goals</h3>
                <p className="text-warmCharcoal/70 text-center" style={{ fontSize: '24px' }}>Workflows, processes, and strategy designed to support your direction.</p>
              </div>
            </div>
            <div className="flex gap-4 w-full max-w-2xl text-center justify-center">
              <span className="text-3xl flex-shrink-0">✓</span>
              <div>
                <h3 className="font-marcellus text-lg text-warmCharcoal mb-2">A Practical AI Usage Plan</h3>
                <p className="text-warmCharcoal/70 text-center" style={{ fontSize: '24px' }}>Clear guidelines for where and how AI supports your work.</p>
              </div>
            </div>
            <div className="flex gap-4 w-full max-w-2xl text-center justify-center">
              <span className="text-3xl flex-shrink-0">✓</span>
              <div>
                <h3 className="font-marcellus text-lg text-warmCharcoal mb-2">Peer Network</h3>
                <p className="text-warmCharcoal/70 text-center" style={{ fontSize: '24px' }}>A small cohort of thoughtful builders navigating similar challenges.</p>
              </div>
            </div>
            <div className="flex gap-4 w-full max-w-2xl text-center justify-center">
              <span className="text-3xl flex-shrink-0">✓</span>
              <div>
                <h3 className="font-marcellus text-lg text-warmCharcoal mb-2">A Defined Direction Forward</h3>
                <p className="text-warmCharcoal/70 text-center" style={{ fontSize: '24px' }}>Clear next steps based on the systems and decisions you've built.</p>
              </div>
            </div>
            <div className="flex gap-4 w-full max-w-2xl text-center justify-center">
              <span className="text-3xl flex-shrink-0">✓</span>
              <div>
                <h3 className="font-marcellus text-lg text-warmCharcoal mb-2">Clarity Blueprint</h3>
                <p className="text-warmCharcoal/70 text-center" style={{ fontSize: '24px' }}>A documented plan you'll reference for months to come.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Who It's For / Not For */}
      <div className="container max-w-4xl mx-auto px-6 py-20">
        <div className="space-y-12 flex flex-col items-center">
          <div className="w-full max-w-2xl">
            <h3 className="text-3xl font-marcellus text-warmCharcoal mb-6 text-center">
              This Program Is For You If:
            </h3>
            <ul className="space-y-3">
              <li className="flex gap-3 text-warmCharcoal/75 text-center justify-center">
                <span className="text-lavenderViolet font-bold flex-shrink-0">✓</span>
                <span>You feel unclear about your next direction or priorities</span>
              </li>
              <li className="flex gap-3 text-warmCharcoal/75 text-center justify-center">
                <span className="text-lavenderViolet font-bold flex-shrink-0">✓</span>
                <span>You're successful but burned out</span>
              </li>
              <li className="flex gap-3 text-warmCharcoal/75 text-center justify-center">
                <span className="text-lavenderViolet font-bold flex-shrink-0">✓</span>
                <span>You want clarity before your next move</span>
              </li>
              <li className="flex gap-3 text-warmCharcoal/75 text-center justify-center">
                <span className="text-lavenderViolet font-bold flex-shrink-0">✓</span>
                <span>You're curious about AI but want to stay in control</span>
              </li>
              <li className="flex gap-3 text-warmCharcoal/75 text-center justify-center">
                <span className="text-lavenderViolet font-bold flex-shrink-0">✓</span>
                <span>You value reflection and real support (not hype)</span>
              </li>
            </ul>
          </div>
          <div className="w-full max-w-2xl">
            <h3 className="text-3xl font-marcellus text-warmCharcoal mb-6 text-center">
              This Program Is NOT For You If:
            </h3>
            <ul className="space-y-3">
              <li className="flex gap-3 text-warmCharcoal/75 text-center justify-center">
                <span className="text-salmonPeach font-bold flex-shrink-0">✗</span>
                <span>You're looking for quick fixes or productivity hacks</span>
              </li>
              <li className="flex gap-3 text-warmCharcoal/75 text-center justify-center">
                <span className="text-salmonPeach font-bold flex-shrink-0">✗</span>
                <span>You're not ready to do reflective work</span>
              </li>
              <li className="flex gap-3 text-warmCharcoal/75 text-center justify-center">
                <span className="text-salmonPeach font-bold flex-shrink-0">✗</span>
                <span>You prefer pre-recorded content over live community</span>
              </li>
              <li className="flex gap-3 text-warmCharcoal/75 text-center justify-center">
                <span className="text-salmonPeach font-bold flex-shrink-0">✗</span>
                <span>You're looking to scale at all costs</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Format & Next Cohort */}
      <div className="bg-gradient-to-br from-lavenderViolet/5 via-transparent to-salmonPeach/5 py-20">
        <div className="container max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-marcellus text-warmCharcoal text-center mb-12">
            Program Format & Cohorts
          </h2>
          <div className="space-y-6 text-warmCharcoal/75 mb-12 mx-auto max-w-2xl text-center" style={{ fontSize: '24px' }}>
            <p>
              <strong>Format:</strong> 6 weekly 90-minute group calls + asynchronous work between sessions. Totally online and cohort-based.
            </p>
            <p>
              <strong>Cohort Size:</strong> 8–12 people to keep it intimate and real.
            </p>
            <p>
              <strong>Next Cohort:</strong> Launching March 2026. Limited spots available. Early members get access to beta features and community pricing.
            </p>
            <p>
              <strong>Time Commitment:</strong> ~3–4 hours per week (1.5 hours live + 1.5–2.5 hours self-guided work).
            </p>
          </div>
          <div className="bg-white/50 border border-lavenderViolet/20 rounded-2xl p-8 text-center">
            <p className="text-xl text-warmCharcoal mb-6">
              Want to learn more before committing? Join our upcoming info session.
            </p>
            <Link
              href="/info-session"
              className="inline-block px-8 py-4 bg-lavenderViolet text-white rounded-full font-marcellus text-lg hover:bg-indigoDeep transition"
            >
              Reserve Your Info Session Spot
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-marcellus text-warmCharcoal mb-6">
          Next Steps
        </h2>
        <p className="text-lg text-warmCharcoal/75 mb-12">
          Understand your fit through a clarity check, or attend an info session to ask questions about the program structure and community.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
          <ProgramEnrollButton />
          <Link
            href="/clarity-check"
            className="px-8 py-4 rounded-full font-marcellus text-white text-center hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0))', fontSize: '24px' }}
          >
            Take the Clarity Check
          </Link>
          <Link
            href="/info-session"
            className="px-8 py-4 rounded-full font-marcellus text-white text-center hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(to right, #E8967A, rgba(232, 150, 122, 0))', fontSize: '24px' }}
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

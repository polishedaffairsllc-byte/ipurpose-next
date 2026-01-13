import { Metadata } from 'next';
import Button from '../components/Button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'iPurpose 6-Week Program | Build with Clarity',
  description: 'A guided 6-week journey to reconnect with your purpose, build aligned systems, and expand through AI. Cohort-based learning with live mentorship.',
};

export default function ProgramPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-lavenderViolet/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-marcellus text-2xl text-warmCharcoal hover:opacity-80 transition-opacity">
            iPurpose
          </Link>
          <div className="flex gap-4">
            <Button variant="primary" href="/login" size="sm">Login</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-lavenderViolet/10 via-transparent to-salmonPeach/10">
        <div className="container max-w-4xl mx-auto px-6 py-20 text-center">
          <h1 className="heading-hero mb-6 text-warmCharcoal">
            The 6-Week Program
          </h1>
          <p className="text-2xl text-warmCharcoal/80 mb-8">
            A cohort-based journey to clarify your purpose, build aligned systems, and expand through AI.
          </p>
          <p className="text-lg text-warmCharcoal/70">
            Small group. Live mentorship. Real transformation.
          </p>
        </div>
      </div>

      {/* What You'll Get */}
      <div className="container max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-marcellus text-warmCharcoal mb-12 text-center">
          What's Included
        </h2>
        <div className="space-y-8">
          <div className="border-l-4 border-lavenderViolet pl-6">
            <h3 className="text-2xl font-marcellus text-warmCharcoal mb-2">Live Group Sessions</h3>
            <p className="text-warmCharcoal/70 text-justify">
              Six weeks of guided group calls with mentors and peers who understand your journey. Real conversations, not recordings.
            </p>
          </div>
          <div className="border-l-4 border-lavenderViolet pl-6">
            <h3 className="text-2xl font-marcellus text-warmCharcoal mb-2">Soul Work</h3>
            <p className="text-warmCharcoal/70 text-justify">
              Reconnect with your purpose, clarify your values, and define what success truly means to you. Reflection frameworks + journaling.
            </p>
          </div>
          <div className="border-l-4 border-lavenderViolet pl-6">
            <h3 className="text-2xl font-marcellus text-warmCharcoal mb-2">Systems Building</h3>
            <p className="text-warmCharcoal/70 text-justify">
              Design workflows, clarify your offer, and build aligned strategy. Templates, worksheets, and one-on-one guidance.
            </p>
          </div>
          <div className="border-l-4 border-salmonPeach pl-6">
            <h3 className="text-2xl font-marcellus text-warmCharcoal mb-2">AI Integration</h3>
            <p className="text-warmCharcoal/70 text-justify">
              Learn to leverage AI without losing your voice. Get access to iPurpose Mentor—an AI coach trained on your framework.
            </p>
          </div>
          <div className="border-l-4 border-salmonPeach pl-6">
            <h3 className="text-2xl font-marcellus text-warmCharcoal mb-2">Community</h3>
            <p className="text-warmCharcoal/70 text-justify">
              Connect with 8–12 other thoughtful leaders. Accountability, support, and lasting relationships beyond the program.
            </p>
          </div>
          <div className="border-l-4 border-salmonPeach pl-6">
            <h3 className="text-2xl font-marcellus text-warmCharcoal mb-2">Your Clarity Blueprint</h3>
            <p className="text-warmCharcoal/70 text-justify">
              Walk away with a documented clarity statement, strategic roadmap, and AI integration plan you can execute immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Outcomes */}
      <div className="bg-gradient-to-br from-softGold/10 via-transparent to-lavenderViolet/10 py-20">
        <div className="container max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-marcellus text-warmCharcoal text-center mb-12">
            After 6 Weeks, You'll Have:
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <span className="text-3xl flex-shrink-0">✓</span>
              <div>
                <h3 className="font-marcellus text-lg text-warmCharcoal mb-2">Crystal-Clear Purpose</h3>
                <p className="text-warmCharcoal/70 text-justify">Know why you're building and what truly matters to you.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-3xl flex-shrink-0">✓</span>
              <div>
                <h3 className="font-marcellus text-lg text-warmCharcoal mb-2">Aligned Systems</h3>
                <p className="text-warmCharcoal/70 text-justify">Workflows, processes, and strategy that support your vision.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-3xl flex-shrink-0">✓</span>
              <div>
                <h3 className="font-marcellus text-lg text-warmCharcoal mb-2">AI Strategy</h3>
                <p className="text-warmCharcoal/70 text-justify">Know where and how to use AI without compromising your voice.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-3xl flex-shrink-0">✓</span>
              <div>
                <h3 className="font-marcellus text-lg text-warmCharcoal mb-2">Accountability Partners</h3>
                <p className="text-warmCharcoal/70 text-justify">A community of peers committed to the same transformation.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-3xl flex-shrink-0">✓</span>
              <div>
                <h3 className="font-marcellus text-lg text-warmCharcoal mb-2">Renewed Energy</h3>
                <p className="text-warmCharcoal/70 text-justify">Relief from burnout; confidence to move forward.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-3xl flex-shrink-0">✓</span>
              <div>
                <h3 className="font-marcellus text-lg text-warmCharcoal mb-2">Clarity Blueprint</h3>
                <p className="text-warmCharcoal/70 text-justify">A documented plan you'll reference for months to come.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Who It's For / Not For */}
      <div className="container max-w-4xl mx-auto px-6 py-20">
        <div className="space-y-12">
          <div>
            <h3 className="text-3xl font-marcellus text-warmCharcoal mb-6 text-center">
              This Program Is For You If:
            </h3>
            <ul className="space-y-3">
              <li className="flex gap-3 text-warmCharcoal/75 text-justify">
                <span className="text-lavenderViolet font-bold flex-shrink-0">✓</span>
                <span>You feel disconnected from your work or purpose</span>
              </li>
              <li className="flex gap-3 text-warmCharcoal/75 text-justify">
                <span className="text-lavenderViolet font-bold flex-shrink-0">✓</span>
                <span>You're successful but burned out</span>
              </li>
              <li className="flex gap-3 text-warmCharcoal/75 text-justify">
                <span className="text-lavenderViolet font-bold flex-shrink-0">✓</span>
                <span>You want clarity before your next move</span>
              </li>
              <li className="flex gap-3 text-warmCharcoal/75 text-justify">
                <span className="text-lavenderViolet font-bold flex-shrink-0">✓</span>
                <span>You're curious about AI but want to stay in control</span>
              </li>
              <li className="flex gap-3 text-warmCharcoal/75 text-justify">
                <span className="text-lavenderViolet font-bold flex-shrink-0">✓</span>
                <span>You value reflection and real support (not hype)</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-3xl font-marcellus text-warmCharcoal mb-6 text-center">
              This Program Is NOT For You If:
            </h3>
            <ul className="space-y-3">
              <li className="flex gap-3 text-warmCharcoal/75 text-justify">
                <span className="text-salmonPeach font-bold flex-shrink-0">✗</span>
                <span>You're looking for quick fixes or productivity hacks</span>
              </li>
              <li className="flex gap-3 text-warmCharcoal/75 text-justify">
                <span className="text-salmonPeach font-bold flex-shrink-0">✗</span>
                <span>You're not ready to do reflective work</span>
              </li>
              <li className="flex gap-3 text-warmCharcoal/75 text-justify">
                <span className="text-salmonPeach font-bold flex-shrink-0">✗</span>
                <span>You prefer pre-recorded content over live community</span>
              </li>
              <li className="flex gap-3 text-warmCharcoal/75 text-justify">
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
          <div className="space-y-6 text-warmCharcoal/75 text-lg mb-12">
            <p className="text-justify">
              <strong>Format:</strong> 6 weeks, with one 90-minute group call per week + asynchronous work between sessions. Totally online and cohort-based.
            </p>
            <p className="text-justify">
              <strong>Cohort Size:</strong> 8–12 people to keep it intimate and real.
            </p>
            <p className="text-justify">
              <strong>Next Cohort:</strong> Launching March 2026. Limited spots available. Early members get access to beta features and community pricing.
            </p>
            <p className="text-justify">
              <strong>Time Commitment:</strong> ~3–4 hours per week (1.5 hours live + 1.5–2.5 hours self-guided work).
            </p>
          </div>
          <div className="bg-white/50 border border-lavenderViolet/20 rounded-2xl p-8 text-center">
            <p className="text-xl text-warmCharcoal mb-6">
              Want to learn more before committing? Join our upcoming info session.
            </p>
            <Button size="lg" variant="primary" href="/info-session">
              Reserve Your Info Session Spot
            </Button>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-marcellus text-warmCharcoal mb-6">
          Ready to Reconnect and Clarify?
        </h2>
        <p className="text-lg text-warmCharcoal/75 mb-12">
          Start with a clarity check to see if you're a fit, or jump straight to the info session to ask questions live.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
          <Button size="lg" variant="primary" href="/clarity-check">
            Take the Clarity Check
          </Button>
          <Button size="lg" variant="primary" href="/info-session">
            Join the Info Session
          </Button>
        </div>
      </div>
    </div>
  );
}

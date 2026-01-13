import { Metadata } from 'next';
import Button from '../components/Button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Discover iPurpose | Build with Clarity',
  description: 'Discover how iPurpose helps visionary entrepreneurs reconnect to their purpose and build with clarity, without burnout.',
};

export default function DiscoverPage() {
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
            Reconnect to What Matters
          </h1>
          <p className="text-xl text-warmCharcoal/80 mb-12 leading-relaxed">
            iPurpose is designed for thoughtful, capable people who feel disconnected from their work or unclear about what they're building. We help you reconnect to your purpose, align your strategy, and build with clarity—without the burnout.
          </p>
        </div>
      </div>

      {/* Problem + Solution */}
      <div className="container max-w-5xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-16">
          {/* Problem */}
          <div className="space-y-6">
            <h2 className="text-4xl font-marcellus text-warmCharcoal">
              You're Not Alone
            </h2>
            <p className="text-warmCharcoal/75 text-lg">
              Many entrepreneurs and leaders start with clarity and passion, but over time they drift. The day-to-day pulls you in a hundred directions. You're working hard but feel disconnected from why you started.
            </p>
            <ul className="space-y-3 text-warmCharcoal/70">
              <li className="flex gap-3">
                <span className="text-salmonPeach font-bold">✓</span>
                <span>Unclear about your true purpose and values</span>
              </li>
              <li className="flex gap-3">
                <span className="text-salmonPeach font-bold">✓</span>
                <span>Overwhelmed by tasks but missing the bigger picture</span>
              </li>
              <li className="flex gap-3">
                <span className="text-salmonPeach font-bold">✓</span>
                <span>Feeling burned out despite "success"</span>
              </li>
              <li className="flex gap-3">
                <span className="text-salmonPeach font-bold">✓</span>
                <span>Ready for a different approach—not another productivity hack</span>
              </li>
            </ul>
          </div>

          {/* Solution */}
          <div className="space-y-6">
            <h2 className="text-4xl font-marcellus text-warmCharcoal">
              iPurpose Works Differently
            </h2>
            <p className="text-warmCharcoal/75 text-lg">
              We guide you through a proven framework that reconnects Soul, Systems, and AI—helping you clarify what matters, build aligned strategy, and leverage technology without losing yourself.
            </p>
            <ul className="space-y-3 text-warmCharcoal/70">
              <li className="flex gap-3">
                <span className="text-lavenderViolet font-bold">✦</span>
                <span><strong>Soul:</strong> Realign with your purpose and values</span>
              </li>
              <li className="flex gap-3">
                <span className="text-lavenderViolet font-bold">✦</span>
                <span><strong>Systems:</strong> Build clear strategy and workflows</span>
              </li>
              <li className="flex gap-3">
                <span className="text-lavenderViolet font-bold">✦</span>
                <span><strong>AI:</strong> Expand capacity without losing control</span>
              </li>
              <li className="flex gap-3">
                <span className="text-lavenderViolet font-bold">✦</span>
                <span>Calm, no-hype approach rooted in real transformation</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Why iPurpose */}
      <div className="bg-gradient-to-br from-softGold/10 via-transparent to-lavenderViolet/10 py-20">
        <div className="container max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-marcellus text-warmCharcoal text-center mb-12">
            What Makes iPurpose Different
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="text-5xl">🧭</div>
              <h3 className="text-xl font-marcellus text-warmCharcoal">Aligned, Not Just Aligned</h3>
              <p className="text-warmCharcoal/70">
                We start with your soul—your purpose and values—then build systems and leverage AI around that. No hype. No quick fixes.
              </p>
            </div>
            <div className="space-y-4">
              <div className="text-5xl">🤝</div>
              <h3 className="text-xl font-marcellus text-warmCharcoal">Guided by Real Mentors</h3>
              <p className="text-warmCharcoal/70">
                You get live group sessions, personalized support, and access to an AI coach that understands your framework.
              </p>
            </div>
            <div className="space-y-4">
              <div className="text-5xl">✨</div>
              <h3 className="text-xl font-marcellus text-warmCharcoal">Practical + Sustainable</h3>
              <p className="text-warmCharcoal/70">
                Real tools, real frameworks, real results. You'll walk away with clarity, strategy, and the confidence to keep going.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-marcellus text-warmCharcoal mb-6">
          Ready to Reconnect?
        </h2>
        <p className="text-lg text-warmCharcoal/75 mb-12">
          Start with a simple clarity check to see if iPurpose is right for you, or learn more about the 6-week program.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
          <Button size="lg" variant="primary" href="/clarity-check">
            Take the Clarity Check
          </Button>
          <Button size="lg" variant="primary" href="/program">
            Learn About the Program
          </Button>
        </div>
      </div>
    </div>
  );
}

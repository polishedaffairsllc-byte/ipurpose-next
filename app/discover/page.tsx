import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Discover iPurpose | Build With Clarity',
  description: 'iPurpose helps thoughtful, capable people who feel disconnected, tired, or unclear reconnect to what matters and build it with clarity.',
  openGraph: {
    title: 'Discover iPurpose | Build With Clarity',
    description: 'iPurpose helps thoughtful, capable people who feel disconnected, tired, or unclear reconnect to what matters and build it with clarity.',
    type: 'website',
  },
  robots: 'index, follow',
};

export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-lavenderViolet/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-warmCharcoal hover:opacity-80 transition-opacity">
            <span className="sr-only">Back to Home</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container max-w-4xl mx-auto px-6 py-20 space-y-20">
        
        {/* Hero */}
        <section className="text-center space-y-6">
          <h1 className="heading-hero mb-6 text-warmCharcoal">
            Discover iPurpose
          </h1>
          <p className="text-2xl text-warmCharcoal/80">
            If you feel disconnected, tired, or unclear about what you're building, iPurpose helps you reconnect to what matters and build it with clarity.
          </p>
        </section>

        {/* What iPurpose Is */}
        <section className="space-y-6">
          <h2 className="text-4xl font-marcellus text-warmCharcoal">
            What iPurpose is
          </h2>
          <p className="text-warmCharcoal/75" style={{ fontSize: '24px' }}>
            iPurpose is a clarity + alignment platform that helps thoughtful, capable people move from internal friction to clear direction—by integrating Soul (inner alignment), Systems (practical structure), and AI (gentle support).
          </p>
        </section>

        {/* Who It's For */}
        <section className="space-y-6">
          <h2 className="text-4xl font-marcellus text-warmCharcoal">
            Who it's for
          </h2>
          <ul className="space-y-4 text-warmCharcoal/75" style={{ fontSize: '24px' }}>
            <li className="flex gap-3">
              <span className="text-lavenderViolet font-bold">✓</span>
              <span>You're capable, but you feel scattered or stuck</span>
            </li>
            <li className="flex gap-3">
              <span className="text-lavenderViolet font-bold">✓</span>
              <span>You're building something, but it doesn't feel fully true</span>
            </li>
            <li className="flex gap-3">
              <span className="text-lavenderViolet font-bold">✓</span>
              <span>You want clarity without burnout</span>
            </li>
            <li className="flex gap-3">
              <span className="text-lavenderViolet font-bold">✓</span>
              <span>You want structure that supports your real life</span>
            </li>
          </ul>
        </section>

        {/* How It Works */}
        <section className="space-y-6">
          <h2 className="text-4xl font-marcellus text-warmCharcoal">
            How it works
          </h2>
          <ul className="space-y-4 text-warmCharcoal/75" style={{ fontSize: '24px' }}>
            <li className="flex gap-3">
              <span className="text-lavenderViolet font-bold">→</span>
              <span><strong>Soul:</strong> clarify what matters and what's misaligned</span>
            </li>
            <li className="flex gap-3">
              <span className="text-lavenderViolet font-bold">→</span>
              <span><strong>Systems:</strong> build simple structure for follow-through</span>
            </li>
            <li className="flex gap-3">
              <span className="text-lavenderViolet font-bold">→</span>
              <span><strong>AI:</strong> use guidance to stay consistent and supported</span>
            </li>
          </ul>
        </section>

        {/* Start Here */}
        <section className="space-y-8 bg-gradient-to-br from-lavenderViolet/5 to-salmonPeach/5 rounded-2xl p-8 border border-lavenderViolet/10">
          <h2 className="text-4xl font-marcellus text-warmCharcoal">
            Start here
          </h2>
          <div className="space-y-3">
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSdeqCKVGTFlVma5ws5cHIICSqU74dR6ZbpTzawj-Cx4_wcApQ/viewform?usp=sharing&ouid=108847680085116613841"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-gradient-to-r from-lavenderViolet to-indigoDeep text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg hover:opacity-90 transition-all text-center"
              style={{ fontSize: '24px' }}
            >
              Discover Your Soul iPurpose Alignment Type
            </a>
            <Link
              href="/program"
              className="block w-full bg-gradient-to-r from-salmonPeach to-warmCharcoal text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg hover:opacity-90 transition-all text-center"
              style={{ fontSize: '24px' }}
            >
              View the 6-Week Program
            </Link>
          </div>
          <Link href="/about" className="text-lavenderViolet hover:underline block text-center font-semibold" style={{ fontSize: '24px' }}>
            About iPurpose
          </Link>
        </section>

      </div>
    </div>
  );
}

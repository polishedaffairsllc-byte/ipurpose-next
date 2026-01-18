import { Metadata } from 'next';
import Link from 'next/link';
import FloatingLogo from '../components/FloatingLogo';
import PublicHeader from '../components/PublicHeader';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'Discover iPurpose — Soul, Systems, and Thoughtful AI',
  description: 'Explore the iPurpose approach: aligning inner clarity with practical systems and supportive AI to help creators build what truly matters.',
  openGraph: {
    title: 'Discover iPurpose — Soul, Systems, and Thoughtful AI',
    description: 'Explore the iPurpose approach: aligning inner clarity with practical systems and supportive AI to help creators build what truly matters.',
    type: 'website',
  },
  robots: 'index, follow',
};

export default function DiscoverPage() {
  return (
    <div className="relative min-h-screen bg-white">
      {/* Floating Logo */}
      <FloatingLogo />
      
      {/* Public Header */}
      <PublicHeader />
      
      {/* Main Content */}
      <div className="container max-w-4xl mx-auto px-6 py-20 space-y-20">
        
        {/* Hero */}
        <section 
          className="relative text-center space-y-6 py-24 px-6 rounded-2xl overflow-hidden"
          style={{
            backgroundImage: 'url(/images/sebastien-gabriel--IMlv9Jlb24-unsplash.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50"></div>
          
          <h1 className="heading-hero mb-6 text-white relative z-10">
            Discover iPurpose
          </h1>
          <p className="text-white relative z-10 font-italiana px-6 py-3 rounded-lg" style={{ fontSize: '48px', backgroundColor: 'rgba(0, 0, 0, 0.4)', color: '#FFFFFF' }}>
            Soul + Systems + AI
          </p>
        </section>

        {/* What iPurpose Is */}
        <section className="space-y-6">
          <h2 className="text-4xl font-marcellus text-warmCharcoal">
            What iPurpose is
          </h2>
          <p className="text-warmCharcoal/75" style={{ fontSize: '24px' }}>
            iPurpose is a framework for orienting yourself when what you're building no longer feels coherent.
          </p>
          <p className="text-warmCharcoal/75" style={{ fontSize: '24px' }}>
            It integrates inner alignment (Soul), practical structure (Systems), and supportive technology (AI) to help people make decisions that are both meaningful and sustainable.
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

        {/* This May Not Be For You */}
        <section className="space-y-6">
          <h2 className="text-4xl font-marcellus text-warmCharcoal">
            This may not be for you if…
          </h2>
          <ul className="space-y-4 text-warmCharcoal/75" style={{ fontSize: '24px' }}>
            <li className="flex gap-3">
              <span className="text-warmCharcoal/50 font-bold">✕</span>
              <span>You're looking for quick fixes or hype-driven motivation</span>
            </li>
            <li className="flex gap-3">
              <span className="text-warmCharcoal/50 font-bold">✕</span>
              <span>You want tactics without reflection</span>
            </li>
            <li className="flex gap-3">
              <span className="text-warmCharcoal/50 font-bold">✕</span>
              <span>You expect automation to replace personal responsibility</span>
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
              <span><strong>Soul:</strong> focuses on internal clarity and values</span>
            </li>
            <li className="flex gap-3">
              <span className="text-lavenderViolet font-bold">→</span>
              <span><strong>Systems:</strong> addresses structure, follow-through, and sustainability</span>
            </li>
            <li className="flex gap-3">
              <span className="text-lavenderViolet font-bold">→</span>
              <span><strong>AI:</strong> provides supportive guidance once clarity is established</span>
            </li>
          </ul>
        </section>

        {/* Start Here */}
        <section className="space-y-8 bg-gradient-to-br from-lavenderViolet/5 to-salmonPeach/5 rounded-2xl p-8 border border-lavenderViolet/10">
          <h2 className="font-marcellus text-warmCharcoal" style={{ fontSize: '48px' }}>
            Start here
          </h2>
          <div className="space-y-4 flex flex-col">
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSdeqCKVGTFlVma5ws5cHIICSqU74dR6ZbpTzawj-Cx4_wcApQ/viewform?usp=sharing&ouid=108847680085116613841"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-full font-marcellus text-white text-center hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0))', fontSize: '24px' }}
            >
              Discover Your Soul iPurpose Alignment Type
            </a>
            <Link
              href="/program"
              className="px-8 py-4 rounded-full font-marcellus text-white text-center hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(to right, #E8967A, rgba(232, 150, 122, 0))', fontSize: '24px' }}
            >
              View the iPurpose Accelerator
            </Link>
            <Link
              href="/about"
              className="px-8 py-4 rounded-full font-marcellus text-white text-center hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(to right, #5B4BA6, rgba(91, 75, 166, 0))', fontSize: '24px' }}
            >
              About iPurpose
            </Link>
          </div>
        </section>

      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

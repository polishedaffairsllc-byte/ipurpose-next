import { Metadata } from 'next';
import Link from 'next/link';
import FloatingLogo from '../components/FloatingLogo';
import PublicHeader from '../components/PublicHeader';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'Discover iPurpose™ — Soul, Systems, and Thoughtful AI',
  description: 'Explore the iPurpose™ approach: aligning inner clarity with practical systems and supportive AI to help creators build what truly matters.',
  openGraph: {
    title: 'Discover iPurpose™ — Soul, Systems, and Thoughtful AI',
    description: 'Explore the iPurpose™ approach: aligning inner clarity with practical systems and supportive AI to help creators build what truly matters.',
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
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 space-y-16 sm:space-y-20">
        
        {/* Hero */}
        <section 
          className="relative text-center space-y-4 sm:space-y-6 py-16 sm:py-24 px-4 sm:px-6 rounded-2xl overflow-hidden"
          style={{
            backgroundImage: 'url(/images/sebastien-gabriel--IMlv9Jlb24-unsplash.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50"></div>
          
          <h1 className="heading-hero mb-6 text-white relative z-10 text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
            Discover iPurpose™
          </h1>
          <p className="text-white relative z-10 font-italiana px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-lg sm:text-2xl md:text-3xl lg:text-4xl" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', color: '#FFFFFF' }}>
            Soul + Systems + AI™
          </p>
        </section>

        {/* What iPurpose Is */}
        <section className="space-y-4 sm:space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-marcellus text-warmCharcoal">
            What iPurpose is
          </h2>
          <p className="text-warmCharcoal/75 text-sm sm:text-base md:text-lg lg:text-xl">
            iPurpose is a framework for orienting yourself when what you're building no longer feels coherent.
          </p>
          <p className="text-warmCharcoal/75 text-sm sm:text-base md:text-lg lg:text-xl">
            It integrates inner alignment (Soul), practical structure (Systems), and supportive technology (AI) to help people make decisions that are both meaningful and sustainable.
          </p>
        </section>

        {/* Who It's For */}
        <section className="space-y-4 sm:space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-marcellus text-warmCharcoal">
            Who it's for
          </h2>
          <ul className="space-y-3 sm:space-y-4 text-warmCharcoal/75 text-sm sm:text-base md:text-lg lg:text-xl">
            <li className="flex gap-3">
              <span className="text-lavenderViolet font-bold flex-shrink-0">✓</span>
              <span>You're capable, but you feel scattered or stuck</span>
            </li>
            <li className="flex gap-3">
              <span className="text-lavenderViolet font-bold flex-shrink-0">✓</span>
              <span>You're building something, but it doesn't feel fully true — like the vision makes sense, yet something hasn't fully settled into place.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-lavenderViolet font-bold flex-shrink-0">✓</span>
              <span>You want clarity without burnout</span>
            </li>
            <li className="flex gap-3">
              <span className="text-lavenderViolet font-bold flex-shrink-0">✓</span>
              <span>You want structure that supports your real life</span>
            </li>
          </ul>
        </section>

        {/* This May Not Be For You */}
        <section className="space-y-4 sm:space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-marcellus text-warmCharcoal">
            This may not be for you if…
          </h2>
          <ul className="space-y-3 sm:space-y-4 text-warmCharcoal/75 text-sm sm:text-base md:text-lg lg:text-xl">
            <li className="flex gap-3">
              <span className="text-warmCharcoal/50 font-bold flex-shrink-0">✕</span>
              <span>You're looking for quick fixes or hype-driven motivation</span>
            </li>
            <li className="flex gap-3">
              <span className="text-warmCharcoal/50 font-bold flex-shrink-0">✕</span>
              <span>You want tactics without reflection</span>
            </li>
            <li className="flex gap-3">
              <span className="text-warmCharcoal/50 font-bold flex-shrink-0">✕</span>
              <span>You expect automation to replace personal responsibility</span>
            </li>
          </ul>
        </section>

        {/* How It Works */}
        <section className="space-y-4 sm:space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-marcellus text-warmCharcoal">
            How it works
          </h2>
          <ul className="space-y-3 sm:space-y-4 text-warmCharcoal/75 text-sm sm:text-base md:text-lg lg:text-xl">
            <li className="flex gap-3">
              <span className="text-lavenderViolet font-bold flex-shrink-0">→</span>
              <span><strong>Soul:</strong> focuses on internal clarity and values</span>
            </li>
            <li className="flex gap-3">
              <span className="text-lavenderViolet font-bold flex-shrink-0">→</span>
              <span><strong>Systems:</strong> addresses structure, follow-through, and sustainability</span>
            </li>
            <li className="flex gap-3">
              <span className="text-lavenderViolet font-bold flex-shrink-0">→</span>
              <span><strong>AI:</strong> provides supportive guidance once clarity is established</span>
            </li>
          </ul>
        </section>

        {/* Ready to Begin - Clarity Check Emphasis */}
        <section className="bg-gradient-to-r from-lavenderViolet/10 via-salmonPeach/5 to-lavenderViolet/10 rounded-2xl p-6 sm:p-8 md:p-10 border border-lavenderViolet/20">
          <div className="text-center space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-marcellus text-warmCharcoal">
              Ready to begin?
            </h2>
            <p className="text-warmCharcoal/75 text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mx-auto">
              Start with a 2-minute reflection to understand where you are right now.
            </p>
            <Link
              href="/clarity-check"
              className="inline-block px-8 sm:px-10 py-3 sm:py-4 rounded-full font-marcellus text-white hover:opacity-90 transition-opacity text-sm sm:text-base md:text-lg"
              style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0))' }}
            >
              Take the Clarity Check
            </Link>
          </div>
        </section>

        {/* Start Here */}
        <section className="space-y-6 sm:space-y-8 bg-gradient-to-br from-lavenderViolet/5 to-salmonPeach/5 rounded-2xl p-4 sm:p-6 md:p-8 border border-lavenderViolet/10">
          <h2 className="font-marcellus text-warmCharcoal text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
            Start here
          </h2>
          <div className="space-y-3 sm:space-y-4 flex flex-col">
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSdeqCKVGTFlVma5ws5cHIICSqU74dR6ZbpTzawj-Cx4_wcApQ/viewform?usp=sharing&ouid=108847680085116613841"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-full font-marcellus text-white text-center hover:opacity-90 transition-opacity text-sm sm:text-base md:text-lg"
              style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0))' }}
            >
              Discover Your Soul iPurpose Alignment Type
            </a>
            <Link
              href="/starter-pack"
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-full font-marcellus text-white text-center hover:opacity-90 transition-opacity text-sm sm:text-base md:text-lg"
              style={{ background: 'linear-gradient(to right, #D4A373, rgba(212, 163, 115, 0))' }}
            >
              Get the Starter Pack — $27
            </Link>
            <Link
              href="/ai-blueprint"
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-full font-marcellus text-white text-center hover:opacity-90 transition-opacity text-sm sm:text-base md:text-lg"
              style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0))' }}
            >
              Get the AI Blueprint — $47
            </Link>
            <Link
              href="/program"
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-full font-marcellus text-white text-center hover:opacity-90 transition-opacity text-sm sm:text-base md:text-lg"
              style={{ background: 'linear-gradient(to right, #E8967A, rgba(232, 150, 122, 0))' }}
            >
              Explore the iPurpose Accelerator
            </Link>
            <Link
              href="/about"
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-full font-marcellus text-white text-center hover:opacity-90 transition-opacity text-sm sm:text-base md:text-lg"
              style={{ background: 'linear-gradient(to right, #5B4BA6, rgba(91, 75, 166, 0))' }}
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

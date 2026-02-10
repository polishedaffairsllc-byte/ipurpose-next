import { Metadata } from 'next';
import Link from 'next/link';
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
      {/* Public Header */}
      <PublicHeader />
      
      {/* Main Content */}
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 space-y-16 sm:space-y-20 pb-0">
        
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
            Discover iPurpose<span style={{ fontSize: '0.3em', verticalAlign: 'super' }}>™</span>
          </h1>
          <div style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', display: 'flex', justifyContent: 'center' }}>
            <p className="text-white relative z-10 font-italiana px-4 sm:px-6 py-2 sm:py-3" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', color: '#FFFFFF', fontSize: '60px', width: '100%', textAlign: 'center' }}>
              Soul + Systems + AI<sup style={{ fontSize: '0.3em' }}>™</sup>
            </p>
          </div>
        </section>

        {/* Decorative Divider */}
        <div className="flex items-center justify-center gap-4 py-8">
          <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #9C88FF, transparent)' }}></div>
          <span style={{ fontSize: '24px', color: '#9C88FF' }}>✦</span>
          <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #9C88FF, transparent)' }}></div>
        </div>

        {/* What iPurpose Is */}
        <section className="bg-gradient-to-br from-lavenderViolet/5 to-transparent rounded-2xl p-8 sm:p-12 border border-lavenderViolet/10">
          <h2 className="font-marcellus text-warmCharcoal mb-6 text-center" style={{ fontSize: '50px' }}>
            What iPurpose is
          </h2>
          <div className="flex gap-8 items-center">
            <img 
              src="/images/discover-page/person-standing-on-path-by-water.jpg" 
              alt="Peaceful water and nature" 
              className="object-cover flex-shrink-0"
              style={{ width: '400px', height: '300px', marginRight: '52px' }}
            />
            <div className="space-y-4 sm:space-y-6 text-left">
              <p className="text-warmCharcoal/75" style={{ fontSize: '35px' }}>
                iPurpose is an orientation framework for moments when what you're building no longer feels coherent.
              </p>
              <p className="text-warmCharcoal/75" style={{ fontSize: '35px' }}>
                It's for people who are capable, thoughtful, and trying to do something meaningful—yet feel internally scattered, misaligned, or unsure how to move forward without burning themselves out.
              </p>
              <p className="text-warmCharcoal/75" style={{ fontSize: '35px' }}>
                iPurpose integrates three layers of development:
              </p>
              <p className="text-warmCharcoal/75" style={{ fontSize: '35px' }}>
                <strong>Soul</strong> — understanding who you are, what matters to you, and how you naturally move through the world
              </p>
              <p className="text-warmCharcoal/75" style={{ fontSize: '35px' }}>
                <strong>Systems</strong> — translating that clarity into structures, workflows, and decisions that are sustainable in real life
              </p>
              <p className="text-warmCharcoal/75" style={{ fontSize: '35px' }}>
                <strong>AI</strong> — offering supportive guidance that reinforces clarity rather than replacing personal responsibility
              </p>
              <p className="text-warmCharcoal/75" style={{ fontSize: '35px' }}>
                The goal isn't optimization or reinvention.<br />
              The goal is coherence—so the way you live, work, and build no longer contradicts who you are.
            </p>
            </div>
          </div>
        </section>
        
        {/* Decorative Divider */}
        <div className="flex items-center justify-center gap-4 py-8">
          <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #FCC4B7, transparent)' }}></div>
          <span style={{ fontSize: '24px', color: '#FCC4B7' }}>✦</span>
          <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #FCC4B7, transparent)' }}></div>
        </div>

        {/* Who It's For */}
        <section className="bg-gradient-to-br from-salmonPeach/5 to-transparent rounded-2xl p-8 sm:p-12 border border-salmonPeach/10">
          <h2 className="font-marcellus text-warmCharcoal mb-6 text-center" style={{ fontSize: '50px' }}>
            Who it's for
          </h2>
          <div className="flex gap-8 items-center">
            <div className="space-y-4 sm:space-y-6 text-left">
              <p className="text-warmCharcoal/75" style={{ fontSize: '35px' }}>
                iPurpose may be for you if:
              </p>
              <ul className="space-y-3 sm:space-y-4 text-warmCharcoal/75" style={{ fontSize: '35px', listStyle: 'none', padding: 0 }}>
                <li>You're building something, but it doesn't fully feel settled or true yet</li>
                <li>The vision makes sense, but your inner alignment hasn't quite caught up</li>
                <li>You want clarity without burnout</li>
                <li>You want structure that supports your actual life—not an idealized version of it</li>
              </ul>
              <p className="text-warmCharcoal/75" style={{ fontSize: '35px' }}>
              This work is especially supportive for people who want to act ethically, live with intention, and become better stewards of their time, energy, and responsibilities.
            </p>
            </div>
            <img 
              src="/images/discover-page/man-on-rocky-shore-gazing-at-ocean-sunset-horizon..jpg" 
              alt="Ripples in water" 
              className="object-cover flex-shrink-0"
              style={{ width: '400px', height: '300px', marginLeft: '52px' }}
            />
          </div>
        </section>        {/* Decorative Divider */}
        <div className="flex items-center justify-center gap-4 py-8">
          <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #4B4E6D, transparent)' }}></div>
          <span style={{ fontSize: '24px', color: '#4B4E6D' }}>✦</span>
          <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #4B4E6D, transparent)' }}></div>
        </div>

        {/* This May Not Be For You */}
        <section className="bg-gradient-to-br from-warmCharcoal/5 to-transparent rounded-2xl p-8 sm:p-12 border border-warmCharcoal/10">
          <h2 className="font-marcellus text-warmCharcoal mb-6 text-center" style={{ fontSize: '50px' }}>
            This may not be for you if…
          </h2>
          <div className="flex gap-8 items-center">
            <img 
              src="/images/discover-page/DSC01432.webp" 
              alt="Compass in water" 
              className="object-cover flex-shrink-0"
              style={{ width: '400px', height: '300px', marginRight: '52px' }}
            />
            <div className="space-y-4 sm:space-y-6 text-left">
              <ul className="space-y-3 sm:space-y-4 text-warmCharcoal/75 inline-block" style={{ fontSize: '35px', listStyle: 'none', padding: 0 }}>
                <li>You're looking for quick fixes, hype, or constant motivation</li>
                <li>You want tactics without reflection</li>
                <li>You expect automation, systems, or AI to replace self-awareness or accountability</li>
              </ul>
              <p className="text-warmCharcoal/75" style={{ fontSize: '35px' }}>
              iPurpose is designed for people who want to do the right thing—starting with themselves.
            </p>
            </div>
          </div>
        </section>        {/* Decorative Divider */}
        <div className="flex items-center justify-center gap-4 py-8">
          <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #88B04B, transparent)' }}></div>
          <span style={{ fontSize: '24px', color: '#88B04B' }}>✦</span>
          <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #88B04B, transparent)' }}></div>
        </div>

        {/* How It Works */}
        <section className="bg-gradient-to-br from-green-50 to-transparent rounded-2xl p-8 sm:p-12 border border-green-100">
          <h2 className="font-marcellus text-warmCharcoal mb-6 text-center" style={{ fontSize: '50px' }}>
            How it works
          </h2>
          <div className="flex gap-8 items-center justify-between">
            <div className="space-y-4 sm:space-y-6 text-left flex-1">
              <ul className="space-y-3 sm:space-y-4 text-warmCharcoal/75 inline-block" style={{ fontSize: '35px', listStyle: 'none', padding: 0 }}>
                <li><strong>Soul</strong> helps you clarify identity, values, and internal alignment</li>
                <li><strong>Systems</strong> helps you apply that clarity through structure, follow-through, and practical design</li>
                <li><strong>AI</strong> provides support and perspective once clarity is established—not before</li>
              </ul>
              <p className="text-warmCharcoal/75" style={{ fontSize: '35px' }}>
              Together, these layers help you move from self-understanding to ethical, sustainable action.
            </p>
            </div>
            <img 
              src="/images/discover-page/W6RS98jvVvjPVRrRAl0m09G1C1AGTDLnQvYa60BaCRlXEVvHLZu0LZPRK6mD2BDaHgHFSDCPSJsCAUDyH4EHulYiXXmMJ7My_TMuJigaG0E.jpeg" 
              alt="Alignment and clarity" 
              className="object-cover flex-shrink-0 ml-auto"
              style={{ width: '400px', height: '300px' }}
            />
          </div>
        </section>        {/* Decorative Divider */}
        <div className="flex items-center justify-center gap-4 py-8">
          <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #E6C87C, transparent)' }}></div>
          <span style={{ fontSize: '24px', color: '#E6C87C' }}>✦</span>
          <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #E6C87C, transparent)' }}></div>
        </div>

        {/* Start Here */}
        <section className="space-y-6 sm:space-y-8 bg-gradient-to-br from-lavenderViolet/5 to-salmonPeach/5 rounded-2xl p-4 sm:p-6 md:p-8 border border-lavenderViolet/10 mb-0">
          <div className="space-y-3 sm:space-y-4 flex flex-col">
            <Link
              href="/clarity-check"
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-full font-marcellus text-white text-center hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0))', fontSize: '35px' }}
            >
              Take the Clarity Check
            </Link>
            <Link
              href="/starter-pack"
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-full font-marcellus text-white text-center hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(to right, #E6C87C, rgba(230, 200, 124, 0))', fontSize: '35px' }}
            >
              Get the Starter Pack — $27
            </Link>
            <Link
              href="/ai-blueprint"
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-full font-marcellus text-white text-center hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0))', fontSize: '35px' }}
            >
              Get the AI Blueprint — $47
            </Link>
            <Link
              href="/program"
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-full font-marcellus text-white text-center hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(to right, #FCC4B7, rgba(252, 196, 183, 0))', fontSize: '35px' }}
            >
              Explore the iPurpose Accelerator
            </Link>
            <Link
              href="/about"
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-full font-marcellus text-white text-center hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(to right, #4B4E6D, rgba(75, 78, 109, 0))', fontSize: '35px' }}
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

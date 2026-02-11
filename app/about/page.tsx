import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import PublicHeader from "../components/PublicHeader";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "About iPurpose — Built for Clarity, Structure, and Sustainable Progress",
  description: "Learn why iPurpose was created and how it helps creators translate insight into clear decisions, ordered steps, and meaningful work.",
  robots: "index, follow",
  openGraph: {
    title: "About iPurpose — Built for Clarity, Structure, and Sustainable Progress",
    description: "Learn why iPurpose was created and how it helps creators translate insight into clear decisions, ordered steps, and meaningful work.",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-white">
      {/* Public Header */}
      <PublicHeader />
      
      {/* Main Content */}
      <div className="container max-w-3xl mx-auto px-8 md:px-16 py-12 space-y-12">
        
        {/* Hero */}
        <section 
          className="relative text-center space-y-4 sm:space-y-6 py-16 sm:py-24 px-4 sm:px-6 rounded-2xl overflow-hidden"
          style={{
            backgroundImage: 'url(/images/this-serene-scene-features-vibrant-plants-beside-a-tranquil-water-surface-enhanced-by-gentle-raindrops-all-set-against-a-dreamy-blurred-natural-background-that-evokes-calmness-and-peace-photo.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50"></div>
          
          <h1 className="heading-hero mb-6 text-white relative z-10 text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
            About iPurpose<span style={{ fontSize: '0.5em', verticalAlign: 'super' }}>™</span>
          </h1>
          <p className="text-white relative z-10 font-italiana px-4 sm:px-6 py-2 sm:py-3 rounded-lg" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', color: '#FFFFFF', fontSize: '55px' }}>
            A framework for building what matters — without losing yourself.
          </p>
        </section>

        {/* Why iPurpose Exists */}
        <section className="space-y-4">
          <h2 className="text-center font-marcellus text-warmCharcoal" style={{ fontSize: '60px' }}>
            Why iPurpose Exists
          </h2>
          <p className="text-center text-warmCharcoal/75 leading-relaxed" style={{ fontSize: '40px' }}>
            iPurpose exists to address a persistent gap:<br />
            traditional business often ignores the soul,<br />
            while spiritual work often ignores structure.
          </p>
          <p className="text-center text-warmCharcoal/75 leading-relaxed" style={{ fontSize: '40px' }}>
            Many capable, thoughtful people find themselves overwhelmed, disconnected, or stuck between intuition and implementation. They know something matters deeply to them — but struggle to translate that knowing into sustainable action.
          </p>
          <p className="text-center text-warmCharcoal/75 leading-relaxed" style={{ fontSize: '40px' }}>
            iPurpose™ was created to hold both meaning and method, without asking people to abandon either.
          </p>
        </section>

        {/* Decorative Divider */}
        <div className="flex items-center justify-center gap-4 py-12">
          <div style={{ height: '2px', width: '200px', background: 'linear-gradient(to right, transparent, #9c88ff)' }}></div>
          <div style={{ fontSize: '24px', color: '#9c88ff' }}>✦</div>
          <div style={{ height: '2px', width: '200px', background: 'linear-gradient(to left, transparent, #9c88ff)' }}></div>
        </div>

        {/* Philosophy Section */}
        <section className="space-y-2">
          <div>
            <h2 className="text-center font-marcellus text-warmCharcoal mb-2" style={{ fontSize: '60px' }}>
              The iPurpose Philosophy
            </h2>
            <p className="text-center text-warmCharcoal/80 font-marcellus" style={{ fontSize: '40px' }}>
              Soul → Systems → AI™
            </p>
            <p className="text-center text-warmCharcoal/75 italic mt-2" style={{ fontSize: '40px' }}>
              This is not a slogan. It is a sequence.
            </p>
          </div>
          
          <div className="space-y-4 pl-4 border-l-4 border-lavenderViolet">
            <div>
              <h3 className="text-center font-marcellus text-warmCharcoal mb-1" style={{ fontSize: '40px' }}>Soul — Alignment before action.</h3>
              <p className="text-center text-warmCharcoal/75" style={{ fontSize: '40px' }}>
                Know yourself and your values before deciding what to build.
              </p>
            </div>
            
            {/* Small Divider */}
            <div className="flex items-center justify-center gap-2 py-4">
              <div className="h-px w-16" style={{ background: 'linear-gradient(to right, transparent, #9c88ff)' }}></div>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#9c88ff' }}></div>
              <div className="h-px w-16" style={{ background: 'linear-gradient(to left, transparent, #9c88ff)' }}></div>
            </div>
            
            <div>
              <h3 className="text-center font-marcellus text-warmCharcoal mb-1" style={{ fontSize: '40px' }}>Systems — Structure before scale.</h3>
              <p className="text-center text-warmCharcoal/75" style={{ fontSize: '40px' }}>
                Create frameworks that support sustainability, not burnout.
              </p>
            </div>
            
            {/* Small Divider */}
            <div className="flex items-center justify-center gap-2 py-4">
              <div className="h-px w-16" style={{ background: 'linear-gradient(to right, transparent, #9c88ff)' }}></div>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#9c88ff' }}></div>
              <div className="h-px w-16" style={{ background: 'linear-gradient(to left, transparent, #9c88ff)' }}></div>
            </div>
            
            <div>
              <h3 className="text-center font-marcellus text-warmCharcoal mb-1" style={{ fontSize: '40px' }}>AI — Automation only after clarity.</h3>
              <p className="text-center text-warmCharcoal/75" style={{ fontSize: '40px' }}>
                Use technology to amplify human intention — not replace it.
              </p>
            </div>
          </div>
          
          <p className="text-center text-warmCharcoal/75 leading-relaxed font-marcellus pt-2" style={{ fontSize: '40px' }}>
            When this order is respected, technology serves the human — not the other way around.
          </p>
        </section>

        {/* Decorative Divider */}
        <div className="flex items-center justify-center gap-4 py-12">
          <div style={{ height: '2px', width: '200px', background: 'linear-gradient(to right, transparent, #fcc4b7)' }}></div>
          <div style={{ fontSize: '24px', color: '#fcc4b7' }}>✦</div>
          <div style={{ height: '2px', width: '200px', background: 'linear-gradient(to left, transparent, #fcc4b7)' }}></div>
        </div>

        {/* What iPurpose Is (and Is Not) */}
        <section className="space-y-4">
          <h2 className="text-center font-marcellus text-warmCharcoal" style={{ fontSize: '60px' }}>
            What iPurpose Is (and Is Not)
          </h2>
          <p className="text-center text-warmCharcoal/75 leading-relaxed" style={{ fontSize: '40px' }}>
            iPurpose is not about hustle, hype, or extraction.<br />
            It is not optimization without meaning.
          </p>
          <p className="text-center text-warmCharcoal/75 leading-relaxed" style={{ fontSize: '40px' }}>
            It is about building what is true,<br />
            at a pace that is sustainable,<br />
            in a way that is ethical, grounded, and alive.
          </p>
          <p className="text-center text-warmCharcoal/75 leading-relaxed" style={{ fontSize: '40px' }}>
            The aim is coherence — so your work, decisions, and systems no longer conflict with who you are.
          </p>
        </section>

        {/* Decorative Divider */}
        <div className="flex items-center justify-center gap-3 py-12">
          <div className="h-0.5 w-32" style={{ background: 'linear-gradient(to right, transparent, #e6c87c)' }}></div>
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#e6c87c' }}></div>
          <div className="h-0.5 w-32" style={{ background: 'linear-gradient(to left, transparent, #e6c87c)' }}></div>
        </div>

        {/* About the Founder */}
        <section className="space-y-6 bg-gradient-to-br from-lavenderViolet/5 to-salmonPeach/5 rounded-2xl p-8 border border-lavenderViolet/10">
          <div>
            <h2 className="text-center font-marcellus text-warmCharcoal mb-2" style={{ fontSize: '60px' }}>
              About the Founder
            </h2>
          </div>
          
          <div>
            <div className="float-left mb-4" style={{ marginRight: '24px' }}>
              <div className="border-4 border-lavenderViolet rounded-lg overflow-hidden shadow-lg">
                <Image
                  src="/images/renita-hamilton.jpg"
                  alt="Renita Hamilton, Founder of iPurpose"
                  width={240}
                  height={320}
                  className="w-60 h-auto"
                />
              </div>
              <h3 className="text-2xl font-marcellus text-warmCharcoal mt-4 mb-1">Renita Hamilton</h3>
              <p className="text-lg font-marcellus text-lavenderViolet">Founder of iPurpose</p>
            </div>
            <p className="text-warmCharcoal/75 leading-relaxed" style={{ fontSize: '40px' }}>
              Renita Hamilton is a strategist and entrepreneur working at the intersection of alignment, systems, and technology.
            </p>
            <p className="text-warmCharcoal/75 leading-relaxed mt-4" style={{ fontSize: '40px' }}>
              She created iPurpose from the belief — and lived experience — that people should not have to choose between meaning and practicality. Her work helps individuals build lives and work that reflect who they are, while remaining structured, ethical, and sustainable in the real world.
            </p>
            <div className="clear-both"></div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="space-y-6 bg-gradient-to-br from-lavenderViolet/5 to-salmonPeach/5 rounded-2xl p-4 sm:p-6 md:p-8 border border-lavenderViolet/10">
          <h2 className="text-center font-marcellus text-warmCharcoal" style={{ fontSize: '60px' }}>
            Next Steps
          </h2>
          <div className="space-y-3 sm:space-y-4 flex flex-col">
            <Link
              href="/discover"
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-full font-marcellus text-white text-center hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0))', fontSize: '35px' }}
            >
              Discover the iPurpose Framework
            </Link>
            <Link
              href="/program"
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-full font-marcellus text-white text-center hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(to right, #FCC4B7, rgba(252, 196, 183, 0))', fontSize: '35px' }}
            >
              Explore the iPurpose Accelerator™
            </Link>
          </div>
        </section>

      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

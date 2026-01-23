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
            About iPurpose
          </h1>
          <p className="text-white relative z-10 font-italiana px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-lg sm:text-2xl md:text-3xl lg:text-4xl" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', color: '#FFFFFF' }}>
            A framework for building what matters — without losing yourself.
          </p>
        </section>

        {/* Why iPurpose Exists */}
        <section className="space-y-4">
          <h2 className="text-4xl font-marcellus text-warmCharcoal">
            Why iPurpose Exists
          </h2>
          <p className="text-warmCharcoal/75 leading-relaxed" style={{ fontSize: '24px' }}>
            iPurpose exists to address a persistent gap: traditional business often ignores the soul, while spiritual work often ignores structure.
          </p>
          <p className="text-warmCharcoal/75 leading-relaxed" style={{ fontSize: '24px' }}>
            Many capable, thoughtful people find themselves overwhelmed, disconnected, or stuck between intuition and implementation. iPurpose™ was created to hold both — meaning and method — without asking people to abandon either.
          </p>
        </section>

        {/* Philosophy Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-4xl font-marcellus text-warmCharcoal mb-2">
              The iPurpose Philosophy
            </h2>
            <p className="text-xl text-warmCharcoal/80 font-marcellus">
              Soul → Systems → AI™
            </p>
            <p className="text-lg text-warmCharcoal/75 italic mt-2">
              This is not a slogan. It is a sequence.
            </p>
          </div>
          
          <div className="space-y-4 pl-4 border-l-4 border-lavenderViolet">
            <div>
              <h3 className="text-xl font-marcellus text-warmCharcoal mb-1">Soul — Alignment before action.</h3>
              <p className="text-warmCharcoal/75" style={{ fontSize: '24px' }}>
                Know yourself and your values before deciding what to build.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-marcellus text-warmCharcoal mb-1">Systems — Structure before scale.</h3>
              <p className="text-warmCharcoal/75" style={{ fontSize: '24px' }}>
                Create frameworks that support sustainability, not burnout.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-marcellus text-warmCharcoal mb-1">AI — Automation only after clarity.</h3>
              <p className="text-warmCharcoal/75" style={{ fontSize: '24px' }}>
                Use technology to amplify human intention — not replace it.
              </p>
            </div>
          </div>
          
          <p className="text-warmCharcoal/75 leading-relaxed font-marcellus pt-2" style={{ fontSize: '24px' }}>
            When this order is respected, technology serves the human — not the other way around.
          </p>
        </section>

        {/* What iPurpose Is (and Is Not) */}
        <section className="space-y-4">
          <h2 className="text-4xl font-marcellus text-warmCharcoal">
            What iPurpose Is (and Is Not)
          </h2>
          <p className="text-warmCharcoal/75 leading-relaxed" style={{ fontSize: '24px' }}>
            iPurpose is <strong>not</strong> about hustle, hype, or extraction.<br />
            It is <strong>not</strong> optimization without meaning.
          </p>
          <p className="text-warmCharcoal/75 leading-relaxed" style={{ fontSize: '24px' }}>
            It <strong>is</strong> about building what is true,<br />
            at a pace that is sustainable,<br />
            in a way that is ethical, grounded, and alive.
          </p>
        </section>

        {/* About the Founder */}
        <section className="space-y-6 bg-gradient-to-br from-lavenderViolet/5 to-salmonPeach/5 rounded-2xl p-8 border border-lavenderViolet/10">
          <div>
            <h2 className="text-3xl font-marcellus text-warmCharcoal mb-2">
              About the Founder
            </h2>
            <h3 className="text-2xl font-marcellus text-warmCharcoal mb-1">Renita Hamilton</h3>
            <p className="text-lg font-marcellus text-lavenderViolet mb-4">Founder of iPurpose</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <p className="text-warmCharcoal/75 leading-relaxed" style={{ fontSize: '24px' }}>
                Renita Hamilton is a strategist and entrepreneur working at the intersection of alignment, systems, and technology. She created iPurpose to help people build lives and work that reflect who they are — while remaining practical, structured, and sustainable.
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="border-4 border-lavenderViolet rounded-lg overflow-hidden shadow-lg">
                <Image
                  src="/images/renita-hamilton.jpg"
                  alt="Renita Hamilton, Founder of iPurpose"
                  width={240}
                  height={320}
                  className="w-60 h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="space-y-6">
          <h2 className="text-4xl font-marcellus text-warmCharcoal">
            Next Steps
          </h2>
          <div className="space-y-3">
            <Link
              href="/discover"
              className="block w-full bg-gradient-to-r from-lavenderViolet to-indigoDeep text-white font-marcellus py-3 px-6 rounded-lg hover:opacity-90 transition-opacity text-center"
            >
              Discover the iPurpose Framework
            </Link>
            <Link
              href="/program"
              className="block w-full bg-gradient-to-r from-indigoDeep to-salmonPeach text-white font-marcellus py-3 px-6 rounded-lg hover:opacity-90 transition-opacity text-center"
            >
              Explore the iPurpose Accelerator
            </Link>
          </div>
        </section>

      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

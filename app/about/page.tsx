import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import FloatingLogo from "../components/FloatingLogo";
import PublicHeader from "../components/PublicHeader";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "About iPurpose",
  description: "Learn about Renita Hamilton, founder of iPurpose, and the philosophy behind Soul → Systems → AI.",
  robots: "index, follow",
  openGraph: {
    title: "About iPurpose",
    description: "Learn about Renita Hamilton, founder of iPurpose, and the philosophy behind Soul → Systems → AI.",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-white">
      {/* Floating Logo */}
      <FloatingLogo />
      
      {/* Public Header */}
      <PublicHeader />
      
      {/* Main Content */}
      <div className="container max-w-3xl mx-auto px-8 md:px-16 py-12 space-y-12">
        
        {/* Hero */}
        <section className="text-center space-y-6">
          <h1 className="heading-hero mb-6 text-warmCharcoal">
            About iPurpose
          </h1>
          <p className="text-2xl text-warmCharcoal/80">
            The story, philosophy, and intention behind iPurpose.
          </p>
        </section>

        {/* Founder Section */}
        <section className="space-y-3">
          <h2 className="text-4xl font-marcellus text-warmCharcoal">
            Founder
          </h2>
          <div className="flex gap-8">
            <div className="flex-1">
              <h3 className="text-2xl font-marcellus text-warmCharcoal mb-1">Renita Hamilton</h3>
              <p className="text-lg font-semibold text-lavenderViolet mb-3">Creator of iPurpose</p>
              <p className="text-base text-warmCharcoal/75 leading-relaxed max-w-md">
                Renita Hamilton is a purpose-driven entrepreneur and strategist bridging spirituality, systems, and technology. She founded iPurpose to help people remember who they are, build aligned structures, and create sustainable income without burning out.
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="border-4 border-lavenderViolet rounded-lg overflow-hidden shadow-lg">
                <Image
                  src="/images/renita-hamilton.jpg"
                  alt="Renita Hamilton, Founder of iPurpose"
                  width={280}
                  height={360}
                  className="w-80 h-auto"
                />
              </div>
              <p className="text-center text-warmCharcoal font-marcellus text-lg mt-3">Founder</p>
            </div>
          </div>
        </section>

        {/* Why iPurpose Exists */}
        <section className="space-y-3">
          <h2 className="text-4xl font-marcellus text-warmCharcoal">
            Why iPurpose Exists
          </h2>
          <p className="text-lg text-warmCharcoal/75">
            iPurpose was created because traditional business often ignores the soul — and spiritual work often ignores structure. I saw capable, thoughtful people feeling disconnected, overwhelmed, or stuck between intuition and implementation. iPurpose exists to hold both.
          </p>
        </section>

        {/* Philosophy Section */}
        <section className="space-y-3">
          <h2 className="text-4xl font-marcellus text-warmCharcoal">
            The Philosophy
          </h2>
          <p className="text-lg text-warmCharcoal/75 mb-4">
            Soul → Systems → AI
          </p>
          <ul className="space-y-3 text-lg text-warmCharcoal/75">
            <li className="flex gap-3">
              <span className="text-lavenderViolet font-bold">•</span>
              <span><strong>Soul:</strong> Alignment before action. Know yourself and your values first.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-lavenderViolet font-bold">•</span>
              <span><strong>Systems:</strong> Structure before scale. Build sustainable frameworks that reflect your values.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-lavenderViolet font-bold">•</span>
              <span><strong>AI:</strong> Automation only after clarity. Use technology to amplify, not replace, your vision.</span>
            </li>
          </ul>
          <p className="text-lg text-warmCharcoal/75 mt-4">
            This sequence ensures that technology serves the human — not the other way around.
          </p>
        </section>

        {/* Intention Section */}
        <section className="space-y-3">
          <h2 className="text-4xl font-marcellus text-warmCharcoal">
            Intention
          </h2>
          <p className="text-lg text-warmCharcoal/75">
            iPurpose is not about hustle, hype, or extraction. It is about building what is true, at a pace that is sustainable, in a way that feels ethical, grounded, and alive.
          </p>
        </section>

        {/* Next Steps */}
        <section className="space-y-8 bg-gradient-to-br from-lavenderViolet/5 to-salmonPeach/5 rounded-2xl p-8 border border-lavenderViolet/10">
          <h2 className="text-4xl font-marcellus text-warmCharcoal">
            Next steps
          </h2>
          <div className="space-y-3">
            <Link
              href="/discover"
              className="block w-full bg-gradient-to-r from-lavenderViolet to-indigoDeep text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity text-center"
            >
              Discover iPurpose
            </Link>
            <Link href="/program" className="text-lavenderViolet hover:underline block text-center">
              View the 6-Week Program
            </Link>
          </div>
        </section>

      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

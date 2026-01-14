import Link from "next/link";
import { Metadata } from "next";

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
    <main className="min-h-screen bg-gradient-to-b from-black via-black to-black">
      {/* Hero Section */}
      <section className="relative w-full pt-20 pb-12 px-6 md:px-12 lg:px-20">
        <div className="max-w-4xl mx-auto">
          <h1 
            className="font-italiana mb-8 leading-tight text-white"
            style={{ fontSize: '48px', color: '#FFFFFF' }}
          >
            About iPurpose
          </h1>
          <p className="text-lg text-white/80 leading-relaxed">
            Understanding the story, philosophy, and intention behind iPurpose.
          </p>
        </div>
      </section>

      {/* Founder Section */}
      <section className="w-full py-16 px-6 md:px-12 lg:px-20 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-italiana text-4xl text-white mb-8" style={{ fontSize: '36px' }}>Founder</h2>
          
          <div className="bg-gradient-to-r from-white/5 to-white/0 p-8 rounded-lg border border-white/10">
            <h3 className="font-italiana text-2xl text-white mb-2">Renita Hamilton</h3>
            <p className="text-lg text-white/60 mb-6 font-semibold">Creator of iPurpose</p>
            
            <p className="text-base text-white/80 leading-relaxed">
              Renita Hamilton is a purpose-driven entrepreneur and strategist bridging spirituality, systems, and technology. She founded iPurpose to help people remember who they are, build aligned structures, and create sustainable income without burning out.
            </p>
          </div>
        </div>
      </section>

      {/* Why iPurpose Exists */}
      <section className="w-full py-16 px-6 md:px-12 lg:px-20 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-italiana text-4xl text-white mb-8" style={{ fontSize: '36px' }}>Why iPurpose Exists</h2>
          
          <div className="bg-gradient-to-r from-white/5 to-white/0 p-8 rounded-lg border border-white/10">
            <p className="text-base text-white/80 leading-relaxed">
              iPurpose was created because traditional business often ignores the soul — and spiritual work often ignores structure. I saw capable, thoughtful people feeling disconnected, overwhelmed, or stuck between intuition and implementation. iPurpose exists to hold both.
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="w-full py-16 px-6 md:px-12 lg:px-20 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-italiana text-4xl text-white mb-8" style={{ fontSize: '36px' }}>The Philosophy</h2>
          
          <div className="mb-8">
            <h3 className="font-italiana text-3xl text-white mb-8">Soul → Systems → AI</h3>
            
            <div className="space-y-6 mb-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-1 bg-gradient-to-b from-white/60 to-white/10 rounded-full"></div>
                <div>
                  <p className="font-semibold text-white mb-2">Soul: Alignment before action</p>
                  <p className="text-white/70 text-sm">Know yourself and your values first.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-1 bg-gradient-to-b from-white/60 to-white/10 rounded-full"></div>
                <div>
                  <p className="font-semibold text-white mb-2">Systems: Structure before scale</p>
                  <p className="text-white/70 text-sm">Build sustainable frameworks that reflect your values.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-1 bg-gradient-to-b from-white/60 to-white/10 rounded-full"></div>
                <div>
                  <p className="font-semibold text-white mb-2">AI: Automation only after clarity</p>
                  <p className="text-white/70 text-sm">Use technology to amplify, not replace, your vision.</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-white/5 to-white/0 p-6 rounded-lg border border-white/10">
              <p className="text-base text-white/80 leading-relaxed">
                This sequence ensures that technology serves the human — not the other way around.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Intention Section */}
      <section className="w-full py-16 px-6 md:px-12 lg:px-20 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-italiana text-4xl text-white mb-8" style={{ fontSize: '36px' }}>Intention</h2>
          
          <div className="bg-gradient-to-r from-white/5 to-white/0 p-8 rounded-lg border border-white/10">
            <p className="text-base text-white/80 leading-relaxed">
              iPurpose is not about hustle, hype, or extraction. It is about building what is true, at a pace that is sustainable, in a way that feels ethical, grounded, and alive.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 px-6 md:px-12 lg:px-20 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <Link
              href="/discover"
              className="px-8 py-4 rounded-full font-italiana text-lg text-white text-center hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0))', fontSize: '18px' }}
            >
              Discover iPurpose
            </Link>
            
            <Link
              href="/program"
              className="px-8 py-4 rounded-full font-italiana text-lg text-white text-center hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(to right, #E8967A, rgba(232, 150, 122, 0))', fontSize: '18px' }}
            >
              View the 6-Week Program
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

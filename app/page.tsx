import { cookies } from 'next/headers';
import Link from 'next/link';
import { firebaseAdmin } from '@/lib/firebaseAdmin';

import VideoBackground from './components/VideoBackground';
import FloatingLogo from './components/FloatingLogo';
import PublicHeader from './components/PublicHeader';
import Footer from './components/Footer';

export default async function Home() {
  // Check if user is logged in
  const cookieStore = await cookies();
  const session = cookieStore.get('FirebaseSession')?.value ?? null;
  let isLoggedIn = false;
  
  if (session) {
    try {
      await firebaseAdmin.auth().verifySessionCookie(session, true);
      isLoggedIn = true;
    } catch (e) {
      // Session invalid
    }
  }

  return (
    <div className="relative w-full bg-white">
      {/* Background Video */}
      <VideoBackground src="/videos/water-reflection.mp4" poster="" />
      
      {/* Floating Logo */}
      <FloatingLogo />

      {/* Public Header Navigation */}
      <PublicHeader />
      
      {/* Hero Section - Full Viewport Height */}
      <div className="relative w-full flex items-center justify-center p-6 lg:p-12 min-h-screen" style={{ zIndex: 10 }}>
        {/* Hero Content Block with Gradient Overlay */}
        <div className="max-w-3xl text-center relative p-12 lg:p-16" style={{ 
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.15) 100%)'
        }}>
          <h1 className="font-italiana leading-none" style={{ color: '#FFFFFF', textShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
            <div style={{ fontSize: '160px', marginBottom: '60px' }}>iPurpose™</div>
            <div style={{ fontSize: '80px' }}>Helping people orient themselves in a changing world.</div>
          </h1>
          <p className="text-[37px] lg:text-[49px] leading-relaxed mt-5 lg:mt-6 mx-auto" style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
            iPurpose helps thoughtful, capable people who feel disconnected, tired, or unclear.
          </p>
          <p className="text-[37px] lg:text-[49px] leading-relaxed mt-3 lg:mt-4 mx-auto" style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
            Let's reconnect you to what matters and build it with clarity.
          </p>
        </div>
      </div>

      {/* Offers Section */}
      <div className="relative w-full bg-black/20 backdrop-blur-sm py-20 px-6 lg:px-12" style={{ zIndex: 10 }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl lg:text-6xl font-italiana text-center mb-16" style={{ color: '#FFFFFF', textShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
            Start Your Journey
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Clarity Check */}
            <div className="relative p-8 rounded-2xl backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all" style={{ background: 'linear-gradient(135deg, rgba(156, 136, 255, 0.1) 0%, rgba(156, 136, 255, 0.05) 100%)' }}>
              <h3 className="text-2xl font-italiana mb-4" style={{ color: '#FFFFFF' }}>Clarity Check</h3>
              <p className="text-white/80 mb-6 text-lg">Take a guided assessment to discover your core values and purpose.</p>
              <Link href="/clarity-check" className="inline-block px-8 py-3 rounded-full font-marcellus transition-all hover:opacity-90" style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0.7))', color: '#FFFFFF' }}>
                Start Assessment
              </Link>
            </div>

            {/* Starter Pack */}
            <div className="relative p-8 rounded-2xl backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all" style={{ background: 'linear-gradient(135deg, rgba(125, 211, 252, 0.1) 0%, rgba(125, 211, 252, 0.05) 100%)' }}>
              <h3 className="text-2xl font-italiana mb-4" style={{ color: '#FFFFFF' }}>Starter Pack</h3>
              <p className="text-white/80 mb-6 text-lg">Get foundational tools and exercises to begin your clarity journey.</p>
              <Link href="/starter-pack" className="inline-block px-8 py-3 rounded-full font-marcellus transition-all hover:opacity-90" style={{ background: 'linear-gradient(to right, #7DD3FC, rgba(125, 211, 252, 0.7))', color: '#FFFFFF' }}>
                Explore Offer
              </Link>
            </div>

            {/* AI Blueprint */}
            <div className="relative p-8 rounded-2xl backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all" style={{ background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, rgba(167, 139, 250, 0.05) 100%)' }}>
              <h3 className="text-2xl font-italiana mb-4" style={{ color: '#FFFFFF' }}>AI Blueprint</h3>
              <p className="text-white/80 mb-6 text-lg">Let AI help you build a personalized action plan for clarity.</p>
              <Link href="/ai-blueprint" className="inline-block px-8 py-3 rounded-full font-marcellus transition-all hover:opacity-90" style={{ background: 'linear-gradient(to right, #A78BFA, rgba(167, 139, 250, 0.7))', color: '#FFFFFF' }}>
                Explore Offer
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

import { cookies } from 'next/headers';
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
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

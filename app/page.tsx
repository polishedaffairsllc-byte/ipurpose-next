import Button from './components/Button';
import { cookies } from 'next/headers';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import Link from 'next/link';

import VideoBackground from './components/VideoBackground';

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
    <div className="relative min-h-screen w-full overflow-hidden bg-white">
      {/* Background Video */}
      <VideoBackground src="/videos/i.mp4?v=2" poster="/images/ipurpose-hero-bg.jpg" />
      
      {/* Top Navigation Bar - CTAs and Auth */}
      <nav className="relative z-20 w-full flex items-center justify-around p-6 lg:p-12 border-b border-white/10" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
        <Button size="lg" variant="primary" href="/clarity-check">
          Take the Clarity Check
        </Button>
        <Button size="lg" variant="primary" href="/program">
          View the 6-Week Program
        </Button>
        {isLoggedIn ? (
          <Button variant="primary" href="/dashboard">Dashboard</Button>
        ) : (
          <Button variant="primary" href="/login">Sign In</Button>
        )}
      </nav>

      {/* Hero Section - Full Viewport Height */}
      <div className="relative w-full flex items-center justify-center p-6 lg:p-12" style={{ height: 'calc(100vh - 80px)', zIndex: 10 }}>
        {/* Hero Content Block with Background */}
        <div className="max-w-5xl text-center relative p-12 lg:p-16" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <h1 className="text-[120px] lg:text-[160px] mb-8 font-italiana leading-none" style={{ color: '#FFFFFF', textShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
            Build what's true — without burning out.
          </h1>
          <p className="text-[84px] lg:text-[112px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
            iPurpose helps thoughtful, capable people who feel disconnected, tired, or unclear about what they're building reconnect to what matters and build with clarity.
          </p>
        </div>
      </div>
    </div>
  );
}

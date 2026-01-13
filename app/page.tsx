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
      
      {/* Top Navigation Bar with CTAs */}
      <nav className="relative z-20 w-full flex items-center justify-between p-6 lg:p-12 border-b border-white/10" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
        <div className="flex items-center gap-4 lg:gap-6">
          <Button size="lg" variant="primary" href="/clarity-check">
            Take the Clarity Check
          </Button>
          <Button size="lg" variant="primary" href="/program">
            View the 6-Week Program
          </Button>
        </div>
        <div>
          {isLoggedIn ? (
            <Button variant="primary" href="/dashboard">Dashboard</Button>
          ) : (
            <Button variant="primary" href="/login">Sign In</Button>
          )}
        </div>
      </nav>

      {/* Hero Content - Vertically Centered */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 lg:p-12" style={{ top: '80px', transform: 'translateY(-6vh)' }}>
        {/* Hero Glass Wrapper */}
        <div className="max-w-[720px] px-7 py-6 text-center" style={{
          backgroundColor: 'rgba(0, 0, 0, 0.35)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px'
        }}>
          <h1 className="text-6xl lg:text-7xl mb-6 font-italiana" style={{ color: '#FFFFFF' }}>
            Build what's true — without burning out.
          </h1>
          <p className="text-xl lg:text-2xl leading-relaxed" style={{ color: '#FFFFFF' }}>
            iPurpose helps thoughtful, capable people who feel disconnected, tired, or unclear about what they're building reconnect to what matters and build with clarity.
          </p>
        </div>
      </div>
    </div>
  );
}

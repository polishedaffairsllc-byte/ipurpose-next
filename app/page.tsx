import Button from './components/Button';
import { cookies } from 'next/headers';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import Link from 'next/link';
import Image from 'next/image';

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
        {/* Hero Content Block with Gradient Overlay */}
        <div className="max-w-3xl text-center relative p-12 lg:p-16" style={{ 
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.15) 100%)'
        }}>
          <h1 className="text-[108px] lg:text-[144px] mb-3 lg:mb-4 font-italiana leading-none" style={{ color: '#FFFFFF', textShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
            Build what's true — without burning out.
          </h1>
          <p className="text-[37px] lg:text-[49px] leading-relaxed mt-5 lg:mt-6 mx-auto" style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
            iPurpose helps thoughtful, capable people who feel disconnected, tired, or unclear.
          </p>
          <p className="text-[37px] lg:text-[49px] leading-relaxed mt-3 lg:mt-4 mx-auto" style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
            Let's reconnect you to what matters and build it with clarity.
          </p>
        </div>
        
        {/* Logo - Bottom Right Corner */}
        <div className="absolute bottom-6 lg:bottom-12 right-6 lg:right-12 z-20">
          <Link href="/" className="flex-shrink-0">
            <Image 
              src="/images/my-logo2.png" 
              alt="iPurpose Logo" 
              width={80} 
              height={80}
              className="h-20 w-auto"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}

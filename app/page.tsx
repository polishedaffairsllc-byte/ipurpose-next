import Button from './components/Button';
import { cookies } from 'next/headers';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import Link from 'next/link';

function IPurposeLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 bg-gradient-to-br from-lavenderViolet to-salmonPeach rounded-lg flex items-center justify-center">
        <span className="text-white font-marcellus font-bold text-lg">i</span>
      </div>
      <span className="font-marcellus text-xl font-semibold text-warmCharcoal">iPurpose</span>
    </div>
  );
}
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
      <VideoBackground src="/videos/i.mp4" poster="/images/ipurpose-hero-bg.jpg" />
      {/* Navigation Bar */}
      <nav className="relative z-20 w-full flex items-center justify-between p-6 lg:p-12 border-b border-white/10" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <IPurposeLogo />
        </Link>
        <div className="flex items-center gap-8 lg:gap-16">
          {isLoggedIn ? (
            <Button variant="primary" href="/dashboard">Dashboard</Button>
          ) : (
            <Button variant="primary" href="/login">Sign In</Button>
          )}
        </div>
      </nav>
      {/* Content */}
      <div className="relative z-10 w-full min-h-[calc(100vh-80px)] flex flex-col justify-between items-center text-center p-6 lg:p-12">
        {/* Above-the-fold CTA Section */}
        <div className="max-w-3xl backdrop-blur-sm rounded-3xl p-12 border border-white/20 mb-12" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <h1 className="text-6xl lg:text-7xl mb-6 font-marcellus" style={{ color: '#FFFFFF' }}>
            Build what's true — without burning out.
          </h1>
          <p className="text-xl lg:text-2xl mb-8 leading-relaxed" style={{ color: '#FFFFFF' }}>
            iPurpose helps thoughtful, capable people who feel disconnected, tired, or unclear about what they're building reconnect to what matters and build with clarity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
            <Button size="lg" variant="primary" href="/clarity-check">
              Take the Clarity Check
            </Button>
            <Button size="lg" variant="primary" href="/program">
              View the 6-Week Program
            </Button>
            {!isLoggedIn && (
              <Button size="lg" variant="primary" href="/login">
                Login
              </Button>
            )}
          </div>
        </div>

        {/* Program Showcase */}
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl mb-12">
          <div className="backdrop-blur-sm rounded-2xl p-6 border border-white/20" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <h3 className="text-5xl font-marcellus mb-2" style={{ color: '#FFFFFF' }}>6 Week Program</h3>
            <p className="text-lg mb-4" style={{ color: '#FFFFFF' }}>
              A guided journey to clarity, momentum, and soulful success. Get unstuck and move forward with support.
            </p>
            <a href="/program" className="text-xl transition-colors font-semibold hover:opacity-80" style={{ color: '#FFFFFF' }}>
              Learn More →
            </a>
          </div>
        </div>

        {/* Hero Content */}
        <div className="max-w-2xl backdrop-blur-sm rounded-3xl p-12 border border-white/20" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <h2 className="text-5xl lg:text-6xl mb-4 font-marcellus" style={{ color: '#FFFFFF' }}>
            Align your soul. Empower your systems. Expand through AI.
          </h2>
          <p className="text-xl mb-8" style={{ color: '#FFFFFF' }}>
            A transformation platform for visionary entrepreneurs.
          </p>
          <Button size="lg" variant="primary" href={isLoggedIn ? "/dashboard" : "/clarity-check"}>
            {isLoggedIn ? "Go to Dashboard" : "Get Started"}
          </Button>
        </div>
      </div>
    </div>
  );
}

import Button from './components/Button';

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

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white">
      {/* Background Video */}
      <VideoBackground src="/videos/i.mp4" />
      {/* Navigation Bar */}
      <nav className="relative z-20 w-full flex items-center justify-between p-6 lg:p-12 border-b border-white/10" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
        <div></div>
        <div className="flex items-center gap-8 lg:gap-16">
          <Button variant="primary" href="/login">Sign In</Button>
        </div>
      </nav>
      {/* Content */}
      <div className="relative z-10 w-full min-h-[calc(100vh-80px)] flex flex-col justify-between items-center text-center p-6 lg:p-12 font-italiana">
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
          <div className="backdrop-blur-sm rounded-2xl p-6 border border-white/20" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <h3 className="text-6xl font-marcellus mb-2" style={{ color: '#FFFFFF' }}>6 Week Program</h3>
            <p className="text-3xl mb-4" style={{ color: '#FFFFFF' }}>
              A guided journey to clarity, momentum, and soulful success. Get unstuck and move forward with support.
            </p>
            <a href="/ipurpose-6-week" className="text-2xl transition-colors font-semibold" style={{ color: '#FFFFFF' }}>
              Learn More →
            </a>
          </div>
        </div>

        {/* Hero Content */}
        <div className="max-w-2xl backdrop-blur-sm rounded-3xl p-12 border border-white/20" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <h1 className="text-7xl lg:text-8xl mb-4" style={{ color: '#FFFFFF' }}>
            Align your soul. Empower your systems. Expand through AI.
          </h1>
          <p className="text-2xl mb-8" style={{ color: '#FFFFFF' }}>
            A transformation platform for visionary entrepreneurs.
          </p>
          <Button size="lg" variant="primary" href="/login">
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}


import Button from './components/Button';
import VideoBackground from './components/VideoBackground';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black relative overflow-hidden">
      {/* Background Video (with JS fallback) */}
      <VideoBackground src="/videos/water-reflection.mp4" poster="/images/ipurpose-logo-transparent.png" className="brightness-75" />
      {/* Overlay Content */}
      <section className="ipurpose-glow-container w-full max-w-3xl mx-auto flex flex-col items-center text-center py-20 px-4 relative z-10">
        <div className="w-40 h-40 mb-8 rounded-3xl overflow-hidden shadow-2xl border-4 border-lavenderViolet/30 animate-fade-in bg-white/70 flex items-center justify-center">
          <img
            src="/images/ipurpose-logo-transparent.png"
            alt="iPurpose Logo"
            className="object-contain w-full h-full"
            loading="eager"
          />
        </div>
        <h1 className="ipurpose-gradient-text font-italiana text-5xl md:text-7xl font-bold tracking-tight mb-4 animate-fade-in">
          iPurpose Portal
        </h1>
        <p className="text-lg md:text-2xl text-warmCharcoal/80 font-marcellus max-w-xl mb-8 animate-fade-in delay-100 bg-white/70 rounded-xl px-4 py-2 inline-block">
          Align your soul. Empower your systems. Expand through AI.<br />
          <span className="text-warmCharcoal/60 text-base md:text-lg block">A transformation platform for visionary entrepreneurs.</span>
        </p>
        <Button href="/signup" size="lg" className="shadow-xl animate-fade-in delay-200 mb-8">
          Get Started
        </Button>
        <div className="w-full flex flex-col items-center mt-8 animate-fade-in delay-300">
          <div className="ipurpose-card-lavender p-6 rounded-2xl shadow-lg max-w-xl w-full mb-4 bg-white/80">
            <h2 className="font-marcellus text-2xl md:text-3xl font-bold mb-2 text-lavenderViolet">6 Week Program</h2>
            <p className="text-warmCharcoal/80 mb-4">A guided journey to clarity, momentum, and soulful success. Get unstuck and move forward with support.</p>
            <Button href="/ipurpose-6-week" size="md" variant="accent" className="w-full">Learn More</Button>
          </div>
        </div>
      </section>
    </main>
  );
}

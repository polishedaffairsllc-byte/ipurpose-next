
import Button from './components/Button';
import { SparklesIcon } from '@heroicons/react/24/solid';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      <section className="ipurpose-glow-container w-full max-w-2xl mx-auto flex flex-col items-center text-center py-20 px-4 relative z-10">
        <span className="ipurpose-icon-bubble mb-6 animate-bounce">
          <SparklesIcon className="w-10 h-10 text-lavenderViolet" />
        </span>
        <h1 className="ipurpose-gradient-text font-italiana text-5xl md:text-7xl font-bold tracking-tight mb-4 animate-fade-in">
          iPurpose Portal
        </h1>
        <p className="text-lg md:text-2xl text-warmCharcoal/80 font-marcellus max-w-xl mb-8 animate-fade-in delay-100">
          Align your soul. Empower your systems. Expand through AI.<br />
          <span className="text-warmCharcoal/60 text-base md:text-lg block">A transformation platform for visionary entrepreneurs.</span>
        </p>
        <Button href="/signup" size="lg" className="shadow-xl animate-fade-in delay-200">
          Get Started
        </Button>
      </section>
    </main>
  );
}

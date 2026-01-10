import { BackgroundVideo } from './components/BackgroundVideo';
import { Button } from './components/ui/button';
import { iPurposeLogo } from './components/iPurposeLogo';

export default function Home() {
  return (
    <BackgroundVideo>
      <div className="w-full h-full flex flex-col justify-between p-6 lg:p-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <iPurposeLogo />
          <nav className="hidden md:flex gap-8">
            <a href="#" className="text-white hover:text-lavenderViolet transition-colors">
              Portal
            </a>
            <a href="#" className="text-white hover:text-lavenderViolet transition-colors">
              Sign In
            </a>
            <Button variant="primary">Get Started</Button>
          </nav>
        </div>

        {/* Hero Content */}
        <div className="max-w-2xl">
          <h1 className="font-italiana text-5xl lg:text-6xl text-white mb-4">
            Align your soul. Empower your systems. Expand through AI.
          </h1>
          <p className="text-xl text-white/80 mb-8">
            A transformation platform for visionary entrepreneurs.
          </p>
          <Button size="lg" variant="primary">
            Get Started
          </Button>
        </div>

        {/* CTA Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-2xl font-marcellus text-white mb-2">6 Week Program</h3>
            <p className="text-white/70 mb-4">
              A guided journey to clarity, momentum, and soulful success. Get unstuck and move forward with support.
            </p>
            <a href="#" className="text-lavenderViolet hover:text-salmonPeach transition-colors font-semibold">
              Learn More →
            </a>
          </div>
        </div>
      </div>
    </BackgroundVideo>
  );
}

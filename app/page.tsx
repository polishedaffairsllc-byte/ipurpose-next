import Link from "next/link";
import ParallaxImage from './components/ParallaxImage';
import PhotoCard from './components/PhotoCard';
import ScrollReveal from './components/ScrollReveal';
import Button from './components/Button';
import Card from './components/Card';

const sections = [
  {
    id: "soul",
    label: "Soul Alignment",
    description: "Begin your inner alignment journey and uncover your clarity.",
    cta: "Go to Soul",
    href: "/soul",
  },
  {
    id: "systems",
    label: "Systems",
    description: "Structure your workflows, offers, and strategic foundation.",
    cta: "Go to Systems",
    href: "/systems",
  },
  {
    id: "ai",
    label: "AI Tools",
    description: "Expand your capacity with aligned automation and powerful prompts.",
    cta: "Go to AI",
    href: "/ai",
  },
];

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section with Parallax */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <ParallaxImage
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80"
          alt="Serene landscape"
          speed={0.3}
          className="absolute inset-0"
        />
        
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <ScrollReveal direction="scale">
            <h1 className="heading-hero mb-6 text-white drop-shadow-2xl">
              Align Your Soul.<br />Empower Your Systems.<br />Expand Through AI.
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-marcellus mb-8 drop-shadow-lg">
              The transformation platform for visionary entrepreneurs
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button href="/signup" size="lg">
                Begin Your Journey
              </Button>
              <Button href="/login" variant="secondary" size="lg">
                Sign In
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Three Pillars Section */}
      <div className="max-w-7xl mx-auto px-4 py-24">
        <ScrollReveal>
          <h2 className="heading-section text-center mb-16">
            Three Pillars of Transformation
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8 mb-24">
          <ScrollReveal delay={100}>
            <PhotoCard
              src="https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80"
              alt="Soul - Inner clarity"
              title="Soul"
              description="Discover your authentic purpose and align with your deepest values"
              aspectRatio="portrait"
            />
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <PhotoCard
              src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80"
              alt="Systems - Strategic foundation"
              title="Systems"
              description="Build sustainable workflows and strategic frameworks"
              aspectRatio="portrait"
            />
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <PhotoCard
              src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80"
              alt="AI - Exponential growth"
              title="AI"
              description="Leverage intelligent automation to amplify your impact"
              aspectRatio="portrait"
            />
          </ScrollReveal>
        </div>

        {/* Connection Section */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="heading-section mb-6">
              Built for Connection
            </h2>
            <p className="text-lg text-warmCharcoal/70 max-w-2xl mx-auto leading-relaxed">
              Join a community of purpose-driven entrepreneurs creating meaningful impact
            </p>
          </div>
        </ScrollReveal>

        {/* Quick Access Links */}
        <ScrollReveal delay={200}>
          <div className="grid md:grid-cols-3 gap-6">
            {sections.map((section) => (
              <Link
                key={section.id}
                href={section.href}
                className="group"
              >
                <Card hover className="h-full transition-all">
                  <h3 className="font-marcellus text-xl mb-3 text-warmCharcoal group-hover:text-lavenderViolet transition-colors">
                    {section.label}
                  </h3>
                  <p className="text-sm text-warmCharcoal/70 leading-relaxed mb-4">
                    {section.description}
                  </p>
                  <span className="text-sm font-semibold text-lavenderViolet">
                    {section.cta} →
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </ScrollReveal>
      </div>
      </div>
    </div>
  );
}

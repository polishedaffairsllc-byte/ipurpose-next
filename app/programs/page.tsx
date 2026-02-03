import { Metadata } from 'next';
import Link from 'next/link';
import PublicHeader from '../components/PublicHeader';
import Footer from '../components/Footer';
import Card from '../components/Card';

export const metadata: Metadata = {
  title: 'Programs & Offers — iPurpose',
  description: 'Explore iPurpose programs: Starter Pack, AI Blueprint, Accelerator, and Deepen offerings.',
};

export default function ProgramsPage() {
  const programs = [
    {
      id: 'starter-pack',
      title: 'Starter Pack',
      subtitle: 'Your foundation for clarity',
      price: '$27',
      description:
        'A printable workbook + quick-start guide to help you establish your identity anchor, define what matters, and articulate your first aligned action.',
      includes: [
        '20-page printable workbook',
        'Identity anchor template',
        'Meaning clarification prompts',
        'Action planning guide',
        'Lifetime access to updates',
      ],
      cta: 'Get Started',
      ctaLink: '/starter-pack',
      accent: 'lavender',
      audience: 'For explorers who want a tactile, journal-friendly foundation.',
    },
    {
      id: 'ai-blueprint',
      title: 'AI Blueprint',
      subtitle: 'AI prompts for clarity work',
      price: '$17',
      description:
        'A collection of carefully designed prompts you can use with ChatGPT, Claude, or any AI to guide your own clarity work. The blueprint includes domain-specific prompts for business, creative, and personal alignment.',
      includes: [
        'Structured prompt templates',
        'Domain-specific variations',
        'Prompt chaining workflows',
        'Integration guide',
        'Community access',
      ],
      cta: 'Explore Blueprint',
      ctaLink: '/ai-blueprint',
      accent: 'coral',
      audience: 'For those who want to leverage AI in their reflective practice.',
    },
    {
      id: 'accelerator',
      title: 'Accelerator',
      subtitle: 'The complete program (coming soon)',
      price: 'Custom',
      description:
        'A 12-week live cohort program combining the Starter Pack + AI Blueprint + weekly group sessions with Renita + monthly 1:1 coaching sessions.',
      includes: [
        'All Starter Pack + Blueprint content',
        '12 weeks of live group sessions',
        'Monthly 1:1 coaching',
        'Private community',
        'Lifetime resource library',
        'Completion certificate',
      ],
      cta: 'Learn More',
      ctaLink: '/program',
      accent: 'peach',
      audience: 'For those ready for deep, supported transformation.',
      comingSoon: true,
    },
  ];

  return (
    <div className="relative min-h-screen bg-white">
      <PublicHeader />

      {/* Hero */}
      <div className="container max-w-4xl mx-auto px-6 py-16 md:py-24 text-center">
        <h1 className="heading-hero text-4xl md:text-5xl lg:text-6xl text-warmCharcoal mb-6">
          Explore Your Path
        </h1>
        <p className="text-lg md:text-xl text-warmCharcoal/75 mb-4">
          Choose the offering that fits where you are right now.
        </p>
        <p className="text-sm md:text-base text-warmCharcoal/60 max-w-2xl mx-auto">
          Each program builds on the same foundation: identity clarity, meaning alignment, and actionable next steps.
          Start small or go all-in—there's no wrong entry point.
        </p>
      </div>

      {/* Programs Grid */}
      <div className="container max-w-6xl mx-auto px-6 pb-24">
        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
          {programs.map((program) => (
            <Card
              key={program.id}
              accent={program.accent as any}
              className={`flex flex-col h-full ${program.comingSoon ? 'opacity-75' : ''}`}
            >
              <div className="flex-1">
                {/* Badge */}
                <div className="mb-4">
                  {program.comingSoon && (
                    <span className="inline-block px-3 py-1 bg-warmCharcoal/10 text-warmCharcoal text-xs font-semibold rounded-full">
                      Coming Soon
                    </span>
                  )}
                </div>

                {/* Title & Price */}
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-warmCharcoal mb-1">{program.title}</h2>
                  <p className="text-sm text-warmCharcoal/70 mb-3">{program.subtitle}</p>
                  <p className="text-3xl font-bold text-warmCharcoal">{program.price}</p>
                </div>

                {/* Description */}
                <p className="text-sm text-warmCharcoal/75 leading-relaxed mb-6">{program.description}</p>

                {/* Includes */}
                <div className="mb-8">
                  <h3 className="text-xs uppercase tracking-[0.1em] text-warmCharcoal/60 font-semibold mb-3">
                    What's Included
                  </h3>
                  <ul className="space-y-2">
                    {program.includes.map((item, idx) => (
                      <li key={idx} className="flex gap-2 text-sm text-warmCharcoal/75">
                        <span className="text-lavenderViolet font-bold">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Audience */}
                <div className="p-4 bg-warmCharcoal/5 rounded-lg mb-6">
                  <p className="text-xs text-warmCharcoal/70">{program.audience}</p>
                </div>
              </div>

              {/* CTA */}
              {program.comingSoon ? (
                <button
                  disabled
                  className="w-full py-3 px-4 rounded-lg font-semibold text-center transition bg-warmCharcoal/10 text-warmCharcoal/60 cursor-not-allowed"
                >
                  {program.cta}
                </button>
              ) : (
                <Link
                  href={program.ctaLink}
                  className="w-full py-3 px-4 rounded-lg font-semibold text-center transition bg-gradient-to-r from-lavenderViolet to-indigoDeep text-white hover:opacity-90 block"
                >
                  {program.cta}
                </Link>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container max-w-4xl mx-auto px-6 py-16 border-t border-warmCharcoal/10">
        <h2 className="text-3xl font-semibold text-warmCharcoal mb-8 text-center">Questions?</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="font-semibold text-warmCharcoal mb-2">Can I start with Starter Pack and upgrade?</h3>
            <p className="text-sm text-warmCharcoal/70">
              Absolutely. Think of it as your entry point. When you're ready for more structure and support, the
              Accelerator is available.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-warmCharcoal mb-2">Do these programs include coaching?</h3>
            <p className="text-sm text-warmCharcoal/70">
              The Starter Pack and Blueprint are self-guided. The Accelerator includes monthly 1:1 coaching and weekly
              group sessions.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-warmCharcoal mb-2">What if I don't know which one to choose?</h3>
            <p className="text-sm text-warmCharcoal/70">
              Start with the Clarity Check to understand where you are. Then, pick the offering that matches your
              readiness level.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-warmCharcoal mb-2">Is there a free option?</h3>
            <p className="text-sm text-warmCharcoal/70">
              Yes! Take the free Clarity Check, explore our Labs (free), and sign up for an Info Session to learn
              more.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

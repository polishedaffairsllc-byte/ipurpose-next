import Link from 'next/link';
import PublicHeader from '../components/PublicHeader';
import Footer from '../components/Footer';

type ClarityCheckPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ClarityCheckPage({ searchParams }: ClarityCheckPageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
    } else if (value !== undefined) {
      query.set(key, value);
    }
  }

  const qs = query.toString();
  const ctaHref = qs ? `/clarity-check-quiz?${qs}` : '/clarity-check-quiz';
  return (
    <div className="relative min-h-screen bg-white">
      {/* Public Header */}
      <PublicHeader />
      
      {/* Hero — everything above the fold */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-4 sm:px-6 overflow-hidden"
        style={{
          backgroundImage: 'url(/images/cosmic-timetraveler-Gg6Oz8026C8-unsplash.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          /* fill viewport minus header height so CTA is always visible */
          minHeight: 'calc(100svh - 64px)',
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-5 max-w-xl mx-auto">
          {/* Continuity line — mirrors ad hook */}
          <p
            className="font-marcellus text-sm sm:text-base tracking-wide"
            style={{ color: 'rgba(255,255,255,0.65)', WebkitTextFillColor: 'rgba(255,255,255,0.65)', fontStyle: 'italic' }}
          >
            You clicked because something resonated. You&rsquo;re in the right place.
          </p>

          {/* Outcome-focused headline */}
          <h1
            className="font-italiana text-2xl sm:text-3xl md:text-4xl leading-snug tracking-tight"
            style={{ color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF' }}
          >
            Find Out Exactly Where You&rsquo;re Stuck&nbsp;&mdash; In&nbsp;Under&nbsp;3&nbsp;Minutes
          </h1>

          {/* Sub-headline — twelve questions context */}
          <p
            className="font-italiana text-lg sm:text-xl"
            style={{ color: 'rgba(255,255,255,0.8)', WebkitTextFillColor: 'rgba(255,255,255,0.8)' }}
          >
            12 quick questions to see where you&rsquo;re stuck and what direction actually fits you
          </p>

          {/* Friction-reducing proof points — prominent, right above CTA */}
          <p
            className="font-marcellus text-base sm:text-lg md:text-xl tracking-wide"
            style={{ color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF' }}
          >
            No sign-up required&ensp;·&ensp;Just honest answers&ensp;·&ensp;100% free
          </p>

          {/* Bridge line — speaks to career-mode visitors */}
          <p
            className="font-marcellus text-sm sm:text-base italic max-w-sm"
            style={{ color: 'rgba(255,255,255,0.7)', WebkitTextFillColor: 'rgba(255,255,255,0.7)' }}
          >
            If you&rsquo;ve been feeling like something needs to change but you can&rsquo;t quite name what &mdash; this will help.
          </p>

          {/* Primary CTA — large, unmissable, with pulse glow */}
          <Link
            href={ctaHref}
            className="mt-2 inline-block w-full max-w-md px-8 py-4 sm:py-5 rounded-full font-marcellus text-white text-center text-lg sm:text-xl font-bold tracking-wide hover:scale-[1.03] hover:opacity-95 active:scale-100 transition-all animate-[ctaPulse_2s_ease-in-out_infinite]"
            style={{ background: 'linear-gradient(135deg, #9C88FF 0%, #b8a9ff 100%)' }}
          >
            Start My Clarity Check →
          </Link>


        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

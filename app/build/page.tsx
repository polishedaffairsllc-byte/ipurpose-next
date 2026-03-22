import { Metadata } from 'next';
import { getCanonicalMetadata } from '@/lib/canonical';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { getEnrollableCohort } from '@/lib/accelerator/stages';
import PublicHeader from '../components/PublicHeader';
import Footer from '../components/Footer';
import AcceleratorEnrollButton from './AcceleratorEnrollButton';

export const metadata: Metadata = {
  title: 'iPurpose Accelerator™ — Build a Business Around Who You Actually Are',
  description:
    "A 6-week accelerator for purpose-driven entrepreneurs who are done following frameworks that weren't built around who they actually are.",
  openGraph: {
    title: 'iPurpose Accelerator™ — Build a Business Around Who You Actually Are',
    description:
      'Soul → Systems → AI™. Six weeks to clarify your purpose and build aligned systems that actually fit you.',
    type: 'website',
  },
  robots: 'index, follow',
  alternates: getCanonicalMetadata('/build'),
};

const EARLY_BIRD_SEATS = 4;
const TOTAL_SEATS = 8;
const REGULAR_PRICE = 1997;
const EARLY_BIRD_PRICE = 1497;

async function getPricing(cohortId: string) {
  try {
    const earlyBirdPriceId = process.env.STRIPE_PRICE_ID_ACCELERATOR_EARLY_BIRD;
    if (!earlyBirdPriceId) {
      return { isEarlyBird: false, price: REGULAR_PRICE, seatsRemaining: TOTAL_SEATS, earlyBirdRemaining: 0 };
    }
    const db = firebaseAdmin.firestore();
    const snap = await db
      .collection('enrollments')
      .where('product', '==', 'accelerator')
      .where('cohort', '==', cohortId)
      .count()
      .get();

    const totalEnrolled = snap.data().count;
    const earlyBirdRemaining = Math.max(0, EARLY_BIRD_SEATS - totalEnrolled);
    const seatsRemaining = Math.max(0, TOTAL_SEATS - totalEnrolled);

    return {
      isEarlyBird: earlyBirdRemaining > 0,
      price: earlyBirdRemaining > 0 ? EARLY_BIRD_PRICE : REGULAR_PRICE,
      seatsRemaining,
      earlyBirdRemaining,
    };
  } catch {
    return { isEarlyBird: false, price: REGULAR_PRICE, seatsRemaining: TOTAL_SEATS, earlyBirdRemaining: 0 };
  }
}

const WEEKS = [
  { n: '01', title: 'Who You Are', body: 'Your archetype, core values, and energetic wiring. The foundation everything else is built on.' },
  { n: '02', title: 'Money Healing', body: 'The beliefs that quietly block revenue. We surface them, name them, and begin to move through them.' },
  { n: '03', title: 'Signature Offer Creation', body: "Your offer — built around who you actually are, not a template someone else filled in." },
  { n: '04', title: 'Systems + AI', body: 'The workflows and AI tools that match your working style. Automation that amplifies your voice instead of replacing it.' },
  { n: '05', title: 'Brand + Presence', body: 'How you show up — your content, your positioning, your market presence — as yourself. Not a performance.' },
  { n: '06', title: 'Launch + Integration', body: "Your first real steps into aligned revenue. A launch plan you'll actually follow because it fits how you operate." },
];

const FORMAT_CARDS = [
  { label: 'Cohort size', body: 'Maximum 8 participants. Small enough that you are seen, heard, and actually supported.' },
  { label: 'Live sessions', body: 'Fridays — choose 11AM ET or 7PM ET. Attend the session that fits your life.' },
  { label: 'Weekly rhythm', body: 'Core curriculum Monday–Wednesday. Integration Thursday. Live cohort call Friday.' },
  { label: 'Time commitment', body: '3–4 hours per week. 90 minutes live, the rest self-guided at your own pace.' },
  { label: 'Platform', body: 'Everything lives inside the iPurpose platform — curriculum, AI tools, community, and your personal Clarity Blueprint.' },
];

const INCLUDES = [
  'Full 6-week Accelerator',
  'Live Friday sessions (choose your time)',
  'iPurpose platform access',
  'AI tools matched to your archetype',
  'Clarity Blueprint document',
  'Small cohort community',
];

const BTN_GOLD =
  'font-marcellus text-sm tracking-widest uppercase px-10 py-4 rounded-sm transition-all duration-200 hover:opacity-90 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed';

const BTN_GOLD_STYLE = { background: '#e6c87c', color: '#2e3050' };

export default async function BuildPage() {
  const cohort = getEnrollableCohort();
  const cohortStart = new Date(cohort.startDate);
  const cohortMonth = cohortStart.toLocaleString('default', { month: 'long' });
  const cohortYear = cohortStart.getFullYear();

  const { isEarlyBird, price, seatsRemaining, earlyBirdRemaining } = await getPricing(cohort.id);
  const isSoldOut = seatsRemaining === 0;
  const earlyBirdSoldOut = earlyBirdRemaining === 0;
  const standardRemaining = Math.max(0, seatsRemaining - earlyBirdRemaining);

  return (
    <div className="min-h-screen" style={{ background: '#fdfaf7', fontFamily: "'Marcellus', Georgia, serif", color: '#4B4E6D' }}>
      <PublicHeader />

      {/* ── HERO ── */}
      <div
        className="relative text-center overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #2e3050 0%, #4B4E6D 60%, #6b5b8e 100%)',
          padding: 'clamp(80px, 10vw, 120px) 24px 80px',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 70% 30%, rgba(156,136,255,0.18) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(252,196,183,0.12) 0%, transparent 50%)',
          }}
        />

        <p style={{ fontFamily: "'Marcellus', serif", fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#e6c87c', opacity: 0.9, marginBottom: '24px', position: 'relative' }}>
          iPurpose Accelerator™ · Summer {cohortYear}
        </p>

        <h1
          className="relative mx-auto mb-7"
          style={{
            fontFamily: "'Italiana', serif",
            fontSize: 'clamp(36px, 6vw, 70px)',
            maxWidth: '820px',
            lineHeight: 1.1,
            color: '#ffffff',
          }}
        >
          You&rsquo;ve been building the right business{' '}
          <em style={{ color: '#fcc4b7', fontStyle: 'italic' }}>for the wrong version of you.</em>
        </h1>

        <p
          className="relative mx-auto mb-12 leading-[1.65]"
          style={{ fontSize: 'clamp(16px, 2vw, 20px)', maxWidth: '560px', color: 'rgba(253,250,247,0.9)' }}
        >
          A 6-week accelerator for purpose-driven entrepreneurs and coaches who are done following
          frameworks that weren&rsquo;t built around who they actually are.
        </p>

        <div className="relative flex flex-col items-center gap-4">
          <AcceleratorEnrollButton
            price={price}
            isEarlyBird={isEarlyBird}
            isSoldOut={isSoldOut}
            className={BTN_GOLD}
            style={BTN_GOLD_STYLE}
            label="Claim Your Seat"
          />
          <p style={{ color: 'rgba(253,250,247,0.6)', fontSize: '12px', letterSpacing: '0.05em' }}>
            Starts {cohortMonth} 1, {cohortYear}&nbsp;·&nbsp;{TOTAL_SEATS} seats maximum&nbsp;·&nbsp;One-time investment
          </p>
        </div>

        <p className="relative mt-14 text-xl tracking-[0.3em] opacity-40" style={{ color: '#e6c87c' }}>✦ ✦ ✦</p>
      </div>

      {/* ── IS THIS YOU ── */}
      <div className="py-20 px-6" style={{ background: '#F5F7FA' }}>
        <div className="max-w-[780px] mx-auto">
          <p style={{ fontFamily: "'Marcellus', serif", fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9C88FF', marginBottom: '16px' }}>
            Before we go further
          </p>
          <h2
            className="mb-6"
            style={{ fontFamily: "'Italiana', serif", fontSize: 'clamp(26px, 4vw, 42px)', color: '#2e3050' }}
          >
            You&rsquo;ve done the work. Taken the courses. Followed the strategies.
          </h2>
          <p style={{ color: '#4a4a5a', marginBottom: '32px', lineHeight: 1.75 }}>
            And yet something keeps not quite fitting. Not because you&rsquo;re doing it wrong — but
            because the framework was never built around <em>you</em>.
          </p>
          <ul>
            {[
              "You know your purpose lives somewhere inside you — but you haven't found the right language for it yet",
              "You've tried business models that worked for someone else and quietly wondered why they feel so heavy",
              "You're ready to use AI and systems — but you want them to serve your vision, not override your voice",
              "You want a business that's profitable and feels like you — not a performance of someone else's success",
              "You're willing to do the inner work if it leads to real, tangible, outer results",
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-4 py-4 list-none"
                style={{ borderBottom: '1px solid rgba(75,78,109,0.1)', color: '#4B4E6D', lineHeight: 1.65 }}
              >
                <span style={{ color: '#9C88FF', flexShrink: 0, marginTop: '2px' }}>→</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── VIDEO ── */}
      <div className="py-20 px-6 text-center" style={{ background: '#2e3050' }}>
        <p style={{ fontFamily: "'Marcellus', serif", fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#e6c87c', opacity: 0.8, marginBottom: '16px' }}>
          Why I built this
        </p>
        <h2
          className="mb-3"
          style={{ fontFamily: "'Italiana', serif", fontSize: 'clamp(26px, 4vw, 42px)', color: '#ffffff' }}
        >
          This is personal.
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '480px', margin: '0 auto 40px', lineHeight: 1.75 }}>
          I lost my job. And I realized I had outgrown who they wanted me to be. Here’s what
          happened next.
        </p>
        <div
          className="relative mx-auto rounded-sm shadow-[0_24px_60px_rgba(0,0,0,0.5)] overflow-hidden"
          style={{ width: '100%', maxWidth: '320px', aspectRatio: '9/16', background: '#000' }}
        >
          <video
            className="absolute inset-0 w-full h-full"
            style={{ objectFit: 'cover' }}
            src="/videos/accelerator-founder.mp4"
            controls
            playsInline
            preload="metadata"
          />
        </div>
      </div>

      {/* ── PHILOSOPHY ── */}
      <section className="py-20 px-6 max-w-[780px] mx-auto">
        <p style={{ fontFamily: "'Marcellus', serif", fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9C88FF', marginBottom: '16px' }}>
          The philosophy
        </p>
        <h2
          className="mb-6"
          style={{ fontFamily: "'Italiana', serif", fontSize: 'clamp(26px, 4vw, 42px)', color: '#2e3050' }}
        >
          Soul → Systems → AI™
        </h2>
        <p style={{ color: '#4a4a5a', marginBottom: '20px', lineHeight: 1.75 }}>
          Most business programs start with strategy. iPurpose starts with you — your archetype, your
          values, the way you&rsquo;re uniquely wired to work and lead. Everything else gets built on
          top of that foundation.
        </p>
        <p style={{ color: '#4a4a5a', marginBottom: '20px' }}>Not the other way around.</p>
        <p style={{ color: '#4a4a5a', lineHeight: 1.75 }}>
          Because a business built around who you actually are is not just more fulfilling. It is more
          sustainable, more differentiated, and far easier to sell — because it is genuinely yours.
        </p>
      </section>

      {/* ── CURRICULUM ── */}
      <section className="py-20 px-6 max-w-[780px] mx-auto">
        <p style={{ fontFamily: "'Marcellus', serif", fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9C88FF', marginBottom: '16px' }}>
          The 6-week journey
        </p>
        <h2
          className="mb-4"
          style={{ fontFamily: "'Italiana', serif", fontSize: 'clamp(26px, 4vw, 42px)', color: '#2e3050' }}
        >
          What we build, together.
        </h2>
        <p style={{ color: '#4a4a5a', marginBottom: '40px', lineHeight: 1.75 }}>
          Each week moves from the inside out. We begin with who you are and end with your first steps
          into aligned revenue.
        </p>

        {/* Money Healing featured callout */}
        <div
          className="rounded-sm mb-10"
          style={{
            background: 'linear-gradient(135deg, #3a2d5e 0%, #4B4E6D 100%)',
            borderLeft: '4px solid #e6c87c',
            padding: 'clamp(32px, 5vw, 48px) clamp(24px, 5vw, 40px)',
          }}
        >
          <p style={{ fontFamily: "'Marcellus', serif", fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#e6c87c', opacity: 0.8, marginBottom: '12px' }}>
            Week 2 — Featured
          </p>
          <h3
            style={{ fontFamily: "'Italiana', serif", fontSize: '30px', fontWeight: 400, color: '#ffffff', marginBottom: '16px' }}
          >
            Money Healing
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '15px', lineHeight: 1.7, margin: 0 }}>
            Most business programs skip this entirely. We don&rsquo;t. Before you can build a
            profitable business, you need to look honestly at the beliefs, stories, and wounds that
            quietly block revenue — the ones that make you underprice, over-deliver, or freeze before
            you ever hit send on the offer. Week 2 is where that changes.
          </p>
        </div>

        {/* Week grid */}
        <div>
          {WEEKS.map(({ n, title, body }) => (
            <div
              key={n}
              className="grid py-7 items-start"
              style={{ gridTemplateColumns: '72px 1fr', gap: '24px', borderBottom: '1px solid rgba(75,78,109,0.1)' }}
            >
              <span
                style={{
                  fontFamily: "'Italiana', serif",
                  fontSize: '40px',
                  color: '#9C88FF',
                  opacity: 0.35,
                  lineHeight: 1,
                }}
              >
                {n}
              </span>
              <div>
                <h4
                  className="mb-1.5"
                  style={{ fontFamily: "'Italiana', serif", fontSize: '21px', fontWeight: 400, color: '#2e3050' }}
                >
                  {title}
                </h4>
                <p style={{ fontSize: '15px', color: '#6b6b80', margin: 0, lineHeight: 1.65 }}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FORMAT ── */}
      <div className="py-20 px-6" style={{ background: '#F5F7FA' }}>
        <div className="max-w-[780px] mx-auto">
          <p style={{ fontFamily: "'Marcellus', serif", fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9C88FF', marginBottom: '16px' }}>
            How it works
          </p>
          <h2
            className="mb-10"
            style={{ fontFamily: "'Italiana', serif", fontSize: 'clamp(26px, 4vw, 42px)', color: '#2e3050' }}
          >
            Intimate. Live. Yours to keep.
          </h2>
          <div
            className="grid gap-6"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
          >
            {FORMAT_CARDS.map(({ label, body }) => (
              <div
                key={label}
                className="bg-white p-7 rounded-sm"
                style={{ borderTop: '3px solid #9C88FF' }}
              >
                <p style={{ fontFamily: "'Marcellus', serif", fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9C88FF', marginBottom: '10px' }}>
                  {label}
                </p>
                <p style={{ fontSize: '15px', color: '#4B4E6D', lineHeight: 1.65, margin: 0 }}>{body}</p>
              </div>
            ))}
            <div
              className="bg-white p-7 rounded-sm"
              style={{ borderTop: '3px solid #9C88FF' }}
            >
              <p style={{ fontFamily: "'Marcellus', serif", fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9C88FF', marginBottom: '10px' }}>
                Starts
              </p>
              <p style={{ fontSize: '15px', color: '#4B4E6D', lineHeight: 1.65, margin: 0 }}>
                {cohortMonth} 1, {cohortYear}. Enrollment closes when the 8 seats are filled — not
                on a fixed date.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── PRICING ── */}
      <div id="enroll" className="py-20 px-6 text-center" style={{ background: '#2e3050' }}>
        <p style={{ fontFamily: "'Marcellus', serif", fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#e6c87c', opacity: 0.8, marginBottom: '16px' }}>
          Investment
        </p>
        <h2
          className="mb-4"
          style={{ fontFamily: "'Italiana', serif", fontSize: 'clamp(26px, 4vw, 42px)', color: '#ffffff' }}
        >
          Choose your entry point.
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '500px', margin: '0 auto 48px', lineHeight: 1.75 }}>
          Both options include full access to all 6 weeks, the iPurpose platform, live Friday
          sessions, and your Clarity Blueprint.
        </p>

        <div className="flex flex-wrap justify-center gap-6 max-w-[700px] mx-auto mb-12">
          {/* Early Bird Card */}
          <div
            className="flex-1 rounded-sm p-10 text-left transition-opacity"
            style={{
              minWidth: '240px',
              maxWidth: '300px',
              background: earlyBirdSoldOut ? 'rgba(255,255,255,0.04)' : 'rgba(230,200,124,0.08)',
              border: earlyBirdSoldOut ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e6c87c',
              opacity: earlyBirdSoldOut ? 0.45 : 1,
            }}
          >
            <p style={{ fontFamily: "'Marcellus', serif", fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#e6c87c', marginBottom: '12px' }}>
              {earlyBirdSoldOut
                ? 'Early Bird — Sold Out'
                : `Early Bird — ${earlyBirdRemaining} of ${EARLY_BIRD_SEATS} seats left`}
            </p>
            <p
              className="leading-none mb-2"
              style={{ fontFamily: "'Italiana', serif", fontSize: '50px', color: '#ffffff' }}
            >
              $1,497
            </p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '28px' }}>One-time payment · Save $500</p>
            <ul className="space-y-0 list-none p-0 m-0">
              {INCLUDES.map((item) => (
                <li
                  key={item}
                  className="flex gap-2.5 py-1.5 list-none"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', fontSize: '14px', color: 'rgba(255,255,255,0.75)' }}
                >
                  <span style={{ color: '#e6c87c', fontSize: '10px', marginTop: '3px', flexShrink: 0 }}>✦</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Standard Card */}
          <div
            className="flex-1 rounded-sm p-10 text-left transition-opacity"
            style={{
              minWidth: '240px',
              maxWidth: '300px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              opacity: isSoldOut && !earlyBirdSoldOut ? 1 : isSoldOut ? 0.45 : 1,
            }}
          >
            <p style={{ fontFamily: "'Marcellus', serif", fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#e6c87c', marginBottom: '12px' }}>
              {isSoldOut
                ? 'Standard — Sold Out'
                : `Standard — ${standardRemaining} of ${TOTAL_SEATS - EARLY_BIRD_SEATS} seats left`}
            </p>
            <p
              className="leading-none mb-2"
              style={{ fontFamily: "'Italiana', serif", fontSize: '50px', color: '#ffffff' }}
            >
              $1,997
            </p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '28px' }}>One-time payment</p>
            <ul className="space-y-0 list-none p-0 m-0">
              {INCLUDES.map((item) => (
                <li
                  key={item}
                  className="flex gap-2.5 py-1.5 list-none"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', fontSize: '14px', color: 'rgba(255,255,255,0.75)' }}
                >
                  <span style={{ color: '#e6c87c', fontSize: '10px', marginTop: '3px', flexShrink: 0 }}>✦</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <AcceleratorEnrollButton
          price={price}
          isEarlyBird={isEarlyBird}
          isSoldOut={isSoldOut}
          className={BTN_GOLD}
          style={BTN_GOLD_STYLE}
          label="Claim Your Seat"
        />
        <p style={{ marginTop: '20px', color: 'rgba(255,255,255,0.4)', fontSize: '13px', letterSpacing: '0.05em' }}>
          8 seats total. No exceptions. When it&rsquo;s full, it&rsquo;s full.
        </p>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div className="py-20 px-6" style={{ background: '#F5F7FA' }}>
        <div className="max-w-[780px] mx-auto">
          <p style={{ fontFamily: "'Marcellus', serif", fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9C88FF', marginBottom: '16px' }}>
            From the community
          </p>
          <h2
            className="mb-4"
            style={{ fontFamily: "'Italiana', serif", fontSize: 'clamp(26px, 4vw, 42px)', color: '#2e3050' }}
          >
            What participants are saying.
          </h2>
          <p style={{ color: '#6b6b80', marginBottom: '40px', lineHeight: 1.75 }}>
            Beta cohort results and testimonials will appear here after the first program completes.
            Real words from real participants — with their permission.
          </p>
          <div
            className="grid gap-6"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-sm"
                style={{ borderBottom: '3px solid #fcc4b7' }}
              >
                <p style={{ fontSize: '14px', color: '#bbb', fontStyle: 'italic', lineHeight: 1.65, marginBottom: '20px' }}>
                  [Beta participant testimonial — to be added after cohort completion.]
                </p>
                <p style={{ fontFamily: "'Marcellus', serif", fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9C88FF', margin: 0 }}>
                  — Participant Name, Location
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ABOUT RENITA ── */}
      <section className="py-20 px-6 max-w-[780px] mx-auto">
        <p style={{ fontFamily: "'Marcellus', serif", fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9C88FF', marginBottom: '16px' }}>
          The founder
        </p>
        <h2
          className="mb-6"
          style={{ fontFamily: "'Italiana', serif", fontSize: 'clamp(26px, 4vw, 42px)', color: '#2e3050' }}
        >
          Renita Hamilton
        </h2>
        <blockquote
          className="my-8 pl-6 italic leading-[1.5]"
          style={{
            borderLeft: '3px solid #e6c87c',
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(18px, 2.5vw, 22px)',
            color: '#4B4E6D',
          }}
        >
          &ldquo;I lost my job — and realized I had outgrown who they wanted me to be. I needed
          something real. So I built it.&rdquo;
        </blockquote>
        <p style={{ color: '#4a4a5a', marginBottom: '20px', lineHeight: 1.75 }}>
          Renita Hamilton is a strategist and entrepreneur working at the intersection of alignment,
          systems, and technology. She has led digital transformation for three national nonprofits,
          guided 50+ leaders through strategic transitions, and spoken on spirituality and technology
          at national events.
        </p>
        <p style={{ color: '#4a4a5a', marginBottom: '20px', lineHeight: 1.75 }}>
          She created iPurpose from a simple belief rooted in lived experience: you should not have to
          choose between meaning and practicality. Between the business that pays and the life that
          fits.
        </p>
        <p style={{ color: '#4a4a5a', lineHeight: 1.75 }}>
          The Soul → Systems → AI™ method is the framework she wishes had existed when she needed it
          most.
        </p>
      </section>

      {/* ── FINAL CTA ── */}
      <div
        className="py-24 px-6 text-center"
        style={{ background: 'linear-gradient(160deg, #2e3050 0%, #5a3d6e 100%)' }}
      >
        <p style={{ fontFamily: "'Marcellus', serif", fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#e6c87c', opacity: 0.8, marginBottom: '24px' }}>
          Summer {cohortYear} Cohort
        </p>
        <div
          className="inline-block text-[13px] tracking-[0.15em] uppercase px-6 py-2.5 rounded-sm mb-8"
          style={{
            color: '#e6c87c',
            background: 'rgba(230,200,124,0.15)',
            border: '1px solid rgba(230,200,124,0.3)',
          }}
        >
          {isSoldOut
            ? 'Fully Enrolled'
            : `${seatsRemaining} seat${seatsRemaining === 1 ? '' : 's'} remaining · Starts ${cohortMonth} 1, ${cohortYear}`}
        </div>
        <h2
          className="mx-auto mb-5"
          style={{
            fontFamily: "'Italiana', serif",
            fontSize: 'clamp(30px, 5vw, 54px)',
            maxWidth: '680px',
            lineHeight: 1.15,
            color: '#ffffff',
          }}
        >
          Your purpose isn&rsquo;t lost.
          <br />
          It&rsquo;s waiting for the right structure.
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '480px', margin: '0 auto 40px', lineHeight: 1.75 }}>
          If you’ve read this far, you already know. The only question is whether you’ll
          let yourself say yes.
        </p>
        <AcceleratorEnrollButton
          price={price}
          isEarlyBird={isEarlyBird}
          isSoldOut={isSoldOut}
          className={BTN_GOLD}
          style={BTN_GOLD_STYLE}
          label="Claim Your Seat Now"
        />
      </div>

      {/* ── FTC DISCLAIMER ── */}
      <div className="py-10 px-6 text-center" style={{ background: '#f0eeeb' }}>
        <p style={{ maxWidth: '700px', margin: '0 auto', fontSize: '12px', color: '#999', lineHeight: 1.7 }}>
          <strong>Income &amp; Results Disclaimer:</strong> iPurpose Accelerator™ is an educational
          and coaching program. Results mentioned on this page and across iPurpose materials are
          individual examples and are not guaranteed. Your results will vary based on your background,
          experience, effort, and market conditions. The figures referenced are not typical and should
          not be interpreted as a promise or guarantee of earnings. iPurpose makes no assurance that
          you will achieve similar results. This program is not a get-rich-quick scheme. Building a
          purpose-aligned business requires consistent work, commitment, and time.
        </p>
      </div>

      <Footer />
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import PublicHeader from '../components/PublicHeader';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'Pilot Collaboration · iPurpose × She Leads Africa',
  description:
    'A 90-minute live workshop for women founders and creators ready to align who they are with the work they\'re building.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SheLeadsAfricaPage() {
  return (
    <div className="relative min-h-screen" style={{ backgroundColor: '#fff3da' }}>
      <PublicHeader />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        className="relative w-full px-6 py-16 text-center"
        style={{
          background: 'linear-gradient(160deg, #4b4e6d 0%, #2e3050 100%)',
        }}
      >
        {/* Pilot badge */}
        <div className="inline-flex items-center gap-2 mb-6 px-5 py-2 rounded-full border border-white/20 text-xs font-semibold tracking-widest uppercase"
          style={{ color: '#d4af37', backgroundColor: 'rgba(212,175,55,0.08)' }}>
          ✦ Pilot Collaboration · Private
        </div>

        <p
          className="text-sm font-semibold tracking-widest uppercase mb-4"
          style={{ color: '#9c88ff' }}
        >
          iPurpose × She Leads Africa
        </p>

        <h1
          className="font-marcellus text-4xl sm:text-5xl md:text-6xl leading-tight mb-4 max-w-4xl mx-auto"
          style={{ color: '#ffffff' }}
        >
          Build Your Purpose<br />
          <span style={{ color: '#fcc4b7' }}>→ Income Blueprint</span>
        </h1>

        <p
          className="text-lg sm:text-xl max-w-2xl mx-auto mb-8 leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.75)' }}
        >
          Clarity &amp; Direction for Women Founders
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-8 text-sm font-medium"
          style={{ color: 'rgba(255,255,255,0.70)' }}>
          <span className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/15">⏱ 90 MINUTES · LIVE</span>
          <span className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/15">🌍 VIRTUAL · INTERNATIONAL</span>
          <span className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/15">✦ SOUL → SYSTEMS → AI</span>
        </div>

        {/* Value callout */}
        <div
          className="inline-block px-6 py-3 rounded-full text-sm font-semibold tracking-wide"
          style={{ backgroundColor: 'rgba(252,196,183,0.15)', color: '#fcc4b7', border: '1px solid rgba(252,196,183,0.25)' }}
        >
          Presented at no cost to participants
        </div>
      </section>

      {/* ── WHY THIS EXISTS ──────────────────────────────────── */}
      <section className="px-6 py-14 max-w-3xl mx-auto">
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-3"
          style={{ color: '#9c88ff' }}
        >
          Why This Workshop Exists
        </p>
        <h2
          className="font-marcellus text-3xl sm:text-4xl mb-5 leading-snug"
          style={{ color: '#4b4e6d' }}
        >
          Many founders are not lacking ambition —<br />
          <span style={{ color: '#9c88ff' }}>they are lacking a clear framework.</span>
        </h2>
        <p className="text-base leading-7 mb-4" style={{ color: '#4b4e6d', opacity: 0.8 }}>
          They have the drive, skills, and community, but need clarity and direction for turning who they are into something that works.
        </p>
        <p className="text-base leading-7" style={{ color: '#4b4e6d', opacity: 0.8 }}>
          This session closes that gap. In 90 minutes, participants move from scattered and stuck to grounded and directed — leaving with a concrete blueprint they can act on <strong>the same day.</strong>
        </p>
      </section>

      {/* ── FRAMEWORK ────────────────────────────────────────── */}
      <section
        className="px-6 py-14"
        style={{ backgroundColor: '#4b4e6d' }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: '#9c88ff' }}
          >
            The Framework
          </p>
          <h2
            className="font-marcellus text-3xl sm:text-4xl mb-10"
            style={{ color: '#ffffff' }}
          >
            Soul → Systems → AI
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                label: 'SOUL',
                sub: 'Who You Are',
                body: 'Identify your Core Identity — what you do effortlessly that others find extraordinary.',
                accent: '#9c88ff',
              },
              {
                num: '02',
                label: 'SYSTEMS',
                sub: 'What You Build',
                body: 'Define your Offer Direction — the problem you solve and the person you solve it for.',
                accent: '#fcc4b7',
              },
              {
                num: '03',
                label: 'AI',
                sub: 'How You Scale',
                body: 'Identify your Next Lever — what grows beyond your time and energy.',
                accent: '#d4af37',
              },
            ].map((step) => (
              <div
                key={step.num}
                className="rounded-2xl p-8 text-left"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: `1px solid ${step.accent}30` }}
              >
                <div
                  className="text-xs font-semibold tracking-widest mb-3"
                  style={{ color: step.accent }}
                >
                  {step.num} · {step.label}
                </div>
                <h3
                  className="font-marcellus text-xl mb-3"
                  style={{ color: '#ffffff' }}
                >
                  {step.sub}
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: '1.65' }}>
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SESSION AGENDA ───────────────────────────────────── */}
      <section className="px-6 py-14 max-w-3xl mx-auto">
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-3"
          style={{ color: '#9c88ff' }}
        >
          Session Agenda
        </p>
        <h2
          className="font-marcellus text-3xl sm:text-4xl mb-8"
          style={{ color: '#4b4e6d' }}
        >
          90 Minutes, Structured to Deliver
        </h2>

        <div className="space-y-3">
          {[
            { time: '0–15 min', title: 'The Clarity Gap', desc: 'Why founders stall. Framing the problem this session solves.' },
            { time: '15–40 min', title: 'Soul — Who You Are', desc: 'Guided identity exercise. Participants write their Core Identity statement.' },
            { time: '40–65 min', title: 'Systems — What You Build', desc: 'Define the offer direction: problem, person, and positioning in plain language.' },
            { time: '65–80 min', title: 'AI — How You Scale', desc: 'Identify one leverage point — what grows beyond their time and energy.' },
            { time: '80–90 min', title: 'Q&A + Next Steps', desc: 'Open floor. Participants leave with a completed Blueprint and clear direction.' },
          ].map((item, i) => (
            <div
              key={i}
              className="flex gap-5 p-5 rounded-xl"
              style={{ backgroundColor: 'rgba(75,78,109,0.05)', borderLeft: '3px solid #9c88ff' }}
            >
              <div
                className="text-xs font-semibold tracking-widest shrink-0 pt-1"
                style={{ color: '#9c88ff', minWidth: '4.5rem' }}
              >
                {item.time}
              </div>
              <div>
                <div className="font-semibold mb-1" style={{ color: '#4b4e6d' }}>
                  {item.title}
                </div>
                <div style={{ color: '#4b4e6d', opacity: 0.7, lineHeight: '1.55' }}>
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PARTICIPANTS LEAVE WITH ───────────────────────────── */}
      <section
        className="px-6 py-14"
        style={{ background: 'linear-gradient(135deg, rgba(156,136,255,0.08) 0%, rgba(252,196,183,0.12) 100%)' }}
      >
        <div className="max-w-3xl mx-auto">
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: '#9c88ff' }}
          >
            Participants Leave With
          </p>
          <h2
            className="font-marcellus text-3xl sm:text-4xl mb-8"
            style={{ color: '#4b4e6d' }}
          >
            Tangible Outcomes — Same Day
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'A written Core Identity statement',
              'A clear Offer Direction — the problem they solve and who they solve it for',
              'Their first AI leverage point — what to hand off or build beyond their time',
              'A completed Purpose → Income Blueprint they keep',
              'Grounding tools they can use the same day to stay focused',
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-5 rounded-xl bg-white"
                style={{ border: '1px solid rgba(75,78,109,0.10)' }}
              >
                <span style={{ color: '#88b04b', fontSize: '1.1rem', marginTop: '1px' }}>✓</span>
                <span style={{ color: '#4b4e6d', lineHeight: '1.55' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SESSION FORMAT ───────────────────────────────────── */}
      <section className="px-6 py-14 max-w-3xl mx-auto">
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-3"
          style={{ color: '#9c88ff' }}
        >
          Session Format
        </p>
        <h2
          className="font-marcellus text-3xl sm:text-4xl mb-7"
          style={{ color: '#4b4e6d' }}
        >
          Facilitated — Not a Lecture
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            'Live, facilitated — not a lecture',
            'Guided reflection and writing exercises',
            'Chat-based prompts throughout',
            'Optional live share-outs',
            'Q&A and open conversation at close',
            'Works for any stage — idea to established',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-3 px-4 rounded-lg"
              style={{ backgroundColor: 'rgba(75,78,109,0.04)' }}>
              <span style={{ color: '#d4af37' }}>✦</span>
              <span style={{ color: '#4b4e6d', opacity: 0.85 }}>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FACILITATOR ─────────────────────────────────────── */}
      <section
        className="px-6 py-14"
        style={{ backgroundColor: '#4b4e6d' }}
      >
        <div className="max-w-3xl mx-auto">
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-8"
            style={{ color: '#9c88ff' }}
          >
            About the Facilitator
          </p>
          <div className="flex flex-col sm:flex-row gap-10 items-start">
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full shrink-0 overflow-hidden"
              style={{ border: '2px solid rgba(212,175,55,0.4)' }}
            >
              <Image
                src="/images/renita-hamilton.jpg"
                alt="Renita Hamilton"
                width={112}
                height={112}
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div>
              <h3
                className="font-marcellus text-2xl mb-1"
                style={{ color: '#ffffff' }}
              >
                Renita Hamilton
              </h3>
              <p
                className="text-sm font-semibold tracking-wide mb-6"
                style={{ color: '#9c88ff' }}
              >
                Leadership Strategist · Purpose &amp; Mindset Architect · Founder, iPurpose
              </p>
              <p
                className="text-base mb-5"
                style={{ color: 'rgba(255,255,255,0.70)', lineHeight: '1.65' }}
              >
                Renita is the founder of iPurpose, a soul-led, AI-supported business accelerator built on a single belief: the most sustainable businesses are built on who you actually are. She has guided founders, creators, and career pivoters through the process of turning identity into income with clarity, calm, and a framework that holds.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 text-sm" style={{ color: 'rgba(255,255,255,0.50)' }}>
                <a href="mailto:renita@ipurposesoul.com" className="hover:text-white transition-colors"
                  style={{ color: '#fcc4b7' }}>
                  renita@ipurposesoul.com
                </a>
                <a href="https://ipurposesoul.com" target="_blank" rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity" style={{ color: 'rgba(255,255,255,0.50)' }}>
                  ipurposesoul.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEXT STEPS ───────────────────────────────────────── */}
      <section className="px-6 py-14 max-w-3xl mx-auto">
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-3"
          style={{ color: '#9c88ff' }}
        >
          Next Steps
        </p>
        <h2
          className="font-marcellus text-3xl sm:text-4xl mb-8"
          style={{ color: '#4b4e6d' }}
        >
          Ready to Move Forward?
        </h2>

        <div className="space-y-4 mb-10">
          {[
            {
              num: '01',
              title: 'Works Within Your Telegram Community',
              desc: 'The session is designed to run inside your existing community space — no new platform or tech setup required for your members. Just share an approximate headcount so we can tailor the format.',
            },
            {
              num: '02',
              title: 'Select a Date',
              desc: 'Available from early May onward. Flexible to accommodate your time zone.',
            },
            {
              num: '03',
              title: 'We Handle the Rest',
              desc: 'Full session materials, the Blueprint worksheet, and a post-session feedback form are ready to go.',
            },
          ].map((step) => (
            <div
              key={step.num}
              className="flex gap-6 p-7 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(156,136,255,0.06) 0%, rgba(252,196,183,0.06) 100%)',
                border: '1px solid rgba(75,78,109,0.12)',
              }}
            >
              <div
                className="font-marcellus text-2xl shrink-0"
                style={{ color: '#d4af37' }}
              >
                {step.num}
              </div>
              <div>
                <div className="font-semibold mb-1" style={{ color: '#4b4e6d' }}>
                  {step.title}
                </div>
                <div style={{ color: '#4b4e6d', opacity: 0.7, lineHeight: '1.55' }}>
                  {step.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href="mailto:renita@ipurposesoul.com?subject=She%20Leads%20Africa%20×%20iPurpose%20Pilot%20Collaboration"
            className="inline-block px-10 py-4 rounded-full text-white font-semibold text-base transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(to right, #4b4e6d, #9c88ff)' }}
          >
            Start the Conversation →
          </a>
          <p className="mt-4 text-sm" style={{ color: '#4b4e6d', opacity: 0.55 }}>
            Reply directly to{' '}
            <span style={{ color: '#9c88ff' }}>renita@ipurposesoul.com</span>
          </p>
        </div>
      </section>

      {/* ── FOOTER BADGE ─────────────────────────────────────── */}
      <div
        className="text-center py-10 px-6 text-xs font-semibold tracking-widest uppercase"
        style={{ color: '#4b4e6d', opacity: 0.4, borderTop: '1px solid rgba(75,78,109,0.10)' }}
      >
        A Pilot Collaboration · iPurpose × She Leads Africa · Soul → Systems → AI
      </div>

      <Footer />
    </div>
  );
}

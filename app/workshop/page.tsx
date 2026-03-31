import { Metadata } from 'next';
import { getCanonicalMetadata } from '@/lib/canonical';
import PublicHeader from '../components/PublicHeader';
import Footer from '../components/Footer';
import WorkshopRegisterForm from './WorkshopRegisterForm';

export const metadata: Metadata = {
  title: 'Build Your Purpose → Income Blueprint (Live) — Free Workshop | iPurpose',
  description:
    'Leave with a completed Purpose → Income Blueprint you can actually build from. Free 90-minute live workshop on April 24, 2026.',
  openGraph: {
    title: 'Build Your Purpose → Income Blueprint (Live) — Free Workshop | iPurpose',
    description:
      'Not a webinar. A live working session. 90 minutes. A completed Blueprint. April 24, 2026.',
    type: 'website',
  },
  robots: 'index, follow',
  alternates: getCanonicalMetadata('/workshop'),
};

const C = {
  indigo:    '#4B4E6D',
  lavender:  '#9C88FF',
  peach:     '#fcc4b7',
  mist:      '#F5F7FA',
  champagne: '#e6c87c',
  deep:      '#2e3050',
  warmWhite: '#fdfaf7',
};

const BTN_STYLE: React.CSSProperties = {
  display: 'inline-block',
  background: C.champagne,
  color: C.deep,
  fontFamily: "'Marcellus', Georgia, serif",
  fontSize: 14,
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  padding: '18px 48px',
  borderRadius: 2,
  textDecoration: 'none',
  border: 'none',
  cursor: 'pointer',
};

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
  color: C.lavender,
  marginBottom: 12,
};

export default function WorkshopPage() {
  return (
    <>
      <PublicHeader />

      {/* ── HERO ── */}
      <section style={{
        background: `linear-gradient(160deg, ${C.deep} 0%, ${C.indigo} 60%, #6b5b8e 100%)`,
        color: C.warmWhite,
        padding: '90px 24px 80px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 70% 30%, rgba(156,136,255,0.18) 0%, transparent 60%),
                       radial-gradient(ellipse at 20% 80%, rgba(252,196,183,0.12) 0%, transparent 50%)`,
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: C.champagne, marginBottom: 24, opacity: 0.85 }}>
            Free Live Workshop
          </p>

          <h1 style={{
            fontFamily: "'Italiana', Georgia, serif",
            fontSize: 'clamp(38px, 6vw, 64px)',
            fontWeight: 400,
            color: '#fff',
            maxWidth: 680,
            margin: '0 auto 10px',
            lineHeight: 1.15,
          }}>
            Something isn&rsquo;t working &mdash;<br />
            <em style={{ fontStyle: 'italic', color: C.peach }}>and you can feel it.</em>
          </h1>

          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontSize: 'clamp(17px, 2.5vw, 22px)',
            color: 'rgba(255,255,255,0.72)',
            maxWidth: 540,
            margin: '0 auto 24px',
            lineHeight: 1.65,
          }}>
            You&rsquo;re putting in effort but not getting the results you expected. You&rsquo;re not sure what to focus on next. This workshop is where we figure out exactly what&rsquo;s in the way &mdash; and what to do about it.
          </p>

          <p style={{
            fontFamily: "'Marcellus', Georgia, serif",
            fontSize: 17,
            color: 'rgba(255,255,255,0.85)',
            maxWidth: 520,
            margin: '0 auto 16px',
            lineHeight: 1.7,
          }}>
            Walk away with clarity on what&rsquo;s not working, what to focus on next, and a clear path forward.
          </p>

          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontSize: 16,
            color: 'rgba(255,255,255,0.55)',
            maxWidth: 480,
            margin: '0 auto 36px',
            lineHeight: 1.65,
          }}>
            This is the exact framework I use to help people move from confusion to clarity &mdash; and start making real progress.
          </p>

          <p style={{ fontSize: 13, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.champagne, opacity: 0.8, marginBottom: 32 }}>
            Friday, April 24 &nbsp;&middot;&nbsp; 11:00 AM ET &nbsp;or&nbsp; 7:00 PM ET &nbsp;&middot;&nbsp; Choose one session
          </p>

          <a
            href="#register"
            style={{
              display: 'inline-block',
              background: C.peach,
              color: C.deep,
              fontFamily: "'Italiana', Georgia, serif",
              fontSize: 20,
              padding: '16px 52px',
              borderRadius: 2,
              textDecoration: 'none',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              marginBottom: 20,
            }}
          >
            Join the Free Workshop
          </a>

          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontSize: 14,
            color: 'rgba(255,255,255,0.4)',
            marginTop: 4,
          }}>
            Small group. No replay. Show up live.
          </p>
        </div>
      </section>

      {/* ── REGISTRATION FORM ── */}
      <section id="register" style={{ background: C.warmWhite, padding: '64px 24px' }}>
        <div style={{
          maxWidth: 520,
          margin: '0 auto',
          background: '#fff',
          borderRadius: 4,
          padding: 'clamp(32px, 5vw, 48px) clamp(20px, 5vw, 40px)',
          boxShadow: '0 8px 40px rgba(46,48,80,0.08)',
          borderTop: `4px solid ${C.champagne}`,
        }}>
          <h2 style={{
            fontFamily: "'Italiana', Georgia, serif",
            fontSize: 32,
            fontWeight: 400,
            color: C.deep,
            marginBottom: 8,
            textAlign: 'center',
          }}>
            Save Your Spot
          </h2>
          <p style={{ textAlign: 'center', fontSize: 15, color: '#888', marginBottom: 32 }}>
            Free · April 24, 2026 · 11 AM or 7 PM ET · Live on Zoom
          </p>

          <WorkshopRegisterForm buttonStyle={BTN_STYLE} />
        </div>
      </section>

      {/* ── WHAT YOU'LL BUILD ── */}
      <section style={{ background: C.mist, padding: '64px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <p style={SECTION_LABEL}>What you walk away with</p>
          <h2 style={{
            fontFamily: "'Italiana', Georgia, serif",
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 400,
            color: C.deep,
            marginBottom: 16,
          }}>
            Not just insights. An actual Blueprint.
          </h2>
          <p style={{ color: '#6b6b80', marginBottom: 40, fontSize: 16 }}>
            By the end of this 90-minute session, you will have completed all three sections of your Purpose → Income Blueprint — live, with guidance, in real time.
          </p>

          <div style={{ textAlign: 'left' }}>
            {[
              {
                icon: '🌿',
                title: 'Your Core Identity',
                body: "A clear articulation of what you naturally bring, how you're wired to work, and where your gifts create the most value.",
              },
              {
                icon: '✨',
                title: 'Your Offer Direction',
                body: 'The problem you solve, who you solve it for, and what someone would pay for — built around you, not a template.',
              },
              {
                icon: '🤖',
                title: 'Your Next Lever',
                body: 'The one place AI or systems can amplify what you do — so your work can grow beyond your time.',
              },
            ].map(({ icon, title, body }, i, arr) => (
              <div key={title} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                padding: '20px 0',
                borderBottom: i < arr.length - 1 ? '1px solid rgba(75,78,109,0.1)' : 'none',
              }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'rgba(156,136,255,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  flexShrink: 0,
                  marginTop: 2,
                }}>
                  {icon}
                </div>
                <div>
                  <h4 style={{ fontFamily: "'Italiana', Georgia, serif", fontSize: 20, fontWeight: 400, color: C.deep, marginBottom: 4 }}>
                    {title}
                  </h4>
                  <p style={{ fontSize: 14, color: '#6b6b80' }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '64px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <p style={{ ...SECTION_LABEL, textAlign: 'center' }}>How the 90 minutes flows</p>
          <h2 style={{
            fontFamily: "'Italiana', Georgia, serif",
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 400,
            color: C.deep,
            marginBottom: 32,
            textAlign: 'center',
          }}>
            Simple. Live. Yours to keep.
          </h2>

          <div>
            {[
              {
                num: '01',
                title: 'Soul — Who You Actually Are',
                body: 'We start with your Core Identity — what feels effortless to you and what people already come to you for.',
              },
              {
                num: '02',
                title: "Systems — What You're Building",
                body: 'We translate your identity into an offer direction — the problem you solve and who specifically you solve it for.',
              },
              {
                num: '03',
                title: 'AI — How You Scale',
                body: 'We identify your next lever — the place where AI or systems can extend your reach without replacing your voice.',
              },
              {
                num: '04',
                title: 'Completion + Invitation',
                body: 'You leave with a finished Blueprint and a clear next step. Q&A stays open for anyone who wants to go deeper.',
              },
            ].map(({ num, title, body }, i, arr) => (
              <div key={num} style={{
                display: 'grid',
                gridTemplateColumns: '48px 1fr',
                gap: 20,
                padding: '20px 0',
                borderBottom: i < arr.length - 1 ? '1px solid rgba(75,78,109,0.1)' : 'none',
                alignItems: 'start',
              }}>
                <div style={{
                  fontFamily: "'Italiana', Georgia, serif",
                  fontSize: 36,
                  color: C.lavender,
                  opacity: 0.4,
                  lineHeight: 1,
                }}>
                  {num}
                </div>
                <div>
                  <h4 style={{ fontFamily: "'Italiana', Georgia, serif", fontSize: 20, fontWeight: 400, color: C.deep, marginBottom: 4 }}>
                    {title}
                  </h4>
                  <p style={{ fontSize: 14, color: '#6b6b80' }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NOT A WEBINAR ── */}
      <section style={{
        background: 'linear-gradient(135deg, #3a2d5e 0%, #4B4E6D 100%)',
        padding: '64px 24px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 580, margin: '0 auto' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: C.champagne, opacity: 0.8, marginBottom: 12 }}>
            Let&rsquo;s be honest
          </p>
          <h2 style={{ fontFamily: "'Italiana', Georgia, serif", fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 400, color: '#fff', marginBottom: 20 }}>
            This is not a webinar.
          </h2>
          <blockquote style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontSize: 22,
            color: C.peach,
            borderLeft: `3px solid ${C.champagne}`,
            paddingLeft: 20,
            textAlign: 'left',
            margin: '28px 0',
            lineHeight: 1.5,
          }}>
            &ldquo;This is not a webinar. This is a live working session. You won&rsquo;t just listen — you&rsquo;ll build.&rdquo;
          </blockquote>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 16, marginBottom: 16 }}>
            No slides of information you&rsquo;ll forget by morning. No pitch disguised as value. Just 90 minutes of real work — guided, live, with Renita — that ends with something completed in your hands.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 16 }}>
            If this feels unfinished after — that&rsquo;s not because you did it wrong. It&rsquo;s because this is something meant to be built, not just written. The Accelerator is where that continues.
          </p>
        </div>
      </section>

      {/* ── ABOUT RENITA ── */}
      <section style={{ padding: '64px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <p style={SECTION_LABEL}>Your host</p>
          <h2 style={{ fontFamily: "'Italiana', Georgia, serif", fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 400, color: C.deep, marginBottom: 20 }}>
            Renita Hamilton
          </h2>
          <p style={{ color: '#4a4a5a', marginBottom: 16, fontSize: 16 }}>
            Renita Hamilton is a strategist and entrepreneur working at the intersection of alignment, systems, and technology. She created iPurpose from a simple belief rooted in lived experience — you should not have to choose between meaning and practicality.
          </p>
          <p style={{ color: '#4a4a5a', fontSize: 16 }}>
            The Soul → Systems → AI™ method is the framework she wishes had existed when she needed it most. This workshop is a chance to experience it for yourself, for free, before committing to anything.
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ background: C.deep, padding: '80px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.champagne, opacity: 0.8, marginBottom: 12 }}>
          April 24, 2026 · 11 AM or 7 PM ET · Free · Live on Zoom
        </p>
        <div style={{
          display: 'inline-block',
          background: 'rgba(230,200,124,0.15)',
          border: '1px solid rgba(230,200,124,0.3)',
          color: C.champagne,
          fontSize: 13,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          padding: '10px 24px',
          borderRadius: 2,
          marginBottom: 28,
        }}>
          Spots are limited — register now
        </div>
        <h2 style={{ fontFamily: "'Italiana', Georgia, serif", fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 400, color: '#fff', marginBottom: 16 }}>
          Come build something real.
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: 460, margin: '0 auto 36px', fontSize: 16 }}>
          90 minutes. A completed Blueprint. And a clearer sense of what comes next.
        </p>
        <a href="#register" style={BTN_STYLE}>Save My Spot</a>
      </section>

      {/* ── FTC ── */}
      <section style={{ background: '#f0eeeb', padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ maxWidth: 680, margin: '0 auto', fontSize: 11, color: '#999', lineHeight: 1.7 }}>
          <strong>Results Disclaimer:</strong> iPurpose workshops and programs are educational in nature. Individual outcomes vary based on effort, background, and circumstances. Nothing in this workshop constitutes a guarantee of income or business results. iPurpose Soul LLC · ipurposesoul.com
        </p>
      </section>

      <Footer />
    </>
  );
}

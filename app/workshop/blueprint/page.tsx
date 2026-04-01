'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';

// ── Brand constants ────────────────────────────────────────────────────────
const C = {
  deep:       '#2e3050',
  indigo:     '#4B4E6D',
  lavender:   '#9C88FF',
  peach:      '#fcc4b7',
  champagne:  '#e6c87c',
  warmWhite:  '#fdfaf7',
  mist:       '#F5F7FA',
};

// ── Archetype definitions — matches platform exactly ──────────────────────
const ARCHETYPES = [
  {
    key: 'Visionary',
    icon: '🌬',
    desc: 'Big ideas, broad horizons — needs grounding',
  },
  {
    key: 'Builder',
    icon: '🌱',
    desc: 'Steady, practical — needs meaning before momentum',
  },
  {
    key: 'Nurturer',
    icon: '🌊',
    desc: 'Deeply relational — needs to protect their own energy',
  },
  {
    key: 'Strategist',
    icon: '🧠',
    desc: 'Analytical, forward-thinking — needs to feel, not just think',
  },
  {
    key: 'Creator',
    icon: '✨',
    desc: 'Original, expressive — needs a container for ideas',
  },
];

// ── Types ─────────────────────────────────────────────────────────────────
type BlueprintData = {
  participantName: string;
  workshopDate: string;
  whatIsntWorking: string;
  whatIActuallyWant: string;
  archetype: string;
  archetypeNote: string;
  biggestObstacle: string;
  oneClearNextStep: string;
  commitment: string;
  completedAt?: string;
};

const EMPTY: BlueprintData = {
  participantName: '',
  workshopDate: new Date().toISOString().slice(0, 10),
  whatIsntWorking: '',
  whatIActuallyWant: '',
  archetype: '',
  archetypeNote: '',
  biggestObstacle: '',
  oneClearNextStep: '',
  commitment: '',
};

// ── Shared styles ─────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 10,
  letterSpacing: '0.25em',
  textTransform: 'uppercase',
  color: C.lavender,
  marginBottom: 8,
  fontFamily: "'Marcellus', Georgia, serif",
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  background: C.mist,
  border: `1px solid rgba(75,78,109,0.12)`,
  borderRadius: 3,
  padding: '14px 16px',
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontSize: 17,
  color: C.deep,
  lineHeight: 1.7,
  resize: 'vertical' as const,
  minHeight: 110,
  outline: 'none',
  boxSizing: 'border-box' as const,
  transition: 'border-color 0.2s, background 0.2s',
};

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 2,
  padding: '10px 18px',
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontStyle: 'italic',
  fontSize: 17,
  color: 'white',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box' as const,
  transition: 'border-color 0.2s',
};

// ── Section card ──────────────────────────────────────────────────────────
function SectionCard({
  num,
  eyebrow,
  title,
  prompt,
  children,
}: {
  num: string;
  eyebrow: string;
  title: string;
  prompt: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: C.warmWhite,
        border: '1px solid rgba(75,78,109,0.1)',
        borderRadius: 4,
        marginBottom: 24,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '24px 28px 20px',
          borderBottom: '1px solid rgba(75,78,109,0.08)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 18,
        }}
      >
        <div
          style={{
            fontFamily: "'Italiana', Georgia, serif",
            fontSize: 36,
            color: C.lavender,
            opacity: 0.4,
            lineHeight: 1,
            flexShrink: 0,
            marginTop: -4,
          }}
        >
          {num}
        </div>
        <div style={{ flex: 1 }}>
          <div style={labelStyle}>{eyebrow}</div>
          <h2
            style={{
              fontFamily: "'Italiana', Georgia, serif",
              fontSize: 'clamp(22px, 3vw, 30px)',
              fontWeight: 400,
              color: C.deep,
              marginBottom: 4,
              lineHeight: 1.2,
            }}
          >
            {title}
          </h2>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: 'italic',
              fontSize: 15,
              color: C.indigo,
              opacity: 0.6,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {prompt}
          </p>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '20px 28px 24px' }}>{children}</div>
    </div>
  );
}

// ── Ornament divider ──────────────────────────────────────────────────────
function Ornament() {
  return (
    <div
      style={{
        textAlign: 'center',
        color: C.champagne,
        opacity: 0.35,
        letterSpacing: '0.4em',
        fontSize: 13,
        padding: '4px 0 20px',
      }}
    >
      ✦
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function BlueprintPage() {
  const [data, setData] = useState<BlueprintData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [completed, setCompleted] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load existing draft ───────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/workshop/blueprint');
        if (res.ok) {
          const json = await res.json();
          if (json?.data?.blueprint) {
            const b = json.data.blueprint;
            setData({
              participantName:    b.participantName    || '',
              workshopDate:       b.workshopDate       || new Date().toISOString().slice(0, 10),
              whatIsntWorking:    b.whatIsntWorking    || '',
              whatIActuallyWant:  b.whatIActuallyWant  || '',
              archetype:          b.archetype          || '',
              archetypeNote:      b.archetypeNote      || '',
              biggestObstacle:    b.biggestObstacle    || '',
              oneClearNextStep:   b.oneClearNextStep   || '',
              commitment:         b.commitment         || '',
            });
            if (b.completedAt) setCompleted(true);
          }
        }
      } catch {
        // Non-fatal — they just start fresh
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Auto-save on change (debounced 1.5s) ─────────────────────────────
  const save = useCallback(async (payload: BlueprintData) => {
    setSaving(true);
    setSaveStatus('idle');
    try {
      const res = await fetch('/api/workshop/blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setSaveStatus(res.ok ? 'saved' : 'error');
    } catch {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  }, []);

  const handleChange = useCallback(
    (field: keyof BlueprintData, value: string) => {
      setData((prev) => {
        const next = { ...prev, [field]: value };
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => save(next), 1500);
        return next;
      });
      setSaveStatus('idle');
    },
    [save]
  );

  // ── Progress ──────────────────────────────────────────────────────────
  const sections = [
    data.whatIsntWorking,
    data.whatIActuallyWant,
    data.archetype,
    data.biggestObstacle,
    data.oneClearNextStep,
    data.commitment,
  ];
  const filledCount = sections.filter((v) => v.trim().length > 0).length;
  const progressPct = Math.round((filledCount / 6) * 100);

  // ── Mark complete ─────────────────────────────────────────────────────
  async function markComplete() {
    const payload = { ...data, completedAt: new Date().toISOString() };
    await save(payload);
    setCompleted(true);
  }

  // ── Focus/blur textarea styling ───────────────────────────────────────
  function onFocus(e: React.FocusEvent<HTMLTextAreaElement>) {
    e.currentTarget.style.borderColor = C.lavender;
    e.currentTarget.style.background = 'white';
  }
  function onBlur(e: React.FocusEvent<HTMLTextAreaElement>) {
    e.currentTarget.style.borderColor = 'rgba(75,78,109,0.12)';
    e.currentTarget.style.background = C.mist;
  }

  // ── Workshop date-lock ────────────────────────────────────────────────
  // Blueprint is locked until April 24, 2026 (earliest session 11 AM ET)
  const UNLOCK_DATE = new Date('2026-04-24T11:00:00-04:00');
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const isUnlocked = now >= UNLOCK_DATE;

  // Countdown helpers
  function getCountdown() {
    const diff = UNLOCK_DATE.getTime() - now.getTime();
    if (diff <= 0) return null;
    const days    = Math.floor(diff / 86_400_000);
    const hours   = Math.floor((diff % 86_400_000) / 3_600_000);
    const minutes = Math.floor((diff % 3_600_000) / 60_000);
    const seconds = Math.floor((diff % 60_000) / 1_000);
    return { days, hours, minutes, seconds };
  }
  const countdown = getCountdown();

  if (!loading && !isUnlocked) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Italiana&family=Marcellus&family=Cormorant+Garamond:ital,wght@0,400;1,400&display=swap');
        `}</style>
        <div
          style={{
            minHeight: '100vh',
            background: C.deep,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 24px',
            textAlign: 'center',
          }}
        >
          {/* Eyebrow */}
          <p
            style={{
              fontFamily: "'Marcellus', Georgia, serif",
              fontSize: 10,
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: C.champagne,
              margin: '0 0 20px',
            }}
          >
            iPurpose™ · My Purpose to Income Blueprint
          </p>

          {/* Lock icon */}
          <div style={{ fontSize: 42, marginBottom: 20, opacity: 0.7 }}>🔒</div>

          {/* Title */}
          <h1
            style={{
              fontFamily: "'Italiana', Georgia, serif",
              fontSize: 'clamp(28px, 5vw, 46px)',
              fontWeight: 400,
              color: 'white',
              lineHeight: 1.2,
              margin: '0 0 16px',
              maxWidth: 560,
            }}
          >
            Your Blueprint unlocks<br />on April 24
          </h1>

          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: 'italic',
              fontSize: 18,
              color: 'rgba(255,255,255,0.6)',
              lineHeight: 1.7,
              maxWidth: 440,
              margin: '0 0 40px',
            }}
          >
            We&rsquo;ll open this live together during the workshop.
            For now, just show up — your insights will be waiting here.
          </p>

          {/* Countdown */}
          {countdown && (
            <div
              style={{
                display: 'flex',
                gap: 20,
                justifyContent: 'center',
                marginBottom: 48,
                flexWrap: 'wrap',
              }}
            >
              {[
                { label: 'Days',    value: countdown.days    },
                { label: 'Hours',   value: countdown.hours   },
                { label: 'Minutes', value: countdown.minutes },
                { label: 'Seconds', value: countdown.seconds },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 4,
                    padding: '16px 22px',
                    minWidth: 72,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Italiana', Georgia, serif",
                      fontSize: 38,
                      color: C.champagne,
                      lineHeight: 1,
                      marginBottom: 4,
                    }}
                  >
                    {String(value).padStart(2, '0')}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Marcellus', Georgia, serif",
                      fontSize: 9,
                      letterSpacing: '0.25em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Session details */}
          <div
            style={{
              background: 'rgba(230,200,124,0.08)',
              border: '1px solid rgba(230,200,124,0.2)',
              borderRadius: 4,
              padding: '20px 28px',
              maxWidth: 380,
              marginBottom: 36,
            }}
          >
            <p
              style={{
                fontFamily: "'Marcellus', Georgia, serif",
                fontSize: 11,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: C.champagne,
                margin: '0 0 12px',
              }}
            >
              Workshop Sessions · April 24, 2026
            </p>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 15,
                color: 'rgba(255,255,255,0.7)',
                margin: 0,
                lineHeight: 1.8,
              }}
            >
              11:00 AM ET &nbsp;·&nbsp; Morning Session<br />
              7:00 PM ET &nbsp;&nbsp;·&nbsp; Evening Session
            </p>
          </div>

          {/* CTA to add to calendar / go home */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <a
              href="/dashboard"
              style={{
                display: 'inline-block',
                background: C.peach,
                color: C.deep,
                fontFamily: "'Marcellus', Georgia, serif",
                fontSize: 13,
                letterSpacing: '0.06em',
                padding: '12px 28px',
                borderRadius: 2,
                textDecoration: 'none',
              }}
            >
              Go to Dashboard
            </a>
            <a
              href="/workshop"
              style={{
                display: 'inline-block',
                background: 'transparent',
                color: 'rgba(255,255,255,0.55)',
                fontFamily: "'Marcellus', Georgia, serif",
                fontSize: 13,
                letterSpacing: '0.06em',
                padding: '12px 28px',
                borderRadius: 2,
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              Workshop Details
            </a>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          fontSize: 18,
          color: C.indigo,
          opacity: 0.6,
        }}
      >
        Loading your Blueprint…
      </div>
    );
  }

  return (
    <>
      {/* ── Google Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Italiana&family=Marcellus&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');
        textarea::placeholder { font-style: italic; color: rgba(75,78,109,0.3); }
        textarea:focus { outline: none; }
        input::placeholder { color: rgba(255,255,255,0.3); }
        input:focus { outline: none; }
      `}</style>

      {/* ── COVER ── */}
      <div
        style={{
          background: `linear-gradient(160deg, ${C.deep} 0%, ${C.indigo} 60%, #6b5b8e 100%)`,
          color: C.warmWhite,
          padding: '64px 24px 56px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Radial overlays */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 70% 30%, rgba(156,136,255,0.18) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(252,196,183,0.12) 0%, transparent 50%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto' }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: C.champagne,
              marginBottom: 20,
              opacity: 0.85,
              fontFamily: "'Marcellus', serif",
            }}
          >
            iPurpose · Live Workshop
          </div>

          <h1
            style={{
              fontFamily: "'Italiana', Georgia, serif",
              fontSize: 'clamp(34px, 6vw, 58px)',
              fontWeight: 400,
              color: '#fff',
              marginBottom: 14,
              lineHeight: 1.15,
            }}
          >
            My Purpose to<br />
            <em style={{ fontStyle: 'italic', color: C.peach }}>Income Blueprint</em>
          </h1>

          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontSize: 'clamp(15px, 2.5vw, 18px)',
              color: 'rgba(255,255,255,0.65)',
              maxWidth: 480,
              margin: '0 auto 32px',
              lineHeight: 1.6,
            }}
          >
            Fill this out during the workshop. Your answers are saved automatically — this is your compass going forward.
          </p>

          {/* Name + Date row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
              <label
                htmlFor="participantName"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.45)',
                  fontFamily: "'Marcellus', serif",
                }}
              >
                Your name
              </label>
              <input
                id="participantName"
                type="text"
                value={data.participantName}
                onChange={(e) => handleChange('participantName', e.target.value)}
                placeholder="Write your name here"
                style={{ ...inputStyle, width: 260 }}
                onFocus={(e) => (e.currentTarget.style.borderColor = C.peach)}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
              <label
                htmlFor="workshopDate"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.45)',
                  fontFamily: "'Marcellus', serif",
                }}
              >
                Date
              </label>
              <input
                id="workshopDate"
                type="date"
                value={data.workshopDate}
                onChange={(e) => handleChange('workshopDate', e.target.value)}
                style={{
                  ...inputStyle,
                  width: 160,
                  fontFamily: "'Marcellus', serif",
                  fontStyle: 'normal',
                  fontSize: 14,
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = C.peach)}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── PROGRESS BAR (sticky) ── */}
      <div
        style={{
          background: C.deep,
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          position: 'sticky',
          top: 0,
          zIndex: 100,
          borderBottom: '1px solid rgba(156,136,255,0.15)',
        }}
      >
        <span
          style={{
            fontSize: 11,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: C.champagne,
            opacity: 0.7,
            fontFamily: "'Marcellus', serif",
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          Your progress
        </span>
        <div
          style={{
            flex: 1,
            height: 3,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              background: `linear-gradient(90deg, ${C.lavender}, ${C.peach})`,
              borderRadius: 2,
              width: `${progressPct}%`,
              transition: 'width 0.4s ease',
            }}
          />
        </div>
        <span
          style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.4)',
            fontFamily: "'Marcellus', serif",
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {filledCount} of 6 complete
        </span>
        {/* Save indicator */}
        <span
          style={{
            fontSize: 11,
            fontFamily: "'Marcellus', serif",
            color:
              saving ? 'rgba(255,255,255,0.4)' :
              saveStatus === 'saved' ? C.champagne :
              saveStatus === 'error' ? '#f87171' :
              'transparent',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            transition: 'color 0.3s',
          }}
        >
          {saving ? 'Saving…' : saveStatus === 'saved' ? '✓ Saved' : saveStatus === 'error' ? 'Save failed' : '·'}
        </span>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 20px 80px' }}>

        {/* ── SECTION 1 ── */}
        <SectionCard
          num="1"
          eyebrow="The honest starting point"
          title="What isn't working right now"
          prompt="Be specific. The more honest you are here, the more useful everything else becomes."
        >
          <label style={labelStyle} htmlFor="s1">Write it out — don&rsquo;t filter yourself</label>
          <textarea
            id="s1"
            rows={5}
            style={textareaStyle}
            placeholder="Something isn't working and I can feel it. Specifically, what I keep running into is…"
            value={data.whatIsntWorking}
            onChange={(e) => handleChange('whatIsntWorking', e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </SectionCard>

        <Ornament />

        {/* ── SECTION 2 ── */}
        <SectionCard
          num="2"
          eyebrow="The real destination"
          title="What I actually want"
          prompt="Not what you think you should want. What you actually want — in your life, your work, your day-to-day."
        >
          <label style={labelStyle} htmlFor="s2">Describe the life or business you&rsquo;re trying to build</label>
          <textarea
            id="s2"
            rows={5}
            style={textareaStyle}
            placeholder="If I'm honest about what I actually want, it looks like…"
            value={data.whatIActuallyWant}
            onChange={(e) => handleChange('whatIActuallyWant', e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </SectionCard>

        <Ornament />

        {/* ── SECTION 3 — ARCHETYPE ── */}
        <SectionCard
          num="3"
          eyebrow="How you're wired"
          title="My archetype / identity type"
          prompt="Choose the one that feels most true — or the one that surprised you most from the Clarity Check."
        >
          {/* Archetype grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: 10,
              marginBottom: 20,
            }}
          >
            {ARCHETYPES.map((a) => {
              const selected = data.archetype === a.key;
              return (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => handleChange('archetype', a.key)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    padding: '16px 12px',
                    border: `1.5px solid ${selected ? C.lavender : 'rgba(75,78,109,0.12)'}`,
                    borderRadius: 4,
                    cursor: 'pointer',
                    textAlign: 'center',
                    background: selected ? 'rgba(156,136,255,0.08)' : C.mist,
                    boxShadow: selected ? '0 2px 12px rgba(156,136,255,0.2)' : 'none',
                    transition: 'all 0.15s ease',
                    outline: 'none',
                  }}
                >
                  <span style={{ fontSize: 24, lineHeight: 1 }}>{a.icon}</span>
                  <span
                    style={{
                      fontFamily: "'Italiana', serif",
                      fontSize: 18,
                      color: C.deep,
                    }}
                  >
                    {a.key}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: C.indigo,
                      opacity: 0.55,
                      fontFamily: "'Marcellus', serif",
                      lineHeight: 1.4,
                    }}
                  >
                    {a.desc}
                  </span>
                </button>
              );
            })}
          </div>

          <label style={labelStyle} htmlFor="s3note">
            What this means for how I build (in your own words)
          </label>
          <textarea
            id="s3note"
            rows={3}
            style={textareaStyle}
            placeholder={
              data.archetype
                ? `Knowing I'm a ${data.archetype}, the way I need to build is…`
                : `Knowing I'm a [archetype], the way I need to build is…`
            }
            value={data.archetypeNote}
            onChange={(e) => handleChange('archetypeNote', e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </SectionCard>

        <Ornament />

        {/* ── SECTION 4 ── */}
        <SectionCard
          num="4"
          eyebrow="The real barrier"
          title="My biggest obstacle"
          prompt="Not the surface answer. The thing underneath — the belief, fear, or pattern that keeps showing up."
        >
          <label style={labelStyle} htmlFor="s4">Name it directly</label>
          <textarea
            id="s4"
            rows={5}
            style={textareaStyle}
            placeholder="If I'm being completely honest, what's really in the way is…"
            value={data.biggestObstacle}
            onChange={(e) => handleChange('biggestObstacle', e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </SectionCard>

        <Ornament />

        {/* ── SECTION 5 ── */}
        <SectionCard
          num="5"
          eyebrow="The immediate move"
          title="My one clear next step"
          prompt="One action. Specific. Doable within the next 7 days. Not a plan — a move."
        >
          <label style={labelStyle} htmlFor="s5">What I&rsquo;m doing this week</label>
          <textarea
            id="s5"
            rows={4}
            style={textareaStyle}
            placeholder="Within the next 7 days I will specifically…"
            value={data.oneClearNextStep}
            onChange={(e) => handleChange('oneClearNextStep', e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </SectionCard>

        <Ornament />

        {/* ── SECTION 6 — COMMITMENT ── */}
        <SectionCard
          num="6"
          eyebrow="The promise"
          title="My commitment to myself"
          prompt="Write it like you mean it. This is between you and you."
        >
          <div
            style={{
              background: `linear-gradient(135deg, ${C.deep} 0%, ${C.indigo} 100%)`,
              borderRadius: 4,
              padding: 28,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(ellipse at 80% 20%, rgba(156,136,255,0.15) 0%, transparent 60%)',
                pointerEvents: 'none',
              }}
            />
            <span
              style={{
                display: 'block',
                fontFamily: "'Italiana', serif",
                fontSize: 22,
                color: 'white',
                marginBottom: 16,
                position: 'relative',
                zIndex: 1,
              }}
            >
              I commit to building what is actually <em style={{ fontStyle: 'italic', color: C.peach }}>mine</em> —
            </span>
            <textarea
              id="s6"
              rows={5}
              style={{
                ...textareaStyle,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'white',
                position: 'relative',
                zIndex: 1,
              }}
              placeholder="I commit to stopping ____________ and starting ____________ because I know that ____________ is what I'm actually here to build."
              value={data.commitment}
              onChange={(e) => handleChange('commitment', e.target.value)}
              onFocus={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                e.currentTarget.style.borderColor = C.peach;
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
              }}
            />
          </div>
        </SectionCard>

        {/* ── COMPLETION / BRIDGE ── */}
        {!completed ? (
          <div
            style={{
              background: C.warmWhite,
              border: '1px solid rgba(75,78,109,0.1)',
              borderRadius: 4,
              padding: '32px 28px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic',
                fontSize: 16,
                color: C.indigo,
                opacity: 0.6,
                marginBottom: 24,
              }}
            >
              When you&rsquo;ve finished all six sections, lock in your Blueprint.
            </p>
            <button
              type="button"
              onClick={markComplete}
              disabled={filledCount < 6 || saving}
              style={{
                display: 'inline-block',
                background: filledCount === 6 ? C.champagne : 'rgba(75,78,109,0.15)',
                color: filledCount === 6 ? C.deep : 'rgba(75,78,109,0.4)',
                fontFamily: "'Italiana', serif",
                fontSize: 18,
                padding: '14px 48px',
                borderRadius: 2,
                border: 'none',
                cursor: filledCount === 6 ? 'pointer' : 'not-allowed',
                letterSpacing: '0.03em',
                transition: 'all 0.2s',
              }}
            >
              {saving ? 'Saving…' : 'Lock In My Blueprint →'}
            </button>
            {filledCount < 6 && (
              <p style={{ fontSize: 12, color: C.indigo, opacity: 0.4, marginTop: 12, fontFamily: "'Marcellus', serif" }}>
                Complete all 6 sections to unlock
              </p>
            )}
          </div>
        ) : (
          /* ── POST-COMPLETION BRIDGE ── */
          <div
            style={{
              background: `linear-gradient(160deg, ${C.deep} 0%, ${C.indigo} 100%)`,
              borderRadius: 4,
              padding: '40px 28px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(ellipse at 60% 30%, rgba(252,196,183,0.12) 0%, transparent 60%)',
                pointerEvents: 'none',
              }}
            />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>✦</div>
              <h3
                style={{
                  fontFamily: "'Italiana', serif",
                  fontSize: 32,
                  fontWeight: 400,
                  color: 'white',
                  marginBottom: 16,
                }}
              >
                Your Blueprint is saved.
              </h3>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: 'italic',
                  fontSize: 18,
                  color: 'rgba(255,255,255,0.7)',
                  maxWidth: 440,
                  margin: '0 auto 32px',
                  lineHeight: 1.6,
                }}
              >
                &ldquo;If this feels unfinished — that&rsquo;s not because you did it wrong. It&rsquo;s because this is something meant to be built, not just written.&rdquo;
              </p>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link
                  href="/dashboard"
                  style={{
                    display: 'inline-block',
                    background: C.champagne,
                    color: C.deep,
                    fontFamily: "'Italiana', serif",
                    fontSize: 18,
                    padding: '14px 36px',
                    borderRadius: 2,
                    textDecoration: 'none',
                    letterSpacing: '0.03em',
                  }}
                >
                  Continue in the Platform →
                </Link>
                <Link
                  href="/program"
                  style={{
                    display: 'inline-block',
                    background: 'rgba(252,196,183,0.15)',
                    border: `1.5px solid ${C.peach}`,
                    color: C.peach,
                    fontFamily: "'Italiana', serif",
                    fontSize: 18,
                    padding: '14px 36px',
                    borderRadius: 2,
                    textDecoration: 'none',
                    letterSpacing: '0.03em',
                  }}
                >
                  Learn About the Accelerator
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div
          style={{
            textAlign: 'center',
            padding: '32px 0 0',
            fontSize: 12,
            color: 'rgba(75,78,109,0.4)',
            fontFamily: "'Marcellus', serif",
          }}
        >
          iPurpose · <a href="https://ipurposesoul.com" style={{ color: C.lavender, textDecoration: 'none' }}>ipurposesoul.com</a> · Where inner alignment becomes coherent action.
        </div>
      </div>
    </>
  );
}

'use client';

import { useState } from 'react';
import Image from 'next/image';

// ── Brand ─────────────────────────────────────────────────────────────────
const C = {
  indigo:    '#4b4e6d',
  lavender:  '#9c88ff',
  peach:     '#fcc4b7',
  gold:      '#d4af37',
  cream:     '#fff3da',
  green:     '#88b04b',
  white:     '#ffffff',
  mist:      '#fff3da',
};

// ── Helpers ───────────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 10,
      letterSpacing: '0.2em',
      textTransform: 'uppercase' as const,
      color: C.lavender,
      fontFamily: "'Marcellus', Georgia, serif",
      marginBottom: 6,
    }}>
      {children}
    </p>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize: 20,
      fontFamily: "'Marcellus', Georgia, serif",
      color: C.indigo,
      marginBottom: 24,
      paddingBottom: 10,
      borderBottom: `1px solid ${C.peach}`,
    }}>
      {children}
    </h2>
  );
}

function FieldBlock({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <label style={{
        display: 'block',
        fontSize: 14,
        color: C.indigo,
        fontFamily: "'Marcellus', Georgia, serif",
        marginBottom: 8,
        fontWeight: 500,
      }}>
        {label}{required && <span style={{ color: C.peach, marginLeft: 4 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: '1.5px solid #ddd',
  borderRadius: 8,
  fontSize: 14,
  color: C.indigo,
  fontFamily: "'Montserrat', sans-serif",
  outline: 'none',
  background: C.white,
  boxSizing: 'border-box',
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: 100,
  resize: 'vertical' as const,
  lineHeight: 1.6,
};

// ── Star Rating ───────────────────────────────────────────────────────────
function StarRating({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const [hover, setHover] = useState(0);
  return (
    <FieldBlock label={label} required>
      <div style={{ display: 'flex', gap: 8 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            style={{
              fontSize: 28,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: star <= (hover || value) ? C.gold : '#ddd',
              transition: 'color 0.15s',
              padding: '2px 4px',
            }}
            aria-label={`${star} star`}
          >
            ★
          </button>
        ))}
      </div>
      {value > 0 && (
        <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
          {['', 'Needs improvement', 'Fair', 'Good', 'Very good', 'Excellent'][value]}
        </p>
      )}
    </FieldBlock>
  );
}

// ── Radio Group ───────────────────────────────────────────────────────────
function RadioGroup({
  label,
  name,
  options,
  value,
  onChange,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <FieldBlock label={label}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {options.map((opt) => (
          <label key={opt.value} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            fontSize: 14,
            color: C.indigo,
            fontFamily: "'Montserrat', sans-serif",
          }}>
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              style={{ accentColor: C.lavender, width: 16, height: 16 }}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </FieldBlock>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function FeedbackPage() {
  // Section 1
  const [overallRating, setOverallRating]     = useState(0);
  const [clarityBefore, setClarityBefore]     = useState(0);
  const [clarityAfter, setClarityAfter]       = useState(0);

  // Section 2
  const [mostUseful, setMostUseful]           = useState('');
  const [resonatedPillar, setResonatedPillar] = useState('');
  const [unclearOrMore, setUnclearOrMore]     = useState('');

  // Section 3
  const [businessStage, setBusinessStage]         = useState('');
  const [biggestChallenge, setBiggestChallenge]   = useState('');

  // Section 4
  const [willingToTestimonial, setWillingToTestimonial]   = useState('');
  const [testimonialQuote, setTestimonialQuote]           = useState('');
  const [testimonialPermission, setTestimonialPermission] = useState('');

  // Meta
  const [participantName, setParticipantName]   = useState('');
  const [participantEmail, setParticipantEmail] = useState('');

  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overallRating) {
      setError('Please rate the overall session before submitting.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/feedback/sla-participant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overallRating,
          clarityBefore,
          clarityAfter,
          mostUseful,
          resonatedPillar,
          unclearOrMore,
          businessStage,
          biggestChallenge,
          willingToTestimonial,
          testimonialQuote,
          testimonialPermission,
          participantName,
          participantEmail,
          sessionDate: new Date().toISOString().slice(0, 10),
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Unable to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: C.mist,
    paddingTop: 60,
    paddingBottom: 80,
    paddingLeft: '5%',
    paddingRight: '5%',
  };

  const cardStyle: React.CSSProperties = {
    maxWidth: 680,
    margin: '0 auto',
    background: C.white,
    borderRadius: 16,
    padding: '48px 48px',
    boxShadow: '0 8px 40px rgba(75,78,109,0.12)',
    border: '1px solid rgba(156,136,255,0.12)',
  };

  if (submitted) {
    return (
      <div style={containerStyle}>
        <div style={{ ...cardStyle, textAlign: 'center', padding: '64px 48px' }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>✨</div>
          <Label>Thank You</Label>
          <h1 style={{
            fontSize: 28,
            fontFamily: "'Marcellus', Georgia, serif",
            color: C.indigo,
            margin: '12px 0 16px',
          }}>
            Your feedback means a lot.
          </h1>
          <p style={{
            fontSize: 15,
            color: '#666',
            lineHeight: 1.7,
            fontFamily: "'Montserrat', sans-serif",
            maxWidth: 440,
            margin: '0 auto',
          }}>
            Thank you for taking the time to share your experience. Your insights help us
            refine the iPurpose™ framework and serve founders more powerfully.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Image
            src="/images/my-logo.png"
            alt="iPurpose Logo"
            width={120}
            height={120}
            style={{ margin: '0 auto', display: 'block' }}
          />
        </div>

        {/* Header */}
        <div style={{ marginBottom: 40, borderBottom: `2px solid ${C.peach}`, paddingBottom: 32 }}>
          <h1 style={{
            fontSize: 34,
            fontFamily: "'Marcellus', Georgia, serif",
            color: C.indigo,
            margin: '0 0 10px',
            lineHeight: 1.25,
          }}>
            iPurpose™ · Session Reflection
          </h1>
          <p style={{
            fontSize: 18,
            fontFamily: "'Marcellus', Georgia, serif",
            color: C.lavender,
            margin: '0 0 12px',
          }}>
            How did today's session land?
          </p>
          <p style={{
            fontSize: 14,
            color: '#777',
            fontFamily: "'Montserrat', sans-serif",
            lineHeight: 1.6,
          }}>
            This takes about 5 minutes. Your honesty helps us make each session better —
            and your words may help another founder decide to show up.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Optional name + email */}
          <div style={{
            background: C.cream,
            borderRadius: 10,
            padding: '20px 24px',
            marginBottom: 36,
          }}>
            <p style={{ fontSize: 12, color: '#888', fontFamily: "'Montserrat', sans-serif", marginBottom: 14 }}>
              Optional — helps us follow up if you're interested in continuing.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: C.indigo, display: 'block', marginBottom: 6, fontFamily: "'Montserrat', sans-serif" }}>
                  Your name
                </label>
                <input
                  type="text"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="First name"
                  style={{ ...inputStyle, fontSize: 13 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: C.indigo, display: 'block', marginBottom: 6, fontFamily: "'Montserrat', sans-serif" }}>
                  Email address
                </label>
                <input
                  type="email"
                  value={participantEmail}
                  onChange={(e) => setParticipantEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{ ...inputStyle, fontSize: 13 }}
                />
              </div>
            </div>
          </div>

          {/* ── Section 1: Quick Pulse ── */}
          <div style={{ marginBottom: 44 }}>
            <SectionHeading>Section 1 — Quick Pulse</SectionHeading>

            <StarRating
              label="Overall, how would you rate today's session?"
              value={overallRating}
              onChange={setOverallRating}
            />

            <StarRating
              label="How clear did you feel about your direction BEFORE the session?"
              value={clarityBefore}
              onChange={setClarityBefore}
            />

            <StarRating
              label="How clear do you feel about your direction AFTER the session?"
              value={clarityAfter}
              onChange={setClarityAfter}
            />
          </div>

          {/* ── Section 2: What Landed ── */}
          <div style={{ marginBottom: 44 }}>
            <SectionHeading>Section 2 — What Landed</SectionHeading>

            <FieldBlock label="What was the most useful thing you took away today?">
              <textarea
                value={mostUseful}
                onChange={(e) => setMostUseful(e.target.value)}
                placeholder="Share the idea, shift, or moment that stuck with you..."
                style={textareaStyle}
              />
            </FieldBlock>

            <FieldBlock label="Which part of the framework resonated most — Soul, Systems, or AI? Why?">
              <textarea
                value={resonatedPillar}
                onChange={(e) => setResonatedPillar(e.target.value)}
                placeholder="What connected with you and why..."
                style={textareaStyle}
              />
            </FieldBlock>

            <FieldBlock label="Was there anything that felt unclear or that you wished we had more time on?">
              <textarea
                value={unclearOrMore}
                onChange={(e) => setUnclearOrMore(e.target.value)}
                placeholder="Honest feedback helps us improve..."
                style={{ ...textareaStyle, minHeight: 80 }}
              />
            </FieldBlock>
          </div>

          {/* ── Section 3: About You ── */}
          <div style={{ marginBottom: 44 }}>
            <SectionHeading>Section 3 — About You</SectionHeading>

            <RadioGroup
              label="What stage are you at in your business or idea?"
              name="businessStage"
              value={businessStage}
              onChange={setBusinessStage}
              options={[
                { value: 'idea', label: "Just an idea — haven't started yet" },
                { value: 'early', label: 'Early stage — testing or building' },
                { value: 'launched', label: 'Launched — have some clients or revenue' },
                { value: 'growing', label: 'Growing — scaling or refining' },
                { value: 'pivoting', label: 'Pivoting — rethinking my direction' },
              ]}
            />

            <FieldBlock label="What is the biggest challenge you're facing right now as a founder?">
              <textarea
                value={biggestChallenge}
                onChange={(e) => setBiggestChallenge(e.target.value)}
                placeholder="Be as specific as you like..."
                style={{ ...textareaStyle, minHeight: 80 }}
              />
            </FieldBlock>
          </div>

          {/* ── Section 4: Testimonial ── */}
          <div style={{
            marginBottom: 44,
            background: C.cream,
            borderRadius: 12,
            padding: '28px 28px',
          }}>
            <SectionHeading>Section 4 — Your Voice</SectionHeading>

            <RadioGroup
              label="Would you be willing to share a short quote about your experience today?"
              name="willingToTestimonial"
              value={willingToTestimonial}
              onChange={setWillingToTestimonial}
              options={[
                { value: 'yes', label: "Yes, I'd be happy to" },
                { value: 'no', label: 'Not right now' },
              ]}
            />

            {willingToTestimonial === 'yes' && (
              <>
                <FieldBlock label="In 2–3 sentences, how would you describe this session to another founder?">
                  <textarea
                    value={testimonialQuote}
                    onChange={(e) => setTestimonialQuote(e.target.value)}
                    placeholder="Write it naturally, as if you're texting a friend..."
                    style={{ ...textareaStyle, minHeight: 110 }}
                  />
                </FieldBlock>

                <RadioGroup
                  label="May we use your name and quote on the iPurpose™ website and in marketing materials?"
                  name="testimonialPermission"
                  value={testimonialPermission}
                  onChange={setTestimonialPermission}
                  options={[
                    { value: 'full', label: 'Yes — full name' },
                    { value: 'first', label: 'Yes — first name only' },
                    { value: 'no', label: 'No — keep it anonymous' },
                  ]}
                />
              </>
            )}
          </div>

          {/* Error */}
          {error && (
            <p style={{
              color: '#c0392b',
              fontSize: 13,
              marginBottom: 16,
              fontFamily: "'Inter', sans-serif",
            }}>
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px 24px',
              background: loading ? '#aaa' : C.indigo,
              color: C.white,
              border: 'none',
              borderRadius: 10,
              fontSize: 15,
              fontFamily: "'Marcellus', Georgia, serif",
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.05em',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Submitting…' : 'Submit My Feedback →'}
          </button>

          <p style={{
            fontSize: 11,
            color: '#aaa',
            textAlign: 'center',
            marginTop: 16,
            fontFamily: "'Montserrat', sans-serif",
          }}>
            Your responses are private and stored securely. They will never be sold or shared with third parties.
          </p>
        </form>
      </div>
    </div>
  );
}

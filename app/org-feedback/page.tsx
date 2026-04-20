'use client';

import { useState } from 'react';
import Image from 'next/image';

// ── Brand ─────────────────────────────────────────────────────────────────
const C = {
  indigo:   '#4b4e6d',
  lavender: '#9c88ff',
  peach:    '#fcc4b7',
  gold:     '#d4af37',
  cream:    '#fff3da',
  green:    '#88b04b',
  white:    '#ffffff',
  mist:      '#fff3da',
};

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

function FieldBlock({ label, number, children }: { label: string; number: number; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 10 }}>
        <span style={{
          flexShrink: 0,
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: C.lavender,
          color: C.white,
          fontSize: 13,
          fontFamily: "'Marcellus', Georgia, serif",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {number}
        </span>
        <label style={{
          fontSize: 15,
          color: C.indigo,
          fontFamily: "'Marcellus', Georgia, serif",
          lineHeight: 1.5,
          paddingTop: 3,
        }}>
          {label}
        </label>
      </div>
      {children}
    </div>
  );
}

const textareaStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: '1.5px solid #ddd',
  borderRadius: 8,
  fontSize: 14,
  color: C.indigo,
  fontFamily: "'Inter', sans-serif",
  outline: 'none',
  background: C.white,
  boxSizing: 'border-box',
  minHeight: 100,
  resize: 'vertical' as const,
  lineHeight: 1.6,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: '1.5px solid #ddd',
  borderRadius: 8,
  fontSize: 14,
  color: C.indigo,
  fontFamily: "'Inter', sans-serif",
  outline: 'none',
  background: C.white,
  boxSizing: 'border-box',
};

function RadioGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 42 }}>
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
  );
}

export default function SLAOrgFeedbackPage() {
  const [communityLanding, setCommunityLanding]       = useState('');
  const [memberFeedback, setMemberFeedback]           = useState('');
  const [formatFit, setFormatFit]                     = useState('');
  const [futureCollaboration, setFutureCollaboration] = useState('');
  const [adjustmentsForNext, setAdjustmentsForNext]   = useState('');
  const [respondentName, setRespondentName]           = useState('');
  const [respondentEmail, setRespondentEmail]         = useState('');

  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!communityLanding.trim()) {
      setError('Please share at least how the session landed with your community.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/feedback/sla-org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communityLanding,
          memberFeedback,
          formatFit,
          futureCollaboration,
          adjustmentsForNext,
          respondentName,
          respondentEmail,
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
          <div style={{ fontSize: 48, marginBottom: 20 }}>🤝</div>
          <Label>Thank You</Label>
          <h1 style={{
            fontSize: 28,
            fontFamily: "'Marcellus', Georgia, serif",
            color: C.indigo,
            margin: '12px 0 16px',
          }}>
            Your perspective is invaluable.
          </h1>
          <p style={{
            fontSize: 15,
            color: '#666',
            lineHeight: 1.7,
            fontFamily: "'Montserrat', sans-serif",
            maxWidth: 440,
            margin: '0 auto',
          }}>
            Thank you for taking the time to share your perspective.
            This feedback directly shapes how we structure future collaborations.
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
            iPurpose™ · Organizational Feedback
          </h1>
          <p style={{
            fontSize: 18,
            fontFamily: "'Marcellus', Georgia, serif",
            color: C.lavender,
            margin: '0 0 12px',
          }}>
            How did the session land with your community?
          </p>
          <p style={{
            fontSize: 14,
            color: '#777',
            fontFamily: "'Montserrat', sans-serif",
            lineHeight: 1.6,
          }}>
            Five questions. Under 5 minutes. Your answers directly inform how we
            shape any future collaboration.
          </p>
        </div>

        {/* Respondent info */}
        <div style={{
          background: C.cream,
          borderRadius: 10,
          padding: '20px 24px',
          marginBottom: 40,
        }}>
          <p style={{ fontSize: 12, color: '#888', fontFamily: "'Montserrat', sans-serif", marginBottom: 14 }}>
            Optional — helps us attribute this feedback correctly.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: C.indigo, display: 'block', marginBottom: 6, fontFamily: "'Montserrat', sans-serif" }}>Your name</label>
              <input
                type="text"
                value={respondentName}
                onChange={(e) => setRespondentName(e.target.value)}
                placeholder="Full name"
                style={{ ...inputStyle, fontSize: 13 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: C.indigo, display: 'block', marginBottom: 6, fontFamily: "'Montserrat', sans-serif" }}>Email address</label>
              <input
                type="email"
                value={respondentEmail}
                onChange={(e) => setRespondentEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ ...inputStyle, fontSize: 13 }}
              />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          <FieldBlock number={1} label="How did the session land with your community overall?">
            <textarea
              value={communityLanding}
              onChange={(e) => setCommunityLanding(e.target.value)}
              placeholder="General impression — energy in the room, engagement level, reception..."
              style={{ ...textareaStyle, paddingLeft: 14 }}
            />
          </FieldBlock>

          <FieldBlock number={2} label="What feedback did you hear from members after the session?">
            <textarea
              value={memberFeedback}
              onChange={(e) => setMemberFeedback(e.target.value)}
              placeholder="Quotes, themes, or reactions you heard — anything that stood out..."
              style={textareaStyle}
            />
          </FieldBlock>

          <FieldBlock number={3} label="Was the format and content a good fit for your audience?">
            <RadioGroup
              name="formatFit"
              value={formatFit}
              onChange={setFormatFit}
              options={[
                { value: 'very-good', label: 'Yes — very well suited' },
                { value: 'good', label: 'Mostly — with a few adjustments needed' },
                { value: 'mixed', label: 'Mixed — some parts landed better than others' },
                { value: 'not-quite', label: 'Not quite — format or content needs rethinking' },
              ]}
            />
          </FieldBlock>

          <FieldBlock number={4} label="Would you consider hosting a future session or program with iPurpose™?">
            <RadioGroup
              name="futureCollaboration"
              value={futureCollaboration}
              onChange={setFutureCollaboration}
              options={[
                { value: 'yes-definitely', label: 'Yes — definitely open to it' },
                { value: 'yes-with-changes', label: 'Yes — with some adjustments' },
                { value: 'maybe', label: 'Maybe — need to see more first' },
                { value: 'not-right-now', label: 'Not right now' },
              ]}
            />
          </FieldBlock>

          <FieldBlock number={5} label="Is there anything you'd want adjusted for a next collaboration?">
            <textarea
              value={adjustmentsForNext}
              onChange={(e) => setAdjustmentsForNext(e.target.value)}
              placeholder="Format, timing, topic focus, audience segment, anything at all..."
              style={textareaStyle}
            />
          </FieldBlock>

          {error && (
            <p style={{
              color: '#c0392b',
              fontSize: 13,
              marginBottom: 16,
              fontFamily: "'Montserrat', sans-serif",
            }}>
              {error}
            </p>
          )}

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
            {loading ? 'Submitting…' : 'Submit Feedback →'}
          </button>

          <p style={{
            fontSize: 11,
            color: '#aaa',
            textAlign: 'center',
            marginTop: 16,
            fontFamily: "'Montserrat', sans-serif",
          }}>
            Responses are private and stored securely by iPurpose™.
          </p>
        </form>
      </div>
    </div>
  );
}

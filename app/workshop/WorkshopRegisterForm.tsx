'use client';

import { useState } from 'react';

interface Props {
  buttonStyle: React.CSSProperties;
}

export default function WorkshopRegisterForm({ buttonStyle }: Props) {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [building, setBuilding] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/leads/workshop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, email, building, website }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
      } else {
        setSuccess(true);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>✦</div>
        <h3 style={{
          fontFamily: "'Italiana', Georgia, serif",
          fontSize: 28,
          color: '#2e3050',
          fontWeight: 400,
          marginBottom: 12,
        }}>
          You&rsquo;re in.
        </h3>
        <p style={{ fontSize: 15, color: '#6b6b80', lineHeight: 1.7, marginBottom: 8 }}>
          Check your inbox — a confirmation with your Zoom link is on its way.
        </p>
        <p style={{ fontSize: 14, color: '#9C88FF' }}>April 24, 2026 · 90 Minutes · Live on Zoom</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Honeypot — hidden from humans */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>First Name</label>
        <input
          type="text"
          placeholder="Your first name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          style={inputStyle}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#9C88FF')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(75,78,109,0.2)')}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Email Address</label>
        <input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#9C88FF')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(75,78,109,0.2)')}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>
          What are you currently building?{' '}
          <span style={{ opacity: 0.5, fontSize: 11 }}>(optional)</span>
        </label>
        <input
          type="text"
          placeholder="e.g. coaching practice, online course, consulting..."
          value={building}
          onChange={(e) => setBuilding(e.target.value)}
          style={inputStyle}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#9C88FF')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(75,78,109,0.2)')}
        />
      </div>

      {error && (
        <p style={{ color: '#c0392b', fontSize: 13, marginBottom: 12 }}>{error}</p>
      )}

      <button type="submit" disabled={loading} style={{ ...buttonStyle, width: '100%', marginTop: 8, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
        {loading ? 'Saving your spot…' : 'Start My Blueprint →'}
      </button>

      <p style={{ textAlign: 'center', fontSize: 12, color: '#aaa', marginTop: 16, lineHeight: 1.6 }}>
        You&rsquo;ll receive a confirmation email with the Zoom link and your free Blueprint worksheet to download before we begin.
      </p>
    </form>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  color: '#4B4E6D',
  marginBottom: 8,
  opacity: 0.8,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  border: '1px solid rgba(75,78,109,0.2)',
  borderRadius: 2,
  fontFamily: "'Marcellus', Georgia, serif",
  fontSize: 15,
  color: '#4B4E6D',
  background: '#fdfaf7',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

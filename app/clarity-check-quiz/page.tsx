'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const C = {
  indigo: '#4B4E6D',
  lavender: '#9C88FF',
  champagne: '#e6c87c',
  deep: '#2e3050',
  mist: '#F5F7FA',
  warmWhite: '#fdfaf7',
};

const questions = [
  { id: 1, text: "I know what I'm trying to build — and why it matters to me." },
  { id: 2, text: "My choices feel more like mine than like things I'm doing to keep up, fit in, or make others comfortable." },
  { id: 3, text: "I'm open to getting outside perspective or structure — I don't need to figure this all out alone." },
  { id: 4, text: "I'm ready to put real time or energy into getting unstuck — not just thinking about it." },
  { id: 5, text: "I know something needs to change — I just can't seem to make myself do it." },
  { id: 6, text: "I'm not stuck because I lack ideas — I'm stuck because I don't have a clear next step or path." },
  { id: 7, text: "I know what my most meaningful next step is right now." },
];

const identityQuestions = [
  {
    id: 1,
    text: "When you're facing a big decision, you usually:",
    options: {
      A: 'Picture the future you want and move toward it boldly',
      B: 'Map out a plan and work through it step by step',
      C: 'Think about who it affects and how to take care of them',
      D: 'Gather information and optimize for the best outcome',
      E: 'Look for an angle no one else has considered',
    },
  },
  {
    id: 2,
    text: 'Your greatest strength at work is:',
    options: {
      A: "Seeing what's possible and getting others excited about it",
      B: 'Following through and building things that actually work',
      C: 'Reading people and making them feel seen and supported',
      D: 'Thinking several steps ahead and solving hard problems',
      E: 'Coming up with ideas that nobody else would think of',
    },
  },
  {
    id: 3,
    text: "You feel most like yourself when you're:",
    options: {
      A: 'Leading a change or building something from scratch',
      B: 'Making real progress on something that matters',
      C: 'Helping someone grow or get through something hard',
      D: 'Working out a strategy or making something run better',
      E: "Making something new that didn't exist before",
    },
  },
  {
    id: 4,
    text: 'When you start something new, your first instinct is to focus on:',
    options: {
      A: "The vision — what it's for and why it matters",
      B: 'The plan — what to do and how to build it',
      C: 'The people — who it serves and how to support them',
      D: 'The strategy — what will actually work',
      E: 'The concept — what makes it different',
    },
  },
  {
    id: 5,
    text: "People who know you well would say you're someone who:",
    options: {
      A: 'Pushes people to think bigger and challenges the way things are',
      B: 'Gets things done and builds things that last',
      C: 'Shows up for people and makes them feel like they belong',
      D: 'Always has a plan and knows how to make things work',
      E: 'Sees what others miss and brings something fresh to the table',
    },
  },
];

export default function ClarityCheckQuizPage() {
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [identityResponses, setIdentityResponses] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleResponse = (questionId: number, value: number) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleIdentityResponse = (questionId: number, value: string) => {
    setIdentityResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const answeredCount = Object.keys(responses).length;
    if (answeredCount !== 7) {
      const unanswered = 7 - answeredCount;
      setError(`Please answer all 7 questions. You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Scroll up to find them.`);
      const firstUnanswered = questions.find((q) => !responses[q.id]);
      if (firstUnanswered) {
        document.getElementById(`q-${firstUnanswered.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const identityAnsweredCount = Object.keys(identityResponses).length;
    if (identityAnsweredCount !== 5) {
      const unanswered = 5 - identityAnsweredCount;
      setError(`Please answer all 5 identity questions. You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}.`);
      const firstUnanswered = identityQuestions.find((q) => !identityResponses[q.id]);
      if (firstUnanswered) {
        document.getElementById(`iq-${firstUnanswered.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/clarity-check/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses,
          identityResponses: Object.values(identityResponses),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to submit clarity check');
        setLoading(false);
        return;
      }

      sessionStorage.setItem(
        'clarityCheckResults',
        JSON.stringify({
          scores: data.scores,
          resultSummary: data.resultSummary,
          resultDetail: data.resultDetail,
          nextStep: data.nextStep,
          identityType: data.identityType,
          identityCounts: data.identityCounts,
          submissionId: data.submissionId || '',
        })
      );

      localStorage.setItem('clarityCheckCompleted', 'true');

      const qs = searchParams.toString();
      router.push(qs ? `/clarity-check-results?${qs}` : '/clarity-check-results');
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Italiana&family=Marcellus&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');

        .cc-body {
          font-family: 'Marcellus', Georgia, serif;
          background-color: ${C.warmWhite};
          color: ${C.indigo};
          line-height: 1.75;
          font-size: 16px;
          min-height: 100vh;
        }

        .cc-cover {
          background: linear-gradient(160deg, ${C.deep} 0%, ${C.indigo} 60%, #6b5b8e 100%);
          color: ${C.warmWhite};
          padding: 80px 24px 70px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .cc-cover::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 70% 30%, rgba(156,136,255,0.18) 0%, transparent 60%),
            radial-gradient(ellipse at 20% 80%, rgba(252,196,183,0.12) 0%, transparent 50%);
          pointer-events: none;
        }
        .cc-eyebrow {
          font-size: 11px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: ${C.champagne};
          margin-bottom: 20px;
          opacity: 0.85;
          position: relative;
        }
        .cc-cover-title {
          font-family: 'Italiana', serif;
          font-weight: 400;
          font-size: clamp(34px, 5vw, 58px);
          color: #fff;
          max-width: 640px;
          margin: 0 auto 16px;
          line-height: 1.2;
          position: relative;
        }
        .cc-cover-sub {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: clamp(16px, 2vw, 20px);
          opacity: 0.75;
          max-width: 480px;
          margin: 0 auto 36px;
          position: relative;
        }
        .cc-cover-meta {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 28px;
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          opacity: 0.55;
          position: relative;
        }

        .cc-main {
          max-width: 760px;
          margin: 0 auto;
          padding: 56px 24px 80px;
        }

        .cc-form-header {
          text-align: center;
          margin-bottom: 48px;
          padding-bottom: 36px;
          border-bottom: 1px solid rgba(75,78,109,0.12);
        }
        .cc-section-label {
          font-size: 11px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: ${C.lavender};
          margin-bottom: 12px;
          font-family: 'Marcellus', serif;
        }
        .cc-form-header h2 {
          font-family: 'Italiana', serif;
          font-weight: 400;
          font-size: clamp(28px, 4vw, 42px);
          color: ${C.deep};
          margin-bottom: 10px;
        }
        .cc-form-header p {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 18px;
          color: ${C.indigo};
          opacity: 0.7;
          max-width: 460px;
          margin: 0 auto;
        }

        .cc-section-group { margin-bottom: 40px; }

        .cc-q-card {
          background: white;
          border: 1px solid rgba(75,78,109,0.12);
          border-radius: 4px;
          padding: 24px 28px 20px;
          margin-bottom: 10px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .cc-q-card:hover { border-color: rgba(156,136,255,0.35); box-shadow: 0 4px 18px rgba(75,78,109,0.08); }
        .cc-q-card.unanswered { border-color: rgba(156,136,255,0.45); box-shadow: 0 0 0 3px rgba(156,136,255,0.12); }

        .cc-q-text {
          font-size: 16px;
          color: ${C.deep};
          margin-bottom: 14px;
          line-height: 1.65;
        }

        .cc-scale-wrap { display: flex; flex-direction: column; gap: 6px; }
        .cc-scale-dots { display: flex; gap: 8px; align-items: center; }
        .cc-dot {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1.5px solid rgba(75,78,109,0.2);
          background: ${C.mist};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          color: ${C.indigo};
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: 'Marcellus', serif;
          flex-shrink: 0;
          user-select: none;
        }
        .cc-dot:hover { background: ${C.indigo}; border-color: ${C.indigo}; color: white; transform: scale(1.1); box-shadow: 0 4px 12px rgba(75,78,109,0.25); }
        .cc-dot.selected { background: ${C.lavender}; border-color: ${C.lavender}; color: white; transform: scale(1.12); box-shadow: 0 4px 14px rgba(156,136,255,0.35); }

        .cc-scale-endpoints {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: rgba(75,78,109,0.45);
          letter-spacing: 0.04em;
          padding: 0 2px;
        }

        .cc-section-divider {
          text-align: center;
          color: ${C.champagne};
          opacity: 0.4;
          letter-spacing: 0.4em;
          font-size: 14px;
          padding: 8px 0;
          margin: 12px 0 36px;
        }

        .cc-identity-header {
          background: linear-gradient(135deg, ${C.deep} 0%, ${C.indigo} 100%);
          border-radius: 4px;
          padding: 36px 32px;
          margin-bottom: 16px;
          position: relative;
          overflow: hidden;
        }
        .cc-identity-header::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 80% 20%, rgba(156,136,255,0.2) 0%, transparent 60%),
                      radial-gradient(ellipse at 10% 80%, rgba(252,196,183,0.1) 0%, transparent 50%);
          pointer-events: none;
        }
        .cc-identity-header .cc-section-label { color: ${C.champagne}; opacity: 0.85; position: relative; }
        .cc-identity-header h2 {
          font-family: 'Italiana', serif;
          font-weight: 400;
          color: white;
          font-size: clamp(24px, 3.5vw, 36px);
          margin-bottom: 10px;
          position: relative;
        }
        .cc-identity-header p {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 16px;
          color: rgba(255,255,255,0.65);
          max-width: 480px;
          position: relative;
        }

        .cc-identity-q {
          background: white;
          border: 1px solid rgba(75,78,109,0.12);
          border-radius: 4px;
          padding: 24px 28px;
          margin-bottom: 10px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .cc-identity-q:hover { border-color: rgba(156,136,255,0.35); box-shadow: 0 4px 18px rgba(75,78,109,0.07); }
        .cc-identity-q.unanswered { border-color: rgba(156,136,255,0.45); box-shadow: 0 0 0 3px rgba(156,136,255,0.12); }

        .cc-identity-q-text {
          font-size: 16px;
          color: ${C.deep};
          margin-bottom: 14px;
          line-height: 1.6;
        }

        .cc-options-list { display: flex; flex-direction: column; gap: 3px; }
        .cc-option-row {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 10px 12px;
          border-radius: 3px;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.12s ease;
        }
        .cc-option-row:hover { background: rgba(156,136,255,0.06); border-color: rgba(156,136,255,0.2); }
        .cc-option-row.selected { background: rgba(156,136,255,0.1); border-color: rgba(156,136,255,0.4); }

        .cc-opt-key {
          font-family: 'Italiana', serif;
          font-size: 16px;
          color: ${C.lavender};
          min-width: 22px;
          padding-top: 1px;
          flex-shrink: 0;
        }
        .cc-opt-text { font-size: 15px; color: ${C.indigo}; line-height: 1.55; opacity: 0.85; }

        .cc-submit-section {
          text-align: center;
          margin-top: 48px;
          padding-top: 36px;
          border-top: 1px solid rgba(75,78,109,0.1);
        }
        .cc-submit-btn {
          display: inline-block;
          background: ${C.deep};
          color: ${C.warmWhite};
          font-family: 'Marcellus', Georgia, serif;
          font-size: 15px;
          padding: 15px 48px;
          border-radius: 2px;
          border: none;
          cursor: pointer;
          letter-spacing: 0.08em;
          transition: all 0.2s ease;
        }
        .cc-submit-btn:hover:not(:disabled) { background: ${C.indigo}; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(75,78,109,0.2); }
        .cc-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .cc-submit-note {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 14px;
          color: rgba(75,78,109,0.45);
          margin-top: 12px;
        }

        .cc-error {
          background: rgba(192,57,43,0.08);
          border: 1px solid rgba(192,57,43,0.25);
          color: #c0392b;
          font-size: 14px;
          padding: 14px 20px;
          border-radius: 4px;
          margin-bottom: 24px;
          text-align: center;
        }

        @media (max-width: 520px) {
          .cc-main { padding: 36px 16px 60px; }
          .cc-identity-header { padding: 28px 20px; }
          .cc-scale-dots { gap: 5px; }
          .cc-dot { width: 32px; height: 32px; font-size: 11px; }
        }
      `}</style>

      <div className="cc-body">
        {/* Cover */}
        <div className="cc-cover">
          <div className="cc-eyebrow">iPurpose</div>
          <h1 className="cc-cover-title">Clarity Check</h1>
          <p className="cc-cover-sub">A few honest questions to help us understand where you are — and how you&rsquo;re wired. There are no right or wrong answers.</p>
          <div className="cc-cover-meta">
            <span>Free</span>
            <span>12 Questions</span>
            <span>Under 3 Minutes</span>
          </div>
        </div>

        {/* Main */}
        <div className="cc-main">
          <div className="cc-form-header">
            <div className="cc-section-label">Clarity Check</div>
            <h2>Where you are right now</h2>
            <p>7 questions about your current situation + 5 about how you&rsquo;re wired. Be honest &mdash; there are no wrong answers.</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="cc-error">{error}</div>}

            {/* State Questions */}
            <div className="cc-section-group">
              {questions.map((q) => (
                <div
                  key={q.id}
                  id={`q-${q.id}`}
                  className={`cc-q-card${!responses[q.id] ? ' unanswered' : ''}`}
                >
                  <p className="cc-q-text">{q.text}</p>
                  <div className="cc-scale-wrap">
                    <div className="cc-scale-dots">
                      {[1, 2, 3, 4, 5].map((v) => (
                        <button
                          key={v}
                          type="button"
                          className={`cc-dot${responses[q.id] === v ? ' selected' : ''}`}
                          onClick={() => handleResponse(q.id, v)}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                    <div className="cc-scale-endpoints">
                      <span>Not true at all</span>
                      <span>Very true</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="cc-section-divider">✦ &nbsp; ✦ &nbsp; ✦</div>

            {/* Identity Questions */}
            <div className="cc-section-group">
              <div className="cc-identity-header">
                <div className="cc-section-label">Identity Questions</div>
                <h2>How you&rsquo;re naturally wired</h2>
                <p>These five questions help us understand your strengths and how you move through the world.</p>
              </div>

              {identityQuestions.map((q) => (
                <div
                  key={q.id}
                  id={`iq-${q.id}`}
                  className={`cc-identity-q${!identityResponses[q.id] ? ' unanswered' : ''}`}
                >
                  <p className="cc-identity-q-text">{q.text}</p>
                  <div className="cc-options-list">
                    {(Object.entries(q.options) as [string, string][]).map(([key, text]) => (
                      <div
                        key={key}
                        className={`cc-option-row${identityResponses[q.id] === key ? ' selected' : ''}`}
                        onClick={() => handleIdentityResponse(q.id, key)}
                      >
                        <span className="cc-opt-key">{key}.</span>
                        <span className="cc-opt-text">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Submit */}
            <div className="cc-submit-section">
              <button type="submit" className="cc-submit-btn" disabled={loading}>
                {loading ? 'Submitting\u2026' : 'Submit \u0026 Receive Your Results'}
              </button>
              <p className="cc-submit-note">Your results will be delivered immediately. No spam, ever.</p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PublicHeader from '../components/PublicHeader';
import Footer from '../components/Footer';

interface ResultsData {
  scores: {
    internalClarity: number;
    readinessForSupport: number;
    frictionBetweenInsightAndAction: number;
    integrationAndMomentum: number;
    totalScore: number;
  };
  resultSummary: string;
  resultDetail: string;
  nextStep: string;
  identityType?: string;
  identityCounts?: Record<string, number>;
  submissionId: string;
}

export default function ClarityCheckResultsPage() {
  const [results, setResults] = useState<ResultsData | null>(null);
  const [captureEmail, setCaptureEmail] = useState('');
  const [captureName, setCaptureName] = useState('');
  const [captureWebsite, setCaptureWebsite] = useState(''); // Honeypot
  const [captureLoading, setCaptureLoading] = useState(false);
  const [captureSubmitted, setCaptureSubmitted] = useState(false);
  const [captureError, setCaptureError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Read results stored by the quiz page
    const stored = sessionStorage.getItem('clarityCheckResults');
    if (!stored) {
      // No results in session — send user back to the quiz
      router.replace('/clarity-check-quiz');
      return;
    }

    try {
      const parsed: ResultsData = JSON.parse(stored);
      setResults(parsed);
      setModalOpen(true); // Open email capture modal automatically
    } catch {
      router.replace('/clarity-check-quiz');
    }
  }, [router]);

  const handleEmailCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    setCaptureError('');
    setCaptureLoading(true);

    try {
      // Pull full results from sessionStorage so the email includes scores,
      // summary, next step, identity type and a working results link.
      const stored = sessionStorage.getItem('clarityCheckResults');
      const sessionData = stored ? JSON.parse(stored) : {};

      const res = await fetch('/api/leads/clarity-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: captureName,
          email: captureEmail,
          website: captureWebsite,
          submissionId: sessionData.submissionId || '',
          identityType: sessionData.identityType || '',
          totalScore: sessionData.scores?.totalScore ?? undefined,
          scores: sessionData.scores ?? undefined,
          resultSummary: sessionData.resultSummary ?? undefined,
          nextStep: sessionData.nextStep ?? undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save your email');
      }

      if (data.ok) {
        setCaptureSubmitted(true);
        setModalOpen(false);
        localStorage.setItem('clarityCheckCompleted', 'true');
        // Fire both Google Ads conversions on email submit only (stricter lead-only counting)
        if (typeof window !== 'undefined' && window.gtag) {
          // "Clarity Check Completed" — counts only when a real lead is captured
          window.gtag('event', 'conversion', {
            send_to: 'AW-17993147612/iHOfCOzks4ocENzJ5oND',
          });
          // "Submit Lead Form" — primary lead value conversion
          window.gtag('event', 'conversion', {
            send_to: 'AW-17993147612/o_aWCOT7wYUcENzJ5oND',
            value: 1.0,
            currency: 'USD',
          });
        }
      } else {
        throw new Error(data.error || 'Failed to save your email');
      }
    } catch (err) {
      setCaptureError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setCaptureLoading(false);
    }
  };

  if (!results) {
    return (
      <div className="relative min-h-screen bg-white flex items-center justify-center">
        <p className="text-warmCharcoal font-marcellus text-xl">Loading your results…</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white print:bg-white">
      <style>{`
        @media print {
          body { margin: 0; padding: 0; }
          .print-hide { display: none !important; }
          .clarity-check-results { margin: 0; padding: 40px; max-width: 100%; }
          .results-container { page-break-inside: avoid; }
          h1, h2, p { page-break-inside: avoid; }
          .scores-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; page-break-inside: avoid; }
        }
      `}</style>
      <PublicHeader />

      <div className="clarity-check-results">
        {/* Print Button */}
        <div className="print-hide text-right px-6 pt-6">
          <button
            onClick={() => window.print()}
            className="inline-block px-6 py-3 bg-warmCharcoal text-white font-marcellus rounded-lg hover:bg-warmCharcoal/90 transition-colors"
          >
            Print Results
          </button>
        </div>

        <div className="results-container max-w-2xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-italiana text-warmCharcoal mb-4">
              Your Clarity Check Results
            </h1>
            <p className="text-lg text-warmCharcoal/70 font-marcellus">
              Where you are right now —{' '}
              {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Total Score — always visible */}
          <div className="bg-gradient-to-r from-lavenderViolet to-indigoDeep text-white rounded-lg p-12 mb-8 text-center">
            <p className="text-lg font-marcellus opacity-90 mb-3">Total Score</p>
            <p className="text-6xl font-italiana mb-2">{results.scores.totalScore}</p>
            <p className="font-marcellus opacity-75">out of 35</p>
          </div>

          {/* Identity Type — always visible */}
          {results.identityType && (
            <div className="mb-12">
              <h2 className="text-2xl font-italiana text-warmCharcoal mb-6">Your Identity Type</h2>
              <div className="bg-gradient-to-r from-lavenderViolet/10 to-indigoDeep/10 rounded-lg p-8 border-2 border-lavenderViolet/20">
                <p className="text-3xl font-italiana text-warmCharcoal mb-2">{results.identityType}</p>
                <p className="text-warmCharcoal/60 font-marcellus text-sm">
                  Enter your email below to unlock what this means for you and your personalized next steps.
                </p>
              </div>
            </div>
          )}

          {/* Locked preview — blurred teaser always visible */}
          {!captureSubmitted && (
            <div className="mb-12">
              {/* Blurred content teaser */}
              <div style={{ filter: 'blur(5px)', pointerEvents: 'none', userSelect: 'none' }} aria-hidden="true" className="mb-2">
                <div className="mb-6">
                  <h2 className="text-2xl font-italiana text-warmCharcoal mb-4">Dimension Scores</h2>
                  <div className="scores-grid grid grid-cols-2 gap-4">
                    {['Internal Clarity', 'Readiness for Support', 'Friction Between Insight & Action', 'Integration & Momentum'].map((label) => (
                      <div key={label} className="bg-warmCharcoal/5 rounded-lg p-4 border border-warmCharcoal/10">
                        <p className="text-sm font-italiana text-lavenderViolet text-center mb-1">{label}</p>
                        <p className="text-3xl font-italiana text-warmCharcoal">—</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <h2 className="text-2xl font-italiana text-warmCharcoal mb-3">Your Summary</h2>
                  <div className="bg-warmCharcoal/5 border-l-4 border-lavenderViolet rounded-lg p-6">
                    <p className="text-base text-warmCharcoal font-marcellus leading-relaxed">
                      Your personalized summary reveals where you are right now and what's keeping you from moving forward with clarity and confidence.
                    </p>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-italiana text-warmCharcoal mb-3">Your Next Step</h2>
                  <div className="bg-gradient-to-r from-lavenderViolet/10 to-indigoDeep/10 rounded-lg p-6">
                    <p className="text-base text-warmCharcoal font-marcellus leading-relaxed">
                      Your next step is a specific, personalized action designed to help you move from insight to momentum right now.
                    </p>
                  </div>
                </div>
              </div>

              {/* Unlock button — opens modal */}
              <div className="text-center mt-8">
                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-block px-10 py-4 rounded-full font-marcellus text-white text-lg hover:opacity-90 transition-opacity"
                  style={{ background: 'linear-gradient(to right, #9C88FF, #4B4E6D)' }}
                >
                  Unlock My Full Results →
                </button>
                <p className="text-xs text-warmCharcoal/40 font-marcellus mt-3">Free — no spam, unsubscribe anytime.</p>
              </div>
            </div>
          )}



          {/* Full results — shown after email submitted */}
          {captureSubmitted && (
            <>
              {/* Dimension Scores */}
              <div className="mb-12">
                <h2 className="text-2xl font-italiana text-warmCharcoal mb-8">Dimension Scores</h2>
                <div className="scores-grid grid grid-cols-2 gap-6">
                  <div className="bg-warmCharcoal/5 rounded-lg p-6 border border-warmCharcoal/10">
                    <p className="text-base font-italiana text-lavenderViolet text-center mb-2">Internal Clarity</p>
                    <p className="text-4xl font-italiana text-warmCharcoal mb-1">{results.scores.internalClarity}</p>
                    <p className="text-xs font-marcellus text-warmCharcoal/50">out of 10</p>
                  </div>
                  <div className="bg-warmCharcoal/5 rounded-lg p-6 border border-warmCharcoal/10">
                    <p className="text-base font-italiana text-lavenderViolet text-center mb-2">Readiness for Support</p>
                    <p className="text-4xl font-italiana text-warmCharcoal mb-1">{results.scores.readinessForSupport}</p>
                    <p className="text-xs font-marcellus text-warmCharcoal/50">out of 10</p>
                  </div>
                  <div className="bg-warmCharcoal/5 rounded-lg p-6 border border-warmCharcoal/10">
                    <p className="text-base font-italiana text-lavenderViolet text-center mb-2">Friction Between Insight & Action</p>
                    <p className="text-4xl font-italiana text-warmCharcoal mb-1">{results.scores.frictionBetweenInsightAndAction}</p>
                    <p className="text-xs font-marcellus text-warmCharcoal/50">out of 10</p>
                  </div>
                  <div className="bg-warmCharcoal/5 rounded-lg p-6 border border-warmCharcoal/10">
                    <p className="text-base font-italiana text-lavenderViolet text-center mb-2">Integration & Momentum</p>
                    <p className="text-4xl font-italiana text-warmCharcoal mb-1">{results.scores.integrationAndMomentum}</p>
                    <p className="text-xs font-marcellus text-warmCharcoal/50">out of 5</p>
                  </div>
                </div>
              </div>

              {/* Identity Type full blurb */}
              {results.identityType && (
                <div className="mb-12">
                  <h2 className="text-2xl font-italiana text-warmCharcoal mb-6">What Your Identity Type Means</h2>
                  <div className="bg-gradient-to-r from-lavenderViolet/10 to-indigoDeep/10 rounded-lg p-8 border-2 border-lavenderViolet/20">
                    <p className="text-3xl font-italiana text-warmCharcoal mb-4">{results.identityType}</p>
                    <p className="text-lg text-warmCharcoal font-marcellus leading-relaxed">
                      {results.identityType === 'Visionary' && 'You see possibilities others miss and inspire change. You lead transformation and pioneer new approaches with a focus on future impact.'}
                      {results.identityType === 'Builder' && 'You get things done and build reliable systems. You create practical plans, execute systematically, and deliver sustainable results.'}
                      {results.identityType === 'Nurturer' && 'You understand people and create supportive environments. You care deeply about relationships and nurture growth in yourself and others.'}
                      {results.identityType === 'Strategist' && 'You think strategically and solve complex problems. You analyze data, optimize for the best outcomes, and develop winning strategies.'}
                      {results.identityType === 'Creator' && 'You innovate and bring fresh perspectives. You explore creative possibilities, express your unique vision, and bring new ideas to life.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="mb-12">
                <h2 className="text-2xl font-italiana text-warmCharcoal mb-6">Your Summary</h2>
                <div className="bg-warmCharcoal/5 border-l-4 border-lavenderViolet rounded-lg p-8">
                  <p className="text-lg text-warmCharcoal font-marcellus leading-relaxed">{results.resultSummary}</p>
                </div>
              </div>

              {/* Next Step */}
              <div className="mb-12">
                <h2 className="text-2xl font-italiana text-warmCharcoal mb-6">Your Next Step</h2>
                <div className="bg-gradient-to-r from-lavenderViolet/10 to-indigoDeep/10 rounded-lg p-8">
                  <p className="text-lg text-warmCharcoal font-marcellus leading-relaxed">{results.nextStep}</p>
                </div>
              </div>
            </>
          )}

          {/* CTA section */}
          <div className="print-hide text-center pt-4 space-y-6">
            {captureSubmitted && (
              <div className="max-w-md mx-auto bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 font-marcellus mb-4">
                ✓ Check your inbox! Your full results and personalized next steps are on the way.
              </div>
            )}

            {/* Starter Pack Offer — shown after email submitted */}
            {captureSubmitted && (
              <div className="max-w-md mx-auto bg-gradient-to-br from-lavenderViolet/10 to-salmonPeach/10 rounded-2xl p-6 sm:p-8 border border-lavenderViolet/20">
                <h3 className="text-2xl font-italiana text-warmCharcoal mb-3">
                  Ready to Turn Insight Into Action?
                </h3>
                <p className="text-warmCharcoal/70 font-marcellus mb-2">
                  The iPurpose Starter Pack gives you the tools, templates, and clarity framework to move
                  from where you are to where you want to be.
                </p>
                <p className="text-3xl font-italiana text-lavenderViolet mb-4">$27</p>
                <a
                  href="/starter-pack"
                  className="inline-block w-full px-8 py-4 bg-gradient-to-r from-lavenderViolet to-indigoDeep text-white rounded-full font-marcellus text-lg hover:opacity-90 transition-opacity text-center"
                >
                  Get the Starter Pack →
                </a>
              </div>
            )}

            {captureSubmitted && (
              <button
                onClick={() => window.print()}
                className="inline-block px-8 py-4 bg-warmCharcoal text-white rounded-full font-marcellus text-lg hover:opacity-90 transition-opacity"
              >
                Print / Save as PDF
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Email Capture Modal */}
      {modalOpen && !captureSubmitted && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(42, 42, 42, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 9999,
          }}
        >
          <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '448px', padding: '32px', position: 'relative', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            <button
              onClick={() => setModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#aaa', lineHeight: 1 }}
              aria-label="Close"
            >
              ✕
            </button>

            <p className="text-3xl font-italiana text-warmCharcoal mb-2 text-center">Unlock Your Full Results</p>
            <p className="text-warmCharcoal/70 font-marcellus text-sm mb-6 text-center">
              Enter your email to receive your dimension breakdown, personalized summary, and next steps — free.
            </p>
            <form onSubmit={handleEmailCapture} className="space-y-4">
              <input
                type="text"
                required
                value={captureName}
                onChange={(e) => setCaptureName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-lavenderViolet/20 bg-white text-warmCharcoal placeholder-warmCharcoal/50 focus:outline-none focus:ring-2 focus:ring-lavenderViolet/50 font-marcellus"
                placeholder="Your name"
              />
              <input
                type="email"
                required
                value={captureEmail}
                onChange={(e) => setCaptureEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-lavenderViolet/20 bg-white text-warmCharcoal placeholder-warmCharcoal/50 focus:outline-none focus:ring-2 focus:ring-lavenderViolet/50 font-marcellus"
                placeholder="your@email.com"
              />
              {/* Honeypot field */}
              <div style={{ display: 'none' }}>
                <input
                  type="text"
                  value={captureWebsite}
                  onChange={(e) => setCaptureWebsite(e.target.value)}
                  autoComplete="off"
                  tabIndex={-1}
                />
              </div>
              {captureError && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{captureError}</div>
              )}
              <button
                type="submit"
                disabled={captureLoading}
                className="w-full px-6 py-4 rounded-full font-marcellus text-white text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(to right, #9C88FF, #4B4E6D)' }}
              >
                {captureLoading ? 'Sending...' : 'Send My Full Results →'}
              </button>
              <p className="text-xs text-warmCharcoal/40 font-marcellus text-center">No spam. Unsubscribe anytime.</p>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
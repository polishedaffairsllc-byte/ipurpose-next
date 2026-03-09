'use client';

import { useEffect, useState } from 'react';
import PrintButton from './PrintButton';
import { trackClarityCheckCompleted } from '@/lib/analytics';

interface SubmissionData {
  email: string;
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
  createdAt: any;
}

interface Props {
  submission: SubmissionData;
  submissionId: string;
}

function getIdentityBlurb(identityType: string): string {
  const blurbs: Record<string, string> = {
    Visionary: 'You see possibilities others miss and inspire change. You lead transformation and pioneer new approaches with a focus on future impact.',
    Builder: 'You get things done and build reliable systems. You create practical plans, execute systematically, and deliver sustainable results.',
    Nurturer: 'You understand people and create supportive environments. You care deeply about relationships and nurture growth in yourself and others.',
    Strategist: 'You think strategically and solve complex problems. You analyze data, optimize for the best outcomes, and develop winning strategies.',
    Creator: 'You innovate and bring fresh perspectives. You explore creative possibilities, express your unique vision, and bring new ideas to life.',
  };
  return blurbs[identityType] || '';
}

export default function ClarityCheckResultsClient({ submission, submissionId }: Props) {
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [captureEmail, setCaptureEmail] = useState('');
  const [captureName, setCaptureName] = useState('');
  const [captureWebsite, setCaptureWebsite] = useState(''); // Honeypot
  const [captureLoading, setCaptureLoading] = useState(false);
  const [captureSubmitted, setCaptureSubmitted] = useState(false);
  const [captureError, setCaptureError] = useState('');

  // Track clarity check completion when results are viewed
  useEffect(() => {
    trackClarityCheckCompleted(submission.email);
    // Mark quiz as completed in localStorage for nav visibility
    if (typeof window !== 'undefined') {
      localStorage.setItem('clarityCheckCompleted', 'true');
    }
  }, [submission.email]);

  const handleEmailCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    setCaptureError('');
    setCaptureLoading(true);

    try {
      const res = await fetch('/api/leads/clarity-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: captureName, email: captureEmail, website: captureWebsite }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save your email');
      }

      if (data.ok) {
        setCaptureSubmitted(true);
      } else {
        throw new Error(data.error || 'Failed to save your email');
      }
    } catch (err) {
      setCaptureError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setCaptureLoading(false);
    }
  };

  const createdDate = submission.createdAt?.toDate
    ? submission.createdAt.toDate()
    : new Date();

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

      {/* Print Button - only visible on screen */}
      <div className="print-hide sticky top-0 bg-white/95 backdrop-blur-sm border-b border-warmCharcoal/10 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <a
            href="/clarity-check-numeric"
            className="text-warmCharcoal font-marcellus hover:text-lavenderViolet transition-colors"
          >
            ← Back
          </a>
          <PrintButton />
        </div>
      </div>

      <div className="clarity-check-results max-w-4xl mx-auto px-6 py-12">
        <div className="results-container">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-italiana text-warmCharcoal mb-4">
              Your Clarity Score
            </h1>
            <p className="text-2xl text-warmCharcoal/75 font-marcellus">
              {createdDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {/* Total Score - Large Display */}
          <div className="text-center mb-12 p-8 bg-gradient-to-br from-lavenderViolet/10 to-salmonPeach/10 rounded-2xl">
            <div className="text-7xl font-italiana text-lavenderViolet font-bold mb-2">
              {submission.scores.totalScore}
            </div>
            <p className="text-2xl text-warmCharcoal font-marcellus">{submission.resultSummary}</p>
          </div>

          {/* Four Clarity Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 scores-grid">
            {/* Internal Clarity */}
            <div className="p-6 border border-lavenderViolet/20 rounded-xl">
              <p className="text-sm font-marcellus text-warmCharcoal/60 mb-2">INTERNAL CLARITY</p>
              <div className="text-4xl font-italiana text-warmCharcoal mb-2">
                {submission.scores.internalClarity}
              </div>
              <div className="w-full bg-warmCharcoal/10 rounded-full h-2">
                <div
                  className="bg-lavenderViolet h-2 rounded-full transition-all"
                  style={{ width: `${submission.scores.internalClarity}%` }}
                ></div>
              </div>
            </div>

            {/* Readiness for Support */}
            <div className="p-6 border border-lavenderViolet/20 rounded-xl">
              <p className="text-sm font-marcellus text-warmCharcoal/60 mb-2">READINESS FOR SUPPORT</p>
              <div className="text-4xl font-italiana text-warmCharcoal mb-2">
                {submission.scores.readinessForSupport}
              </div>
              <div className="w-full bg-warmCharcoal/10 rounded-full h-2">
                <div
                  className="bg-lavenderViolet h-2 rounded-full transition-all"
                  style={{ width: `${submission.scores.readinessForSupport}%` }}
                ></div>
              </div>
            </div>

            {/* Friction Between Insight & Action */}
            <div className="p-6 border border-lavenderViolet/20 rounded-xl">
              <p className="text-sm font-marcellus text-warmCharcoal/60 mb-2">FRICTION BETWEEN INSIGHT & ACTION</p>
              <div className="text-4xl font-italiana text-warmCharcoal mb-2">
                {submission.scores.frictionBetweenInsightAndAction}
              </div>
              <div className="w-full bg-warmCharcoal/10 rounded-full h-2">
                <div
                  className="bg-lavenderViolet h-2 rounded-full transition-all"
                  style={{ width: `${submission.scores.frictionBetweenInsightAndAction}%` }}
                ></div>
              </div>
            </div>

            {/* Integration & Momentum */}
            <div className="p-6 border border-lavenderViolet/20 rounded-xl">
              <p className="text-sm font-marcellus text-warmCharcoal/60 mb-2">INTEGRATION & MOMENTUM</p>
              <div className="text-4xl font-italiana text-warmCharcoal mb-2">
                {submission.scores.integrationAndMomentum}
              </div>
              <div className="w-full bg-warmCharcoal/10 rounded-full h-2">
                <div
                  className="bg-lavenderViolet h-2 rounded-full transition-all"
                  style={{ width: `${submission.scores.integrationAndMomentum}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="space-y-8 mb-12">
            <div>
              <h2 className="text-3xl font-italiana text-warmCharcoal mb-4">Your Results</h2>
              <p className="text-lg text-warmCharcoal/80 font-marcellus leading-relaxed whitespace-pre-wrap">
                {submission.resultDetail}
              </p>
            </div>

            {submission.identityType && (
              <div>
                <h2 className="text-3xl font-italiana text-warmCharcoal mb-4">Your Identity: {submission.identityType}</h2>
                <p className="text-lg text-warmCharcoal/80 font-marcellus leading-relaxed">
                  {getIdentityBlurb(submission.identityType)}
                </p>
              </div>
            )}

            {submission.nextStep && (
              <div>
                <h2 className="text-3xl font-italiana text-warmCharcoal mb-4">Your Next Step</h2>
                <p className="text-lg text-warmCharcoal/80 font-marcellus leading-relaxed whitespace-pre-wrap">
                  {submission.nextStep}
                </p>
              </div>
            )}
          </div>

          {/* CTA - Email Capture then Starter Pack */}
          <div className="print-hide text-center pt-8 space-y-6 mb-12">
            {!showEmailCapture && !captureSubmitted && (
              <button
                onClick={() => setShowEmailCapture(true)}
                className="inline-block px-8 py-4 bg-gradient-to-r from-lavenderViolet to-indigoDeep text-white rounded-full font-marcellus text-lg hover:opacity-90 transition-opacity cursor-pointer"
              >
                Get My Full Results + Next Steps
              </button>
            )}

            {showEmailCapture && !captureSubmitted && (
              <div className="max-w-md mx-auto bg-gradient-to-br from-lavenderViolet/5 to-salmonPeach/5 rounded-2xl p-6 sm:p-8 border border-lavenderViolet/10">
                <h3 className="text-2xl font-italiana text-warmCharcoal mb-3">
                  Get Your Personalized Next Steps
                </h3>
                <p className="text-warmCharcoal/70 font-marcellus mb-6">
                  Enter your email to download your results and get your personalized next steps.
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
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                      {captureError}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={captureLoading}
                    className="w-full px-6 py-3 rounded-full font-marcellus text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0))' }}
                  >
                    {captureLoading ? 'Sending...' : 'Send My Results'}
                  </button>
                </form>
              </div>
            )}

            {captureSubmitted && (
              <div className="space-y-6">
                <div className="max-w-md mx-auto bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 font-marcellus">
                  ✓ Check your inbox! Your full results and personalized next steps are on the way.
                </div>
                
                {/* Starter Pack Offer - $27 */}
                <div className="max-w-md mx-auto bg-gradient-to-br from-lavenderViolet/10 to-salmonPeach/10 rounded-2xl p-6 sm:p-8 border border-lavenderViolet/20">
                  <h3 className="text-2xl font-italiana text-warmCharcoal mb-3">
                    Ready to Turn Insight Into Action?
                  </h3>
                  <p className="text-warmCharcoal/70 font-marcellus mb-2">
                    The iPurpose Starter Pack gives you the tools, templates, and clarity framework to move from where you are to where you want to be.
                  </p>
                  <p className="text-3xl font-italiana text-lavenderViolet mb-4">
                    $27
                  </p>
                  <a
                    href="/starter-pack"
                    className="inline-block w-full px-8 py-4 bg-gradient-to-r from-lavenderViolet to-indigoDeep text-white rounded-full font-marcellus text-lg hover:opacity-90 transition-opacity text-center"
                  >
                    Get the Starter Pack →
                  </a>
                </div>
              </div>
            )}

            {!captureSubmitted && (
              <p className="text-sm text-warmCharcoal/60 font-marcellus">
                Your results are displayed above. Enter your email to save them and get next steps.
              </p>
            )}
          </div>

          {/* Footer - only visible on screen */}
          <div className="print-hide text-center pt-8 space-y-4">
            <div className="text-sm text-warmCharcoal/60 font-marcellus space-y-2">
              <p>Keep this page bookmarked for future reference.</p>
              <p>Submission ID: {submissionId}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

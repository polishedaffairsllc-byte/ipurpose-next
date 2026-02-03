'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FloatingLogo from '../components/FloatingLogo';
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
  summary: string;
  nextStep: string;
}

export default function ClarityCheckNumericPage() {
  const [email, setEmail] = useState('');
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<ResultsData | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  const questions = [
    // Dimension 1: Internal Clarity
    {
      id: 1,
      text: 'I can clearly articulate what I am trying to build and why it matters to me.',
      dimension: 'Internal Clarity',
    },
    {
      id: 2,
      text: 'My decisions feel guided more by internal alignment than by external pressure.',
      dimension: 'Internal Clarity',
    },
    {
      id: 3,
      text: 'I trust my sense of direction, even when the path ahead is not fully defined.',
      dimension: 'Internal Clarity',
    },
    // Dimension 2: Readiness for Support
    {
      id: 4,
      text: 'I am open to receiving guidance or structure rather than trying to figure everything out alone.',
      dimension: 'Readiness for Support',
    },
    {
      id: 5,
      text: 'I recognize that my next level may require support I do not currently have.',
      dimension: 'Readiness for Support',
    },
    {
      id: 6,
      text: 'I feel ready to invest time, attention, or resources into gaining clarity.',
      dimension: 'Readiness for Support',
    },
    // Dimension 3: Friction Between Insight and Action
    {
      id: 7,
      text: 'I often know what needs to change, but struggle to translate that insight into action.',
      dimension: 'Friction Between Insight and Action',
    },
    {
      id: 8,
      text: 'I feel stalled not because of lack of ideas, but because I lack a clear container or process.',
      dimension: 'Friction Between Insight and Action',
    },
    {
      id: 9,
      text: 'When I gain insight, I sometimes feel overwhelmed about what to do next.',
      dimension: 'Friction Between Insight and Action',
    },
    // Integration & Momentum
    {
      id: 10,
      text: 'I know what my most meaningful next step is right now.',
      dimension: 'Integration & Momentum',
    },
    {
      id: 11,
      text: 'I feel capable of taking that next step without forcing or burning myself out.',
      dimension: 'Integration & Momentum',
    },
    {
      id: 12,
      text: 'I feel supported by my current systems, tools, or environment.',
      dimension: 'Integration & Momentum',
    },
  ];

  const handleResponse = (questionId: number, value: number) => {
    setResponses({ ...responses, [questionId]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    const answeredCount = Object.keys(responses).length;
    if (answeredCount !== 12) {
      setError(`Please answer all 12 questions. You've answered ${answeredCount}.`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/clarity-check/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          responses,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to submit clarity check');
        setLoading(false);
        return;
      }

      // Store results data and show results screen
      setResults({
        scores: data.scores,
        summary: data.summary,
        nextStep: data.nextStep,
      });
      setLoading(false);
      setSubmitted(true);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
      setLoading(false);
    }
  };

  if (submitted && results) {
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
        <FloatingLogo />
        <PublicHeader />

        <div className="clarity-check-results">
          {/* Print Button */}
          <div className="print-hide text-right mb-8">
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
                Where you are right now — {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Total Score */}
            <div className="bg-gradient-to-r from-lavenderViolet to-indigoDeep text-white rounded-lg p-12 mb-12 text-center">
              <p className="text-lg font-marcellus opacity-90 mb-3">Total Score</p>
              <p className="text-6xl font-italiana mb-2">{results.scores.totalScore}</p>
              <p className="font-marcellus opacity-75">out of 60</p>
            </div>

            {/* Dimension Scores */}
            <div className="mb-12">
              <h2 className="text-2xl font-italiana text-warmCharcoal mb-8">Dimension Scores</h2>
              <div className="scores-grid grid grid-cols-2 gap-6">
                <div className="bg-warmCharcoal/5 rounded-lg p-6 border border-warmCharcoal/10">
                  <p className="text-sm font-marcellus text-warmCharcoal/60 uppercase tracking-wide mb-2">
                    Internal Clarity
                  </p>
                  <p className="text-4xl font-italiana text-warmCharcoal mb-1">
                    {results.scores.internalClarity}
                  </p>
                  <p className="text-xs font-marcellus text-warmCharcoal/50">out of 15</p>
                </div>

                <div className="bg-warmCharcoal/5 rounded-lg p-6 border border-warmCharcoal/10">
                  <p className="text-sm font-marcellus text-warmCharcoal/60 uppercase tracking-wide mb-2">
                    Readiness for Support
                  </p>
                  <p className="text-4xl font-italiana text-warmCharcoal mb-1">
                    {results.scores.readinessForSupport}
                  </p>
                  <p className="text-xs font-marcellus text-warmCharcoal/50">out of 15</p>
                </div>

                <div className="bg-warmCharcoal/5 rounded-lg p-6 border border-warmCharcoal/10">
                  <p className="text-sm font-marcellus text-warmCharcoal/60 uppercase tracking-wide mb-2">
                    Friction Between Insight & Action
                  </p>
                  <p className="text-4xl font-italiana text-warmCharcoal mb-1">
                    {results.scores.frictionBetweenInsightAndAction}
                  </p>
                  <p className="text-xs font-marcellus text-warmCharcoal/50">out of 15</p>
                </div>

                <div className="bg-warmCharcoal/5 rounded-lg p-6 border border-warmCharcoal/10">
                  <p className="text-sm font-marcellus text-warmCharcoal/60 uppercase tracking-wide mb-2">
                    Integration & Momentum
                  </p>
                  <p className="text-4xl font-italiana text-warmCharcoal mb-1">
                    {results.scores.integrationAndMomentum}
                  </p>
                  <p className="text-xs font-marcellus text-warmCharcoal/50">out of 15</p>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="mb-12">
              <h2 className="text-2xl font-italiana text-warmCharcoal mb-6">Your Summary</h2>
              <div className="bg-warmCharcoal/5 border-l-4 border-lavenderViolet rounded-lg p-8">
                <p className="text-lg text-warmCharcoal font-marcellus leading-relaxed">
                  {results.summary}
                </p>
              </div>
            </div>

            {/* Next Step */}
            <div className="mb-12">
              <h2 className="text-2xl font-italiana text-warmCharcoal mb-6">Your Next Step</h2>
              <div className="bg-gradient-to-r from-lavenderViolet/10 to-indigoDeep/10 rounded-lg p-8">
                <p className="text-lg text-warmCharcoal font-marcellus leading-relaxed">
                  {results.nextStep}
                </p>
              </div>
            </div>

            {/* CTA and Footer */}
            <div className="print-hide text-center pt-8">
              <a
                href="/programs"
                className="inline-block px-8 py-4 bg-gradient-to-r from-lavenderViolet to-indigoDeep text-white rounded-full font-marcellus text-lg hover:opacity-90 transition-opacity mb-8"
              >
                Explore Programs
              </a>
              <p className="text-sm text-warmCharcoal/60 font-marcellus">
                Your results have been sent to your email. Keep this page for your records.
              </p>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white">
      <FloatingLogo />
      <PublicHeader />

      <div className="container max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-italiana text-warmCharcoal mb-6">
            Clarity Check
          </h1>
          <p className="text-xl text-warmCharcoal/75 font-marcellus">
            Where you are right now
          </p>
          <p className="text-lg text-warmCharcoal/65 mt-4">
            A moment to reflect on your clarity, readiness, and momentum. Be honest—there are no wrong answers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Questions by Dimension */}
          {['Internal Clarity', 'Readiness for Support', 'Friction Between Insight and Action', 'Integration & Momentum'].map((dimension) => (
            <div key={dimension} className="space-y-8 pb-12 border-b border-warmCharcoal/10">
              <h2 className="text-2xl font-marcellus text-warmCharcoal">{dimension}</h2>
              {questions
                .filter((q) => q.dimension === dimension)
                .map((question) => (
                  <div key={question.id} className="space-y-4">
                    <p className="text-lg text-warmCharcoal/85 font-marcellus">
                      {question.id}. {question.text}
                    </p>
                    <div className="flex w-full justify-between">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleResponse(question.id, value)}
                          className={`w-12 h-12 rounded-full font-marcellus text-sm transition-all transform flex items-center justify-center ${
                            responses[question.id] === value
                              ? 'bg-warmCharcoal text-warmCharcoal'
                              : 'bg-warmCharcoal/5 text-warmCharcoal/60 hover:bg-warmCharcoal/10'
                          }`}
                        >
                          {responses[question.id] === value ? '✕' : value}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-warmCharcoal/50 font-marcellus">
                      <span>Not true at all</span>
                      <span>Very true</span>
                    </div>
                  </div>
                ))}
            </div>
          ))}

          {/* Email Input */}
          <div className="space-y-4">
            <label htmlFor="email" className="block text-lg font-marcellus text-warmCharcoal">
              Where should we send your results?
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-6 py-4 border border-warmCharcoal/20 rounded-lg font-marcellus text-warmCharcoal placeholder:text-warmCharcoal/40 focus:outline-none focus:border-lavenderViolet focus:ring-2 focus:ring-lavenderViolet/20"
            />
          </div>

          {/* Submit Button */}
          <div className="text-center pt-8">
            <button
              type="submit"
              disabled={loading}
              className="px-12 py-5 bg-gradient-to-r from-lavenderViolet to-indigoDeep text-white rounded-full font-marcellus text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit & Receive Your Results'}
            </button>
            <p className="text-sm text-warmCharcoal/60 mt-4">
              Your email will be used only to send your results. We don't share your data.
            </p>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}

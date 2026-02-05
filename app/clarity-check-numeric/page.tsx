'use client';

import { useState } from 'react';
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
}

export default function ClarityCheckNumericPage() {
  const [email, setEmail] = useState('');
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [identityResponses, setIdentityResponses] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<ResultsData | null>(null);
  const [submissionId, setSubmissionId] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const identityQuestions = [
    {
      id: 1,
      text: 'When facing a major decision, I typically:',
      options: {
        A: 'Envision the future impact and set a bold direction',
        B: 'Create a practical plan and execute systematically',
        C: 'Consider how it affects people and relationships',
        D: 'Analyze data and optimize for the best outcome',
        E: 'Explore creative possibilities and innovative solutions'
      }
    },
    {
      id: 2,
      text: 'My greatest strength in my work is:',
      options: {
        A: 'Seeing possibilities others miss and inspiring change',
        B: 'Getting things done and building reliable systems',
        C: 'Understanding people and creating supportive environments',
        D: 'Strategic thinking and solving complex problems',
        E: 'Innovation and bringing new ideas to life'
      }
    },
    {
      id: 3,
      text: 'I feel most energized when I\'m:',
      options: {
        A: 'Leading transformation and pioneering new approaches',
        B: 'Building foundations and seeing concrete progress',
        C: 'Nurturing growth in myself and others',
        D: 'Developing strategy and optimizing performance',
        E: 'Creating something original and expressing my vision'
      }
    },
    {
      id: 4,
      text: 'When starting something new, I focus on:',
      options: {
        A: 'The vision and why it matters',
        B: 'The steps and how to build it',
        C: 'The people and how to support them',
        D: 'The strategy and how to win',
        E: 'The concept and how to make it unique'
      }
    },
    {
      id: 5,
      text: 'Others would describe me as someone who:',
      options: {
        A: 'Inspires and challenges the status quo',
        B: 'Delivers results and builds sustainable systems',
        C: 'Cares deeply and creates connection',
        D: 'Thinks strategically and solves problems',
        E: 'Innovates and brings fresh perspectives'
      }
    }
  ];

  const questions = [
    // Dimension 1: Internal Clarity
    {
      id: 1,
      roman: 'I',
      text: 'I can clearly articulate what I am trying to build and why it matters to me.',
      dimension: 'Internal Clarity',
    },
    {
      id: 2,
      roman: 'II',
      text: 'My decisions feel guided more by internal alignment than by external pressure.',
      dimension: 'Internal Clarity',
    },
    {
      id: 3,
      roman: 'III',
      text: 'I trust my sense of direction, even when the path ahead is not fully defined.',
      dimension: 'Internal Clarity',
    },
    // Dimension 2: Readiness for Support
    {
      id: 4,
      roman: 'IV',
      text: 'I am open to receiving guidance or structure rather than trying to figure everything out alone.',
      dimension: 'Readiness for Support',
    },
    {
      id: 5,
      roman: 'V',
      text: 'I recognize that my next level may require support I do not currently have.',
      dimension: 'Readiness for Support',
    },
    {
      id: 6,
      roman: 'VI',
      text: 'I feel ready to invest time, attention, or resources into gaining clarity.',
      dimension: 'Readiness for Support',
    },
    // Dimension 3: Friction Between Insight and Action
    {
      id: 7,
      roman: 'VII',
      text: 'I often know what needs to change, but struggle to translate that insight into action.',
      dimension: 'Friction Between Insight and Action',
    },
    {
      id: 8,
      roman: 'VIII',
      text: 'I feel stalled not because of lack of ideas, but because I lack a clear container or process.',
      dimension: 'Friction Between Insight and Action',
    },
    {
      id: 9,
      roman: 'IX',
      text: 'When I gain insight, I sometimes feel overwhelmed about what to do next.',
      dimension: 'Friction Between Insight and Action',
    },
    // Integration & Momentum
    {
      id: 10,
      roman: 'X',
      text: 'I know what my most meaningful next step is right now.',
      dimension: 'Integration & Momentum',
    },
    {
      id: 11,
      roman: 'XI',
      text: 'I feel capable of taking that next step without forcing or burning myself out.',
      dimension: 'Integration & Momentum',
    },
    {
      id: 12,
      roman: 'XII',
      text: 'I feel supported by my current systems, tools, or environment.',
      dimension: 'Integration & Momentum',
    },
  ];

  const handleResponse = (questionId: number, value: number) => {
    setResponses({ ...responses, [questionId]: value });
  };

  const handleIdentityResponse = (questionId: number, value: string) => {
    setIdentityResponses({ ...identityResponses, [questionId]: value });
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
      const unansweredCount = 12 - answeredCount;
      setError(`Please answer all 12 questions. You have ${unansweredCount} unanswered question${unansweredCount > 1 ? 's' : ''}. Scroll up to see highlighted questions.`);
      
      // Scroll to first unanswered question
      const firstUnanswered = questions.find(q => !responses[q.id]);
      if (firstUnanswered) {
        const element = document.getElementById(`question-${firstUnanswered.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    // Validate identity questions
    const identityAnsweredCount = Object.keys(identityResponses).length;
    if (identityAnsweredCount !== 5) {
      const unansweredCount = 5 - identityAnsweredCount;
      setError(`Please answer all 5 identity questions. You have ${unansweredCount} unanswered identity question${unansweredCount > 1 ? 's' : ''}. Scroll up to see highlighted questions.`);
      
      // Scroll to first unanswered identity question
      const firstUnanswered = identityQuestions.find(q => !identityResponses[q.id]);
      if (firstUnanswered) {
        const element = document.getElementById(`identity-question-${firstUnanswered.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
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
          identityResponses: Object.values(identityResponses),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to submit clarity check');
        setLoading(false);
        return;
      }

      // Dev logging: warn if required fields are missing
      if (process.env.NODE_ENV === 'development') {
        if (!data.scores || !data.resultSummary) {
          console.warn('⚠️ API returned success but missing required fields:', {
            hasScores: !!data.scores,
            hasResultSummary: !!data.resultSummary,
            hasResultDetail: !!data.resultDetail,
            hasIdentityType: !!data.identityType,
            receivedData: data
          });
        }
      }

      // Store results data and show results screen
      setResults({
        scores: data.scores,
        resultSummary: data.resultSummary,
        resultDetail: data.resultDetail,
        nextStep: data.nextStep,
        identityType: data.identityType,
        identityCounts: data.identityCounts,
      });
      setSubmissionId(data.submissionId || '');
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
                  {results.resultSummary}
                </p>
              </div>
            </div>

            {/* Identity Type */}
            {results.identityType && (
              <div className="mb-12">
                <h2 className="text-2xl font-italiana text-warmCharcoal mb-6">Your Identity Type</h2>
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
            <div className="print-hide text-center pt-8 space-y-4">
              <button
                onClick={() => window.print()}
                className="inline-block px-8 py-4 bg-warmCharcoal text-white rounded-full font-marcellus text-lg hover:opacity-90 transition-opacity mr-4"
              >
                Print / Save as PDF
              </button>
              {submissionId && (
                <a
                  href={`/clarity-check/results/${submissionId}`}
                  className="inline-block px-8 py-4 bg-gradient-to-r from-lavenderViolet to-indigoDeep text-white rounded-full font-marcellus text-lg hover:opacity-90 transition-opacity"
                >
                  View Printable Results
                </a>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white">
      <style>{`
        @keyframes pulse-yellow {
          0%, 100% {
            background-color: rgb(254 249 195);
            border-color: rgb(250 204 21);
          }
          50% {
            background-color: rgb(254 240 138);
            border-color: rgb(234 179 8);
          }
        }
        .unanswered-question {
          animation: pulse-yellow 2s ease-in-out infinite;
        }
      `}</style>
      <PublicHeader />

      <div className="container max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-italiana text-warmCharcoal mb-6">
            Clarity Check
          </h1>
          <p className="text-warmCharcoal/75 font-marcellus" style={{ fontSize: '40px' }}>
            Where you are right now
          </p>
          <p className="text-warmCharcoal/65 mt-4" style={{ fontSize: '40px' }}>
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
                  <div 
                    key={question.id}
                    id={`question-${question.id}`}
                    className={`space-y-4 text-center p-6 rounded-lg transition-all ${
                      !responses[question.id] 
                        ? 'unanswered-question border-4 border-yellow-400 shadow-lg' 
                        : 'bg-white border-2 border-transparent'
                    }`}
                  >
                    <p className="text-warmCharcoal/85 font-marcellus" style={{ fontSize: '40px' }}>
                      {question.text}
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

          {/* Identity Questions Section */}
          <div className="space-y-8 pb-12 pt-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-italiana text-warmCharcoal mb-4">Discover Your Identity Type</h2>
              <p className="text-warmCharcoal/65 font-marcellus text-lg">
                These questions help us understand your natural approach and strengths.
              </p>
            </div>
            
            {identityQuestions.map((question) => (
              <div
                key={question.id}
                id={`identity-question-${question.id}`}
                className={`space-y-6 p-6 rounded-lg transition-all ${
                  !identityResponses[question.id]
                    ? 'unanswered-question border-4 border-yellow-400 shadow-lg'
                    : 'bg-white border-2 border-transparent'
                }`}
              >
                <p className="text-warmCharcoal font-marcellus text-xl font-semibold">
                  {question.text}
                </p>
                <div className="space-y-3">
                  {Object.entries(question.options).map(([key, value]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleIdentityResponse(question.id, key)}
                      className={`w-full text-left px-6 py-4 rounded-lg font-marcellus transition-all ${
                        identityResponses[question.id] === key
                          ? 'bg-lavenderViolet text-white shadow-md'
                          : 'bg-warmCharcoal/5 text-warmCharcoal hover:bg-warmCharcoal/10'
                      }`}
                    >
                      <span className="font-semibold mr-3">{key}.</span>
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Email Input */}
          <div className="space-y-4">
            <label htmlFor="email" className="block font-marcellus text-warmCharcoal" style={{ fontSize: '40px' }}>
              Enter your email to receive your results
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-6 py-6 border border-warmCharcoal/20 rounded-lg font-marcellus text-warmCharcoal placeholder:text-warmCharcoal/40 focus:outline-none focus:border-lavenderViolet focus:ring-2 focus:ring-lavenderViolet/20"
              style={{ fontSize: '40px' }}
            />
          </div>

          {/* Submit Button */}
          <div className="text-center pt-8">
            <button
              type="submit"
              disabled={loading}
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-full font-marcellus text-white text-center hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0))', fontSize: '35px' }}
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

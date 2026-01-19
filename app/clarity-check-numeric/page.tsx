'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FloatingLogo from '../components/FloatingLogo';
import PublicHeader from '../components/PublicHeader';
import Footer from '../components/Footer';

export default function ClarityCheckNumericPage() {
  const [email, setEmail] = useState('');
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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

      setSubmitted(true);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="relative min-h-screen bg-white">
        <FloatingLogo />
        <PublicHeader />
        <div className="container max-w-2xl mx-auto px-6 py-32 text-center">
          <h1 className="text-5xl md:text-6xl font-marcellus text-warmCharcoal mb-6">
            Thank you.
          </h1>
          <p className="text-xl md:text-2xl text-warmCharcoal/75 mb-8">
            Your clarity check has been received. Check your email for your results and a reflection on where you are right now.
          </p>
          <p className="text-lg text-warmCharcoal/70 mb-12">
            The path forward is clearer when you see it clearly. Take what resonates.
          </p>
          <a
            href="/"
            className="inline-block px-8 py-4 bg-gradient-to-r from-lavenderViolet to-indigoDeep text-white rounded-full font-marcellus text-lg hover:opacity-90 transition-opacity"
          >
            Return Home
          </a>
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
                    <div className="flex gap-3 justify-start">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleResponse(question.id, value)}
                          className={`w-12 h-12 rounded-full font-marcellus text-sm transition-all ${
                            responses[question.id] === value
                              ? 'bg-lavenderViolet text-white shadow-lg'
                              : 'bg-warmCharcoal/5 text-warmCharcoal/60 hover:bg-warmCharcoal/10'
                          }`}
                        >
                          {value}
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

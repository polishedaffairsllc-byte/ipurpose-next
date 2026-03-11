'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PublicHeader from '../components/PublicHeader';
import Footer from '../components/Footer';

export default function ClarityCheckQuizPage() {
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [identityResponses, setIdentityResponses] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
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
        E: 'Explore creative possibilities and innovative solutions',
      },
    },
    {
      id: 2,
      text: 'My greatest strength in my work is:',
      options: {
        A: 'Seeing possibilities others miss and inspiring change',
        B: 'Getting things done and building reliable systems',
        C: 'Understanding people and creating supportive environments',
        D: 'Strategic thinking and solving complex problems',
        E: 'Innovation and bringing new ideas to life',
      },
    },
    {
      id: 3,
      text: "I feel most energized when I'm:",
      options: {
        A: 'Leading transformation and pioneering new approaches',
        B: 'Building foundations and seeing concrete progress',
        C: 'Nurturing growth in myself and others',
        D: 'Developing strategy and optimizing performance',
        E: 'Creating something original and expressing my vision',
      },
    },
    {
      id: 4,
      text: 'When starting something new, I focus on:',
      options: {
        A: 'The vision and why it matters',
        B: 'The steps and how to build it',
        C: 'The people and how to support them',
        D: 'The strategy and how to win',
        E: 'The concept and how to make it unique',
      },
    },
    {
      id: 5,
      text: 'Others would describe me as someone who:',
      options: {
        A: 'Inspires and challenges the status quo',
        B: 'Delivers results and builds sustainable systems',
        C: 'Cares deeply and creates connection',
        D: 'Thinks strategically and solves problems',
        E: 'Innovates and brings fresh perspectives',
      },
    },
  ];

  const questions = [
    { id: 1, text: 'I can clearly articulate what I am trying to build and why it matters to me.', dimension: 'Internal Clarity' },
    { id: 2, text: 'My decisions feel guided more by internal alignment than by external pressure.', dimension: 'Internal Clarity' },
    { id: 3, text: 'I am open to receiving guidance or structure rather than trying to figure everything out alone.', dimension: 'Readiness for Support' },
    { id: 4, text: 'I feel ready to invest time, attention, or resources into gaining clarity.', dimension: 'Readiness for Support' },
    { id: 5, text: 'I often know what needs to change, but struggle to translate that insight into action.', dimension: 'Friction Between Insight and Action' },
    { id: 6, text: 'I feel stalled not because of lack of ideas, but because I lack a clear container or process.', dimension: 'Friction Between Insight and Action' },
    { id: 7, text: 'I know what my most meaningful next step is right now.', dimension: 'Integration & Momentum' },
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

    const answeredCount = Object.keys(responses).length;
    if (answeredCount !== 7) {
      const unansweredCount = 7 - answeredCount;
      setError(
        `Please answer all 7 state questions. You have ${unansweredCount} unanswered question${unansweredCount > 1 ? 's' : ''}. Scroll up to see highlighted questions.`
      );
      const firstUnanswered = questions.find((q) => !responses[q.id]);
      if (firstUnanswered) {
        document.getElementById(`question-${firstUnanswered.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const identityAnsweredCount = Object.keys(identityResponses).length;
    if (identityAnsweredCount !== 5) {
      const unansweredCount = 5 - identityAnsweredCount;
      setError(
        `Please answer all 5 identity questions. You have ${unansweredCount} unanswered identity question${unansweredCount > 1 ? 's' : ''}. Scroll up to see highlighted questions.`
      );
      const firstUnanswered = identityQuestions.find((q) => !identityResponses[q.id]);
      if (firstUnanswered) {
        document.getElementById(`identity-question-${firstUnanswered.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/clarity-check/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'anonymous@ipurposesoul.com',
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

      // Store results in sessionStorage for the results page to read
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

      // Mark quiz as completed in localStorage for nav visibility
      localStorage.setItem('clarityCheckCompleted', 'true');

      // Navigate to the dedicated results URL — this is what Google Ads tracks as a conversion
      router.push('/clarity-check-results');
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-white">
      <style>{`
        @keyframes pulse-yellow {
          0%, 100% { background-color: rgb(254 249 195); border-color: rgb(250 204 21); }
          50% { background-color: rgb(254 240 138); border-color: rgb(234 179 8); }
        }
        .unanswered-question { animation: pulse-yellow 2s ease-in-out infinite; }
      `}</style>
      <PublicHeader />

      <div className="container max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-italiana text-warmCharcoal mb-6">Clarity Check</h1>
          <p className="text-warmCharcoal/75 font-marcellus" style={{ fontSize: '40px' }}>
            Where you are right now
          </p>
          <p className="text-warmCharcoal/65 mt-4" style={{ fontSize: '40px' }}>
            7 state questions + 5 identity questions. Be honest—there are no wrong answers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
          )}

          {/* Questions by Dimension */}
          {['Internal Clarity', 'Readiness for Support', 'Friction Between Insight and Action', 'Integration & Momentum'].map((dimension) => (
            <div key={dimension} className="space-y-8 pb-12 border-b border-warmCharcoal/10">
              <h2 className="text-3xl font-italiana text-lavenderViolet text-center">{dimension}</h2>
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
              <p className="text-warmCharcoal/65 font-marcellus" style={{ fontSize: '35px' }}>
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
                <p className="text-warmCharcoal font-marcellus font-semibold text-center" style={{ fontSize: '35px' }}>
                  {question.text}
                </p>
                <div className="space-y-3">
                  {Object.entries(question.options).map(([key, value]) => {
                    const isSelected = identityResponses[question.id] === key;
                    const hasAnswer = identityResponses[question.id];
                    const shouldShow = !hasAnswer || isSelected;
                    if (!shouldShow) return null;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleIdentityResponse(question.id, key)}
                        className={`w-full text-center px-6 py-4 rounded-lg font-marcellus transition-all ${
                          isSelected
                            ? 'bg-lavenderViolet text-white shadow-md'
                            : 'bg-warmCharcoal/5 text-warmCharcoal hover:bg-warmCharcoal/10'
                        }`}
                        style={{ fontSize: '35px' }}
                      >
                        <span className="font-semibold mr-3">{key}.</span>
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
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
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}

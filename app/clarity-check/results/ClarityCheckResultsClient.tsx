'use client';

import { useEffect } from 'react';
import Link from 'next/link';
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
  // Track clarity check completion when results are viewed
  useEffect(() => {
    trackClarityCheckCompleted(submission.email);
  }, [submission.email]);

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

          {/* CTA - Direct to Starter Pack */}
          <div className="print-hide text-center pt-8 space-y-4 mb-12">
            <Link
              href="/starter-pack"
              className="inline-block px-8 py-4 bg-gradient-to-r from-lavenderViolet to-indigoDeep text-white rounded-full font-marcellus text-lg hover:opacity-90 transition-opacity"
            >
              Explore the Starter Pack ✨
            </Link>
            <p className="text-sm text-warmCharcoal/60 font-marcellus">
              Ready to turn insight into action? Take the Starter Pack to build clarity into coherent action.
            </p>
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

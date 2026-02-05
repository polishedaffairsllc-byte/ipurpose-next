import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    submissionId: string;
  }>;
}

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

async function getSubmission(submissionId: string): Promise<SubmissionData | null> {
  try {
    const doc = await firebaseAdmin
      .firestore()
      .collection('clarityCheckSubmissions')
      .doc(submissionId)
      .get();

    if (!doc.exists) {
      return null;
    }

    return doc.data() as SubmissionData;
  } catch (error) {
    console.error('Error fetching submission:', error);
    return null;
  }
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

export default async function ClarityCheckResultsPage({ params }: PageProps) {
  const { submissionId } = await params;
  const submission = await getSubmission(submissionId);

  if (!submission) {
    notFound();
  }

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
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-warmCharcoal text-white font-marcellus rounded-lg hover:bg-warmCharcoal/90 transition-colors"
          >
            Print / Save as PDF
          </button>
        </div>
      </div>

      <div className="clarity-check-results max-w-4xl mx-auto px-6 py-12">
        <div className="results-container">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-italiana text-warmCharcoal mb-4">
              Your Clarity Check Results
            </h1>
            <p className="text-lg text-warmCharcoal/70 font-marcellus">
              Taken on {createdDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Total Score */}
          <div className="bg-gradient-to-r from-lavenderViolet to-indigoDeep text-white rounded-lg p-12 mb-12 text-center">
            <p className="text-lg font-marcellus opacity-90 mb-3">Total Score</p>
            <p className="text-6xl font-italiana mb-2">{submission.scores.totalScore}</p>
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
                  {submission.scores.internalClarity}
                </p>
                <p className="text-xs font-marcellus text-warmCharcoal/50">out of 15</p>
              </div>

              <div className="bg-warmCharcoal/5 rounded-lg p-6 border border-warmCharcoal/10">
                <p className="text-sm font-marcellus text-warmCharcoal/60 uppercase tracking-wide mb-2">
                  Readiness for Support
                </p>
                <p className="text-4xl font-italiana text-warmCharcoal mb-1">
                  {submission.scores.readinessForSupport}
                </p>
                <p className="text-xs font-marcellus text-warmCharcoal/50">out of 15</p>
              </div>

              <div className="bg-warmCharcoal/5 rounded-lg p-6 border border-warmCharcoal/10">
                <p className="text-sm font-marcellus text-warmCharcoal/60 uppercase tracking-wide mb-2">
                  Friction Between Insight & Action
                </p>
                <p className="text-4xl font-italiana text-warmCharcoal mb-1">
                  {submission.scores.frictionBetweenInsightAndAction}
                </p>
                <p className="text-xs font-marcellus text-warmCharcoal/50">out of 15</p>
              </div>

              <div className="bg-warmCharcoal/5 rounded-lg p-6 border border-warmCharcoal/10">
                <p className="text-sm font-marcellus text-warmCharcoal/60 uppercase tracking-wide mb-2">
                  Integration & Momentum
                </p>
                <p className="text-4xl font-italiana text-warmCharcoal mb-1">
                  {submission.scores.integrationAndMomentum}
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
                {submission.resultSummary}
              </p>
            </div>
          </div>

          {/* Identity Type */}
          {submission.identityType && (
            <div className="mb-12">
              <h2 className="text-2xl font-italiana text-warmCharcoal mb-6">Your Identity Type</h2>
              <div className="bg-gradient-to-r from-lavenderViolet/10 to-indigoDeep/10 rounded-lg p-8 border-2 border-lavenderViolet/20">
                <p className="text-3xl font-italiana text-warmCharcoal mb-4">{submission.identityType}</p>
                <p className="text-lg text-warmCharcoal font-marcellus leading-relaxed">
                  {getIdentityBlurb(submission.identityType)}
                </p>
              </div>
            </div>
          )}

          {/* Next Step */}
          <div className="mb-12">
            <h2 className="text-2xl font-italiana text-warmCharcoal mb-6">Your Next Step</h2>
            <div className="bg-gradient-to-r from-lavenderViolet/10 to-indigoDeep/10 rounded-lg p-8">
              <p className="text-lg text-warmCharcoal font-marcellus leading-relaxed">
                {submission.nextStep}
              </p>
            </div>
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

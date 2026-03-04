import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { notFound } from 'next/navigation';
import ClarityCheckResultsClient from '../ClarityCheckResultsClient';

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

export default async function ClarityCheckResultsPage({ params }: PageProps) {
  const { submissionId } = await params;
  const submission = await getSubmission(submissionId);

  if (!submission) {
    notFound();
  }

  return <ClarityCheckResultsClient submission={submission} submissionId={submissionId} />;
}

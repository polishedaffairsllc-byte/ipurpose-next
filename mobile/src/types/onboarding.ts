export type OnboardingStatus = 'new' | 'partial' | 'complete';

export interface ClarityCheckResult {
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
  identityType: string;
}

export interface OnboardingState {
  status: OnboardingStatus;
  currentStep: number;
  clarityResponses: Record<string, number>;
  identityResponses: string[];
  focusAreasDraft: string[];
  claritySubmissionId?: string;
  result?: ClarityCheckResult;
}

export interface OnboardingDraft {
  currentStep: number;
  clarityResponses: Record<string, number>;
  identityResponses: string[];
  focusAreasDraft: string[];
  claritySubmissionId?: string;
}

export interface ClarityCheckSubmission extends ClarityCheckResult {
  success: boolean;
  submissionId: string;
  identityCounts?: Record<string, number>;
}

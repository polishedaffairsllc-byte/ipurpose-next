import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { hasExistingFocus, normalizeFocusAreas } from "@/lib/ai/profileFocus";

export type CompanionOnboardingStatus = "new" | "partial" | "complete";

export interface CompanionOnboardingResult {
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

export interface CompanionOnboardingState {
  status: CompanionOnboardingStatus;
  currentStep: number;
  clarityResponses: Record<string, number>;
  identityResponses: string[];
  focusAreasDraft: string[];
  claritySubmissionId?: string;
  result?: CompanionOnboardingResult;
}

export interface CompanionOnboardingDraft {
  currentStep: number;
  clarityResponses: Record<string, number>;
  identityResponses: string[];
  focusAreasDraft: string[];
  claritySubmissionId?: string;
}

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as UnknownRecord
    : {};
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function deriveOnboardingStatus(profile: unknown): CompanionOnboardingStatus {
  const data = asRecord(profile);
  const onboarding = asRecord(data.compassOnboarding);

  // An explicit partial state wins over the archetype grandfathering rule. A
  // new user receives an archetype before the final focus/completion write.
  if (onboarding.status === "in_progress") return "partial";
  if (onboarding.status === "complete") return "complete";
  if (asString(data.archetypePrimary)) return "complete";
  return "new";
}

export function normalizeOnboardingDraft(value: unknown): CompanionOnboardingDraft {
  const draft = asRecord(value);
  const rawClarity = asRecord(draft.clarityResponses);
  const clarityResponses: Record<string, number> = {};

  for (let question = 1; question <= 7; question += 1) {
    const answer = asNumber(rawClarity[String(question)]);
    if (answer !== undefined && Number.isInteger(answer) && answer >= 1 && answer <= 5) {
      clarityResponses[String(question)] = answer;
    }
  }

  const identityResponses = Array.isArray(draft.identityResponses)
    ? draft.identityResponses
        .filter((answer): answer is string =>
          typeof answer === "string" && ["A", "B", "C", "D", "E"].includes(answer)
        )
        .slice(0, 5)
    : [];
  const requestedStep = asNumber(draft.currentStep) ?? 0;
  const claritySubmissionId = asString(draft.claritySubmissionId);

  return {
    currentStep: Math.max(0, Math.min(14, Math.trunc(requestedStep))),
    clarityResponses,
    identityResponses,
    focusAreasDraft: normalizeFocusAreas(draft.focusAreasDraft)
      .filter((focusArea) => focusArea.length <= 160),
    ...(claritySubmissionId ? { claritySubmissionId } : {}),
  };
}

function parseResult(value: unknown): CompanionOnboardingResult | undefined {
  const data = asRecord(value);
  const scores = asRecord(data.scores);
  const internalClarity = asNumber(scores.internalClarity);
  const readinessForSupport = asNumber(scores.readinessForSupport);
  const frictionBetweenInsightAndAction = asNumber(scores.frictionBetweenInsightAndAction);
  const integrationAndMomentum = asNumber(scores.integrationAndMomentum);
  const totalScore = asNumber(scores.totalScore);
  const resultSummary = asString(data.resultSummary);
  const resultDetail = asString(data.resultDetail);
  const nextStep = asString(data.nextStep);
  const identityType = asString(data.identityType);

  if (
    internalClarity === undefined
    || readinessForSupport === undefined
    || frictionBetweenInsightAndAction === undefined
    || integrationAndMomentum === undefined
    || totalScore === undefined
    || !resultSummary
    || !resultDetail
    || !nextStep
    || !identityType
  ) return undefined;

  return {
    scores: {
      internalClarity,
      readinessForSupport,
      frictionBetweenInsightAndAction,
      integrationAndMomentum,
      totalScore,
    },
    resultSummary,
    resultDetail,
    nextStep,
    identityType,
  };
}

export async function getCompanionOnboardingState(
  uid: string
): Promise<CompanionOnboardingState> {
  const userDocument = await firebaseAdmin.firestore().collection("users").doc(uid).get();
  const profile = userDocument.exists ? asRecord(userDocument.data()) : {};
  const onboarding = asRecord(profile.compassOnboarding);
  const draft = normalizeOnboardingDraft(onboarding);
  const status = deriveOnboardingStatus(profile);
  let result: CompanionOnboardingResult | undefined;

  if (draft.claritySubmissionId) {
    const submission = await firebaseAdmin
      .firestore()
      .collection("clarityCheckSubmissions")
      .doc(draft.claritySubmissionId)
      .get();
    const submissionData = submission.exists ? asRecord(submission.data()) : {};
    if (submissionData.uid === uid) result = parseResult(submissionData);
  }

  return { status, ...draft, result };
}

export async function saveCompanionOnboardingDraft(
  uid: string,
  value: unknown
): Promise<CompanionOnboardingState> {
  const draft = normalizeOnboardingDraft(value);
  const userRef = firebaseAdmin.firestore().collection("users").doc(uid);
  const userDocument = await userRef.get();
  const profile = userDocument.exists ? asRecord(userDocument.data()) : {};

  if (deriveOnboardingStatus(profile) === "complete") {
    return getCompanionOnboardingState(uid);
  }

  const previous = asRecord(profile.compassOnboarding);
  await userRef.set(
    {
      compassOnboarding: {
        ...draft,
        status: "in_progress",
        startedAt: previous.startedAt
          || firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      },
      updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return getCompanionOnboardingState(uid);
}

export class CompanionOnboardingError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "CompanionOnboardingError";
  }
}

export async function completeCompanionOnboarding(uid: string): Promise<CompanionOnboardingState> {
  const userRef = firebaseAdmin.firestore().collection("users").doc(uid);

  await firebaseAdmin.firestore().runTransaction(async (transaction) => {
    const userDocument = await transaction.get(userRef);
    const profile = userDocument.exists ? asRecord(userDocument.data()) : {};
    const onboarding = asRecord(profile.compassOnboarding);
    if (onboarding.status === "complete") return;
    if (!asString(profile.archetypePrimary)) {
      throw new CompanionOnboardingError(
        "Complete the Clarity Check before finishing onboarding.",
        409
      );
    }
    if (!hasExistingFocus(profile)) {
      throw new CompanionOnboardingError(
        "Save your current focus before finishing onboarding.",
        409
      );
    }

    transaction.set(
      userRef,
      {
        compassOnboarding: {
          ...normalizeOnboardingDraft(onboarding),
          status: "complete",
          currentStep: 14,
          completedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        },
        updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  });

  return getCompanionOnboardingState(uid);
}

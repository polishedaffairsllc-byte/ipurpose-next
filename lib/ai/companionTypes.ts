import type { ResponseMode } from "@/lib/ai/prompts/ipurposeMentorPrompts";

export type CompanionMessageRole = "user" | "assistant";

export interface CompanionMessage {
  id: string;
  role: CompanionMessageRole;
  content: string;
  responseMode: ResponseMode;
  sequence: number;
  createdAt: string;
  inferredLens?: "soul" | "systems" | "ai";
}

export interface CompanionConversationSummary {
  id: string;
  title: string;
  responseMode: ResponseMode;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompanionProfileContext {
  displayName?: string;
  timezone?: string;
  archetypePrimary?: string;
  archetypeSecondary?: string;
  identityAnchor?: string;
  purposeStatement?: string;
  focusAreas: string[];
}

export interface CompanionClarityContext {
  identityType?: string;
  totalScore?: number;
  internalClarity?: number;
  readinessForSupport?: number;
  frictionBetweenInsightAndAction?: number;
  integrationAndMomentum?: number;
  resultSummary?: string;
  nextStep?: string;
  completedAt?: string;
}

export interface CompanionCheckInContext {
  alignmentScore?: number;
  emotions: string[];
  need?: string;
  recordedAt?: string;
}

export interface CompanionLabContext {
  labId: "identity" | "meaning" | "agency";
  status?: string;
  summary: string;
  updatedAt?: string;
}

export interface CompanionReflectionContext {
  source: "daily-session" | "journal";
  content: string;
  title?: string;
  recordedAt?: string;
}

export interface CompanionDailySessionContext {
  date: string;
  alignmentScore?: number;
  statedNeed?: string;
  completedLabs: string[];
  reflectionCount: number;
}

export interface CompanionContext {
  profile: CompanionProfileContext;
  clarityCheck?: CompanionClarityContext;
  recentCheckIns: CompanionCheckInContext[];
  recentDailySessions: CompanionDailySessionContext[];
  recentLabs: CompanionLabContext[];
  recentReflections: CompanionReflectionContext[];
  generatedAt: string;
}

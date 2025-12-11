/**
 * GPT API Types
 * Type definitions for GPT integration across iPurpose platform
 */

// ============================================================================
// Request Types
// ============================================================================

export type GPTDomain = 'soul' | 'systems' | 'ai-tools' | 'insights';

export interface GPTRequest {
  domain: GPTDomain;
  prompt: string;
  userId: string;
  context?: UserContext;
  options?: GPTOptions;
}

export interface GPTOptions {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  model?: string;
}

// ============================================================================
// Response Types
// ============================================================================

export interface GPTResponse {
  success: boolean;
  data?: {
    content: string;
    tokensUsed: number;
    model: string;
    timestamp: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface GPTStreamChunk {
  content: string;
  done: boolean;
}

// ============================================================================
// User Context Types (Firestore Integration)
// ============================================================================

export interface UserContext {
  userId: string;
  archetypes?: string[];
  currentPractices?: string[];
  businessGoals?: string[];
  recentInsights?: string[];
  preferences?: UserPreferences;
}

export interface UserPreferences {
  communicationStyle?: 'direct' | 'nurturing' | 'strategic';
  focusAreas?: string[];
  language?: string;
}

// ============================================================================
// Domain-Specific Context Types
// ============================================================================

export interface SoulContext extends UserContext {
  currentArchetype?: string;
  alignmentScore?: number;
  activeArchetypes?: string[];
  purposeStatement?: string;
  values?: string[];
}

export interface SystemsContext extends UserContext {
  activeWorkflows?: string[];
  offerStructure?: string[];
  integrations?: string[];
  automationPreferences?: string[];
}

export interface AIToolsContext extends UserContext {
  favoriteTools?: string[];
  recentPrompts?: string[];
  contentStyle?: string;
  brandVoice?: string;
}

export interface InsightsContext extends UserContext {
  metricPreferences?: string[];
  dashboardConfig?: Record<string, any>;
  reportingFrequency?: string;
}

// ============================================================================
// Prompt Engine Types
// ============================================================================

export interface PromptTemplate {
  id: string;
  domain: GPTDomain;
  template: string;
  variables: string[];
  systemPrompt?: string;
  examples?: PromptExample[];
}

export interface PromptExample {
  input: string;
  output: string;
}

export interface CompiledPrompt {
  systemPrompt: string;
  userPrompt: string;
  context: UserContext;
}

// ============================================================================
// Firestore Document Types
// ============================================================================

export interface GPTInteraction {
  id: string;
  userId: string;
  domain: GPTDomain;
  prompt: string;
  response: string;
  tokensUsed: number;
  timestamp: Date;
  context?: UserContext;
}

export interface UserContextDoc {
  userId: string;
  lastUpdated: Date;
  preferences?: UserPreferences;
  soul?: SoulContext;
  systems?: SystemsContext;
  aiTools?: AIToolsContext;
  insights?: InsightsContext;
}

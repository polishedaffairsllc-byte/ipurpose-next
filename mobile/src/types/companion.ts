export type ResponseMode = 'balanced' | 'reflect' | 'build' | 'expand';

export interface ConversationSummary {
  id: string;
  title: string;
  responseMode: ResponseMode;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompanionMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  responseMode: ResponseMode;
  sequence: number;
  createdAt: string;
  inferredLens?: 'soul' | 'systems' | 'ai';
}

export interface MentorResponse {
  response: string;
  conversationId: string;
  inferredLens?: 'soul' | 'systems' | 'ai';
  responseMode: ResponseMode;
  model: string;
}

import { auth } from './firebase';
import type { CompanionMessage, CompanionProfile, ConversationSummary, MentorResponse, ResponseMode } from '../types/companion';
import type { VisualEnvironmentPreference } from './visualEnvironment';
import type {
  ClarityCheckSubmission,
  OnboardingDraft,
  OnboardingState,
} from '../types/onboarding';

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || 'https://ipurposesoul.com').replace(/\/$/, '');

async function authorizedFetch(path: string, init: RequestInit = {}, forceRefresh = false): Promise<Response> {
  const user = auth.currentUser;
  if (!user) throw new Error('Please sign in to continue.');
  const token = await user.getIdToken(forceRefresh);
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  if (response.status === 401 && !forceRefresh) return authorizedFetch(path, init, true);
  return response;
}

async function readJson<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null) as (T & {
    error?: string | { message?: unknown };
  }) | null;
  if (!response.ok) {
    const serverError = typeof data?.error === 'string'
      ? data.error
      : typeof data?.error?.message === 'string'
        ? data.error.message
        : null;
    throw new Error(serverError
      ? `${serverError} (${response.status})`
      : `Request failed (${response.status})`);
  }
  if (!data) throw new Error('The server returned an empty response.');
  return data;
}

export async function getConversations(): Promise<ConversationSummary[]> {
  const response = await authorizedFetch('/api/ai/conversations', { method: 'GET' });
  const data = await readJson<{ conversations: ConversationSummary[] }>(response);
  return data.conversations || [];
}
export async function getConversation(conversationId: string): Promise<CompanionMessage[]> {
  const response = await authorizedFetch(`/api/ai/conversations/${encodeURIComponent(conversationId)}`, { method: 'GET' });
  const data = await readJson<{ conversationId: string; messages: CompanionMessage[] }>(response);
  return data.messages || [];
}
export async function getCompanionProfile(): Promise<CompanionProfile> {
  const response = await authorizedFetch('/api/ai/profile', { method: 'GET' });
  const data = await readJson<{ profile: CompanionProfile }>(response);
  return data.profile;
}
export async function getOnboardingState(): Promise<OnboardingState> {
  const response = await authorizedFetch('/api/ai/onboarding', { method: 'GET' });
  const data = await readJson<{ onboarding: OnboardingState }>(response);
  return data.onboarding;
}
export async function saveOnboardingDraft(draft: OnboardingDraft): Promise<OnboardingState> {
  const response = await authorizedFetch('/api/ai/onboarding', {
    method: 'PATCH',
    body: JSON.stringify(draft),
  });
  const data = await readJson<{ onboarding: OnboardingState }>(response);
  return data.onboarding;
}
export async function completeOnboarding(): Promise<OnboardingState> {
  const response = await authorizedFetch('/api/ai/onboarding', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  const data = await readJson<{ onboarding: OnboardingState }>(response);
  return data.onboarding;
}
export async function submitClarityCheck(options: {
  responses: Record<string, number>;
  identityResponses: string[];
  onboarding?: boolean;
}): Promise<ClarityCheckSubmission> {
  const response = await authorizedFetch('/api/clarity-check/submit', {
    method: 'POST',
    body: JSON.stringify(options),
  });
  return readJson<ClarityCheckSubmission>(response);
}
export async function updateCompanionFocusAreas(focusAreas: string[]): Promise<CompanionProfile> {
  const response = await authorizedFetch('/api/ai/profile', { method: 'PATCH', body: JSON.stringify({ focusAreas }) });
  const data = await readJson<{ profile: CompanionProfile }>(response);
  return data.profile;
}
export async function initializeCompanionFocusAreas(focusAreas: string[]): Promise<CompanionProfile> {
  const response = await authorizedFetch('/api/ai/profile', {
    method: 'PATCH',
    body: JSON.stringify({ initializeFocusAreas: focusAreas }),
  });
  const data = await readJson<{ profile: CompanionProfile }>(response);
  return data.profile;
}
export async function updateVisualEnvironmentPreference(
  visualEnvironmentPreference: VisualEnvironmentPreference
): Promise<CompanionProfile> {
  const response = await authorizedFetch('/api/ai/profile', {
    method: 'PATCH',
    body: JSON.stringify({ visualEnvironmentPreference }),
  });
  const data = await readJson<{ profile: CompanionProfile }>(response);
  return data.profile;
}
export async function updateCompanionTimezone(timezone: string): Promise<CompanionProfile> {
  const response = await authorizedFetch('/api/ai/profile', {
    method: 'PATCH',
    body: JSON.stringify({ timezone }),
  });
  const data = await readJson<{ profile: CompanionProfile }>(response);
  return data.profile;
}
export async function sendMentorMessage(options: { message: string; conversationId?: string; responseMode?: ResponseMode }): Promise<MentorResponse> {
  const response = await authorizedFetch('/api/ai', { method: 'POST', body: JSON.stringify({ message: options.message, responseMode: options.responseMode || 'balanced', ...(options.conversationId ? { conversationId: options.conversationId } : {}) }) });
  return readJson<MentorResponse>(response);
}

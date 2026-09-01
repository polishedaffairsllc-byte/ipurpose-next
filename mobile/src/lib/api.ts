import { auth } from './firebase';
import type {
  CompanionMessage,
  ConversationSummary,
  MentorResponse,
  ResponseMode,
} from '../types/companion';

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || 'https://www.ipurposesoul.com').replace(/\/$/, '');

async function authorizedFetch(
  path: string,
  init: RequestInit = {},
  forceRefresh = false
): Promise<Response> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Please sign in to continue.');
  }

  const token = await user.getIdToken(forceRefresh);
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 401 && !forceRefresh) {
    return authorizedFetch(path, init, true);
  }

  return response;
}

async function readJson<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null) as (T & { error?: string }) | null;
  if (!response.ok) {
    throw new Error(data?.error || `Request failed (${response.status})`);
  }
  if (!data) {
    throw new Error('The server returned an empty response.');
  }
  return data;
}

export async function getConversations(): Promise<ConversationSummary[]> {
  const response = await authorizedFetch('/api/ai/conversations', { method: 'GET' });
  const data = await readJson<{ conversations: ConversationSummary[] }>(response);
  return data.conversations || [];
}

export async function getConversation(conversationId: string): Promise<CompanionMessage[]> {
  const response = await authorizedFetch(
    `/api/ai/conversations/${encodeURIComponent(conversationId)}`,
    { method: 'GET' }
  );
  const data = await readJson<{ conversationId: string; messages: CompanionMessage[] }>(response);
  return data.messages || [];
}

export async function sendMentorMessage(options: {
  message: string;
  conversationId?: string;
  responseMode?: ResponseMode;
}): Promise<MentorResponse> {
  const response = await authorizedFetch('/api/ai', {
    method: 'POST',
    body: JSON.stringify({
      message: options.message,
      responseMode: options.responseMode || 'balanced',
      ...(options.conversationId ? { conversationId: options.conversationId } : {}),
    }),
  });

  return readJson<MentorResponse>(response);
}

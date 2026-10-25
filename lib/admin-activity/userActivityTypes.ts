export type ActivityPlatform = 'android' | 'ios' | 'web' | 'unknown';

export interface CompassActivitySummary {
  conversationCount: number;
  storedMessageCount: number;
  trackedSessionCount: number;
  trackedExchangeCount: number;
  totalTrackedDurationMs: number;
  firstConversationAt: string | null;
  lastConversationAt: string | null;
  lastEnterAt: string | null;
  lastExitAt: string | null;
}

export interface UserActivityRow {
  uid: string;
  email: string | null;
  name: string | null;
  registeredAt: string | null;
  lastSignInAt: string | null;
  lastSeenAt: string | null;
  emailVerified: boolean;
  disabled: boolean;
  platform: ActivityPlatform;
  compass: CompassActivitySummary;
}

export interface UserActivityListResponse {
  users: UserActivityRow[];
  truncated: boolean;
  generatedAt: string;
}

export interface UserActivityEvent {
  id: string;
  type: 'account_created' | 'login' | 'compass_enter' | 'compass_message' | 'compass_exit';
  at: string | null;
  platform: ActivityPlatform;
  sessionId: string | null;
  conversationId: string | null;
  durationMs: number | null;
  reason: string | null;
}

export interface CompassConversationActivity {
  id: string;
  messageCount: number;
  createdAt: string | null;
  updatedAt: string | null;
  responseMode: string | null;
}

export interface UserActivityDetailResponse {
  user: UserActivityRow;
  recentEvents: UserActivityEvent[];
  recentConversations: CompassConversationActivity[];
}

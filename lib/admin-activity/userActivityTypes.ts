export type ActivityPlatform = 'android' | 'ios' | 'web' | 'unknown';

export type UserActivityEventType =
  | 'account_created'
  | 'login'
  | 'screen_view'
  | 'clarity_check_start'
  | 'clarity_check_complete'
  | 'purpose_check_start'
  | 'purpose_check_complete'
  | 'compass_enter'
  | 'compass_message'
  | 'compass_exit';

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
  type: UserActivityEventType;
  at: string | null;
  platform: ActivityPlatform;
  sessionId: string | null;
  conversationId: string | null;
  durationMs: number | null;
  reason: string | null;
  route: string | null;
  previousRoute: string | null;
}

export interface JourneyStepActivity {
  startedAt: string | null;
  completedAt: string | null;
  startEvidence: 'tracked_event' | 'not_tracked';
  completionEvidence: 'saved_record' | 'tracked_event' | 'none';
}

export interface UserJourneyActivity {
  clarity: JourneyStepActivity;
  purpose: JourneyStepActivity;
  routeBeforeCompass: string | null;
  routeAfterCompass: string | null;
}

export interface CompassConversationActivity {
  id: string;
  messageCount: number;
  createdAt: string | null;
  updatedAt: string | null;
  responseMode: string | null;
}

export interface CompassConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sequence: number;
  createdAt: string | null;
  responseMode: string | null;
  inferredLens: 'soul' | 'systems' | 'ai' | null;
}

export interface CompassConversationResponse {
  uid: string;
  conversationId: string;
  messages: CompassConversationMessage[];
}

export interface UserActivityDetailResponse {
  user: UserActivityRow;
  journey: UserJourneyActivity;
  recentEvents: UserActivityEvent[];
  recentConversations: CompassConversationActivity[];
}

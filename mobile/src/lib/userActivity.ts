import { Platform } from 'react-native';
import { auth } from './firebase';

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || 'https://ipurposesoul.com').replace(/\/$/, '');

type UserActivityEvent = {
  type: 'account_created' | 'login' | 'compass_enter' | 'compass_message' | 'compass_exit';
  sessionId?: string;
  conversationId?: string;
  durationMs?: number;
  reason?: 'blur' | 'background' | 'unknown';
};

function platform() {
  if (Platform.OS === 'android') return 'android';
  if (Platform.OS === 'ios') return 'ios';
  if (Platform.OS === 'web') return 'web';
  return 'unknown';
}

export function createActivitySessionId(prefix = 'session') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function logUserActivity(event: UserActivityEvent): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) return;
    const token = await user.getIdToken();
    await fetch(`${API_BASE_URL}/api/ai/activity`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...event, platform: platform() }),
    });
  } catch {
    // Activity telemetry must never block account access or Compass use.
  }
}

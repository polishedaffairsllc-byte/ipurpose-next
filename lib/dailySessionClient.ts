/**
 * Client-side utilities for daily sessions
 * Handles fetching and managing user's daily session data
 */

import type {
  DailySession,
  DailySessionCheckIn,
  DailySessionLabEntry,
  DailySessionReflection,
} from './types/dailySession';

/**
 * Get today's daily session (or create if doesn't exist)
 */
export async function getTodaySession(): Promise<DailySession> {
  const res = await fetch('/api/daily-sessions/today', {
    method: 'GET',
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  const json = await res.json();
  return json.data;
}

/**
 * Get a specific day's session by date (YYYY-MM-DD)
 */
export async function getSessionByDate(date: string): Promise<DailySession> {
  const res = await fetch(`/api/daily-sessions/${date}`, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  const json = await res.json();
  return json.data;
}

/**
 * Get all sessions (for history view)
 */
export async function getAllSessions(): Promise<DailySession[]> {
  const res = await fetch('/api/daily-sessions', {
    method: 'GET',
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  const json = await res.json();
  return json.data || [];
}

/**
 * Add a check-in to today's session
 */
export async function addCheckInToToday(
  checkIn: Omit<DailySessionCheckIn, 'id' | 'recordedAt'>
): Promise<DailySession> {
  const res = await fetch('/api/daily-sessions/today/check-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(checkIn),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  const json = await res.json();
  return json.data;
}

/**
 * Add a lab entry to today's session
 */
export async function addLabEntryToToday(
  labEntry: Omit<DailySessionLabEntry, 'recordedAt'>
): Promise<DailySession> {
  const res = await fetch('/api/daily-sessions/today/lab-entry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(labEntry),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  const json = await res.json();
  return json.data;
}

/**
 * Update a lab entry in today's session (only if session is unlocked)
 */
export async function updateLabEntryInToday(
  labId: string,
  updates: Partial<Omit<DailySessionLabEntry, 'recordedAt'>>
): Promise<DailySession> {
  const res = await fetch(`/api/daily-sessions/today/lab-entry/${labId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  const json = await res.json();
  return json.data;
}

/**
 * Add a reflection to today's session
 */
export async function addReflectionToToday(
  reflection: Omit<DailySessionReflection, 'id' | 'recordedAt'>
): Promise<DailySession> {
  const res = await fetch('/api/daily-sessions/today/reflection', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reflection),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  const json = await res.json();
  return json.data;
}

/**
 * Lock today's session (usually called at end of day or manually)
 */
export async function lockTodaySession(): Promise<DailySession> {
  const res = await fetch('/api/daily-sessions/today/lock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  const json = await res.json();
  return json.data;
}

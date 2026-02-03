/**
 * Daily Session Data Model
 * 
 * Stores all user activity for a given day, keyed by YYYY-MM-DD.
 * Once a day ends, the session becomes read-only.
 */

export interface DailySessionCheckIn {
  id: string;
  emotions: string[];
  alignmentScore: number;
  need: string;
  type: 'daily';
  recordedAt: string; // ISO timestamp
}

export interface DailySessionLabEntry {
  labId: string; // 'identity', 'meaning', 'agency'
  labName: string;
  status: 'in_progress' | 'complete';
  content: Record<string, string>; // labId-specific fields
  notes: string;
  completedAt?: string; // ISO timestamp when marked complete
  recordedAt: string; // ISO timestamp when first added
}

export interface DailySessionReflection {
  id: string;
  type: 'lab-integration' | 'personal';
  labId?: string; // if lab-integration
  labName?: string;
  summary: string;
  fields: Record<string, any>;
  recordedAt: string; // ISO timestamp
}

export interface DailySession {
  userId: string;
  date: string; // YYYY-MM-DD format, UTC
  
  // Session contents
  checkIns: DailySessionCheckIn[];
  labEntries: DailySessionLabEntry[];
  reflections: DailySessionReflection[];
  
  // Session metadata
  isLocked: boolean; // true if day has passed
  lockedAt?: string; // ISO timestamp when locked
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

/**
 * Get today's date in YYYY-MM-DD format (UTC)
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get date string for a specific Date object (UTC)
 */
export function getDateString(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse YYYY-MM-DD string to Date (UTC)
 */
export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Check if a date string is in the past (before today)
 */
export function isDateInPast(dateStr: string): boolean {
  const sessionDate = parseDateString(dateStr);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  
  return sessionDate < today;
}

/**
 * Check if a date string is today
 */
export function isDateToday(dateStr: string): boolean {
  return dateStr === getTodayDateString();
}

/**
 * Create an empty daily session for a given date
 */
export function createEmptyDailySession(userId: string, date: string): DailySession {
  const now = new Date().toISOString();
  
  return {
    userId,
    date,
    checkIns: [],
    labEntries: [],
    reflections: [],
    isLocked: isDateInPast(date),
    createdAt: now,
    updatedAt: now,
  };
}

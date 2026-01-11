/**
 * Affirmation Utilities
 * Handles deterministic daily affirmation rotation based on America/New_York timezone
 */

/**
 * Get today's date key in America/New_York timezone
 * Returns format: "YYYY-MM-DD"
 */
export function getNYDateKey(): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(new Date());
  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;

  return `${year}-${month}-${day}`;
}

/**
 * Convert a date key string to day number for deterministic indexing
 * Returns the number of days since Unix epoch
 */
export function dayNumberFromDateKey(dateKey: string): number {
  const [year, month, day] = dateKey.split('-').map(Number);
  // Create UTC date and get day number
  const utcDate = Date.UTC(year, month - 1, day);
  return Math.floor(utcDate / 86400000); // 86400000 ms in a day
}

/**
 * Get the affirmation index for a given date key
 */
export function getAffirmationIndex(dateKey: string, totalAffirmations: number): number {
  if (totalAffirmations === 0) return -1;
  const dayNum = dayNumberFromDateKey(dateKey);
  return dayNum % totalAffirmations;
}

/**
 * Firestore Affirmation interface
 */
export interface Affirmation {
  id: string;
  text: string;
  active: boolean;
  order: number;
  createdAt?: Date;
}

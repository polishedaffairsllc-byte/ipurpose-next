import { Timestamp, serverTimestamp } from "firebase/firestore";

/**
 * Convert a Date or Timestamp to a dateKey string (YYYY-MM-DD) in NY timezone
 */
export function getDateKey(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

/**
 * Convert Timestamp to Date
 */
export function timestampToDate(ts: Timestamp | null): Date | null {
  return ts ? ts.toDate() : null;
}

/**
 * Get server timestamp for Firestore
 */
export function getServerTimestamp(): Timestamp {
  return serverTimestamp() as Timestamp;
}

/**
 * Generate a session ID (e.g., using date + random suffix)
 */
export function generateSessionId(): string {
  const dateKey = getDateKey();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${dateKey}-${randomSuffix}`;
}

/**
 * Generate a journal entry ID
 */
export function generateEntryId(): string {
  return `entry-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

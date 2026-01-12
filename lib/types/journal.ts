import { Timestamp } from "firebase/firestore";

/**
 * User profile document (users/{uid})
 */
export interface UserProfile {
  displayName: string;
  email: string;
  createdAt: any; // Admin SDK Timestamp or Modular SDK Timestamp
  lastActiveAt: any;
  timezone?: string;
}

/**
 * Journal entry document (users/{uid}/journalEntries/{entryId})
 */
export type JournalEntryType =
  | "affirmation_reflection"
  | "intention"
  | "free_journal"
  | "soul_reflection"
  | "systems_note";

export type JournalEntryStatus = "draft" | "final";

export type JournalEntrySource = "overview" | "soul" | "systems" | "ai";

export interface JournalEntry {
  id?: string; // Firestore doc ID (added client-side)
  type: JournalEntryType;
  status: JournalEntryStatus;
  content: string;
  createdAt: any; // Admin SDK Timestamp
  updatedAt: any;
  dateKey: string; // YYYY-MM-DD in user's timezone
  sessionId: string;
  source: JournalEntrySource;
  promptId?: string;
  promptText?: string;
  tags?: string[];
}

/**
 * Session summary nested in session document
 */
export interface SessionSummary {
  title: string;
  highlights: string[];
  generatedAt: any; // Admin SDK Timestamp
  model: "ai" | "user";
}

/**
 * Session document (users/{uid}/sessions/{sessionId})
 */
export interface Session {
  id?: string; // Firestore doc ID (added client-side)
  startedAt: any; // Admin SDK Timestamp
  endedAt: any | null;
  dateKey: string; // YYYY-MM-DD in user's timezone
  summary?: SessionSummary;
}

/**
 * Client-side autosave state
 */
export interface AutosaveState {
  isPending: boolean;
  isError: boolean;
  error?: string;
  lastSavedAt?: Date;
}

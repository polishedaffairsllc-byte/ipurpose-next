import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  Timestamp,
  writeBatch,
  QueryConstraint,
} from "firebase/firestore";
import { firebaseAdmin } from "./firebaseAdmin";
import type {
  UserProfile,
  JournalEntry,
  JournalEntryType,
  Session,
  SessionSummary,
} from "@/lib/types/journal";
import {
  getDateKey,
  generateSessionId,
  generateEntryId,
  getServerTimestamp,
} from "./journal/dateUtils";

/**
 * Get or create user profile
 */
export async function getOrCreateUserProfile(
  uid: string,
  email?: string
): Promise<UserProfile> {
  const userRef = doc(firebaseAdmin, "users", uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }

  const newProfile: UserProfile = {
    displayName: email?.split("@")[0] || "User",
    email: email || "",
    createdAt: Timestamp.now(),
    lastActiveAt: Timestamp.now(),
    timezone: "America/New_York",
  };

  await setDoc(userRef, newProfile);
  return newProfile;
}

/**
 * Get or create today's session
 */
export async function getOrCreateSession(
  uid: string
): Promise<Session & { id: string }> {
  const dateKey = getDateKey();
  const sessionsRef = collection(firebaseAdmin, "users", uid, "sessions");

  // Query for session with today's dateKey
  const q = query(sessionsRef, where("dateKey", "==", dateKey));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...(doc.data() as Session),
    };
  }

  // Create new session
  const sessionId = generateSessionId();
  const sessionRef = doc(sessionsRef, sessionId);
  const newSession: Session = {
    startedAt: Timestamp.now(),
    endedAt: null,
    dateKey,
  };

  await setDoc(sessionRef, newSession);

  return {
    id: sessionId,
    ...newSession,
  };
}

/**
 * Get or create a draft entry for a given type
 */
export async function getOrCreateDraftEntry(
  uid: string,
  sessionId: string,
  type: JournalEntryType,
  source: "overview" | "soul" | "systems" | "ai",
  promptText?: string,
  promptId?: string
): Promise<JournalEntry & { id: string }> {
  const dateKey = getDateKey();
  const entriesRef = collection(firebaseAdmin, "users", uid, "journalEntries");

  // Query for existing draft with same type and session
  const q = query(
    entriesRef,
    where("sessionId", "==", sessionId),
    where("type", "==", type),
    where("status", "==", "draft")
  );
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...(doc.data() as JournalEntry),
    };
  }

  // Create new entry
  const entryId = generateEntryId();
  const entryRef = doc(entriesRef, entryId);
  const now = Timestamp.now();
  const newEntry: JournalEntry = {
    type,
    status: "draft",
    content: "",
    createdAt: now,
    updatedAt: now,
    dateKey,
    sessionId,
    source,
    promptText,
    promptId,
  };

  await setDoc(entryRef, newEntry);

  return {
    id: entryId,
    ...newEntry,
  };
}

/**
 * Autosave an entry (debounced from client)
 */
export async function autosaveEntry(
  uid: string,
  entryId: string,
  updates: Partial<JournalEntry>
): Promise<void> {
  const entryRef = doc(firebaseAdmin, "users", uid, "journalEntries", entryId);

  const dataToUpdate = {
    ...updates,
    updatedAt: Timestamp.now(),
  };

  await updateDoc(entryRef, dataToUpdate);
}

/**
 * Finalize a session: mark all drafts as final, set endedAt, and generate summary
 */
export async function finalizeSession(
  uid: string,
  sessionId: string
): Promise<void> {
  const entriesRef = collection(firebaseAdmin, "users", uid, "journalEntries");
  const sessionRef = doc(firebaseAdmin, "users", uid, "sessions", sessionId);

  // Get all draft entries for this session
  const q = query(
    entriesRef,
    where("sessionId", "==", sessionId),
    where("status", "==", "draft")
  );
  const entriesSnap = await getDocs(q);

  // Batch update: mark all drafts as final
  const batch = writeBatch(firebaseAdmin);

  entriesSnap.docs.forEach((doc) => {
    batch.update(doc.ref, {
      status: "final",
      updatedAt: Timestamp.now(),
    });
  });

  // Generate session summary (placeholder)
  const summary = await generateSessionSummary(uid, sessionId);

  // Update session
  batch.update(sessionRef, {
    endedAt: Timestamp.now(),
    summary,
  });

  await batch.commit();
}

/**
 * Generate a session summary (placeholder implementation)
 * In production, this would call an AI API or use custom logic
 */
async function generateSessionSummary(
  uid: string,
  sessionId: string
): Promise<SessionSummary> {
  const entriesRef = collection(firebaseAdmin, "users", uid, "journalEntries");
  const q = query(entriesRef, where("sessionId", "==", sessionId));
  const snapshot = await getDocs(q);

  const entries = snapshot.docs.map((doc) => doc.data() as JournalEntry);

  // Placeholder summary generation
  const highlights = entries
    .map((e) => e.content.substring(0, 100))
    .filter((h) => h.length > 0);

  return {
    title: `Session on ${getDateKey()}`,
    highlights: highlights.slice(0, 3),
    generatedAt: Timestamp.now(),
    model: "user",
  };
}

/**
 * Get all entries for a session
 */
export async function getSessionEntries(
  uid: string,
  sessionId: string
): Promise<(JournalEntry & { id: string })[]> {
  const entriesRef = collection(firebaseAdmin, "users", uid, "journalEntries");
  const q = query(entriesRef, where("sessionId", "==", sessionId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as JournalEntry),
  }));
}

/**
 * Get a single entry
 */
export async function getEntry(
  uid: string,
  entryId: string
): Promise<(JournalEntry & { id: string }) | null> {
  const entryRef = doc(firebaseAdmin, "users", uid, "journalEntries", entryId);
  const snap = await getDoc(entryRef);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...(snap.data() as JournalEntry),
  };
}

/**
 * Get a session
 */
export async function getSession(
  uid: string,
  sessionId: string
): Promise<(Session & { id: string }) | null> {
  const sessionRef = doc(firebaseAdmin, "users", uid, "sessions", sessionId);
  const snap = await getDoc(sessionRef);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...(snap.data() as Session),
  };
}

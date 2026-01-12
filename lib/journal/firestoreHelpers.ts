import * as admin from "firebase-admin";
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
} from "@/lib/journal/dateUtils";

const db = admin.firestore();

/**
 * Get or create user profile
 */
export async function getOrCreateUserProfile(
  uid: string,
  email?: string
): Promise<UserProfile> {
  const userRef = db.collection("users").doc(uid);
  const userSnap = await userRef.get();

  if (userSnap.exists) {
    return userSnap.data() as UserProfile;
  }

  const newProfile: UserProfile = {
    displayName: email?.split("@")[0] || "User",
    email: email || "",
    createdAt: admin.firestore.Timestamp.now(),
    lastActiveAt: admin.firestore.Timestamp.now(),
    timezone: "America/New_York",
  };

  await userRef.set(newProfile);
  return newProfile;
}

/**
 * Get or create today's session
 */
export async function getOrCreateSession(
  uid: string
): Promise<Session & { id: string }> {
  const dateKey = getDateKey();
  const sessionsRef = db.collection("users").doc(uid).collection("sessions");

  const snapshot = await sessionsRef.where("dateKey", "==", dateKey).get();

  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...(doc.data() as Session),
    };
  }

  // Create new session
  const sessionId = generateSessionId();
  const sessionRef = sessionsRef.doc(sessionId);
  const newSession: Session = {
    startedAt: admin.firestore.Timestamp.now(),
    endedAt: null,
    dateKey,
  };

  await sessionRef.set(newSession);

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
  const entriesRef = db
    .collection("users")
    .doc(uid)
    .collection("journalEntries");

  // Query for existing draft with same type and session
  const snapshot = await entriesRef
    .where("sessionId", "==", sessionId)
    .where("type", "==", type)
    .where("status", "==", "draft")
    .get();

  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...(doc.data() as JournalEntry),
    };
  }

  // Create new entry
  const entryId = generateEntryId();
  const entryRef = entriesRef.doc(entryId);
  const now = admin.firestore.Timestamp.now();
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

  await entryRef.set(newEntry);

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
  const entryRef = db
    .collection("users")
    .doc(uid)
    .collection("journalEntries")
    .doc(entryId);

  const dataToUpdate = {
    ...updates,
    updatedAt: admin.firestore.Timestamp.now(),
  };

  await entryRef.update(dataToUpdate);
}

/**
 * Finalize a session: mark all drafts as final, set endedAt, and generate summary
 */
export async function finalizeSession(
  uid: string,
  sessionId: string
): Promise<void> {
  const entriesRef = db
    .collection("users")
    .doc(uid)
    .collection("journalEntries");
  const sessionRef = db
    .collection("users")
    .doc(uid)
    .collection("sessions")
    .doc(sessionId);

  // Get all draft entries for this session
  const entriesSnap = await entriesRef
    .where("sessionId", "==", sessionId)
    .where("status", "==", "draft")
    .get();

  // Batch update: mark all drafts as final
  const batch = db.batch();

  entriesSnap.docs.forEach((doc) => {
    batch.update(doc.ref, {
      status: "final",
      updatedAt: admin.firestore.Timestamp.now(),
    });
  });

  // Generate session summary (placeholder)
  const summary = await generateSessionSummary(uid, sessionId);

  // Update session
  batch.update(sessionRef, {
    endedAt: admin.firestore.Timestamp.now(),
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
  const entriesRef = db
    .collection("users")
    .doc(uid)
    .collection("journalEntries");
  const snapshot = await entriesRef.where("sessionId", "==", sessionId).get();

  const entries = snapshot.docs.map((doc) => doc.data() as JournalEntry);

  // Placeholder summary generation
  const highlights = entries
    .map((e) => e.content.substring(0, 100))
    .filter((h) => h.length > 0);

  return {
    title: `Session on ${getDateKey()}`,
    highlights: highlights.slice(0, 3),
    generatedAt: admin.firestore.Timestamp.now(),
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
  const entriesRef = db
    .collection("users")
    .doc(uid)
    .collection("journalEntries");
  const snapshot = await entriesRef.where("sessionId", "==", sessionId).get();

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
  const entryRef = db
    .collection("users")
    .doc(uid)
    .collection("journalEntries")
    .doc(entryId);
  const snap = await entryRef.get();

  if (!snap.exists) return null;

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
  const sessionRef = db
    .collection("users")
    .doc(uid)
    .collection("sessions")
    .doc(sessionId);
  const snap = await sessionRef.get();

  if (!snap.exists) return null;

  return {
    id: snap.id,
    ...(snap.data() as Session),
  };
}

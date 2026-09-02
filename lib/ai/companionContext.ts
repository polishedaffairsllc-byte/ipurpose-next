import { firebaseAdmin } from "@/lib/firebaseAdmin";
import type {
  CompanionCheckInContext,
  CompanionClarityContext,
  CompanionContext,
  CompanionDailySessionContext,
  CompanionLabContext,
  CompanionProfileContext,
  CompanionReflectionContext,
} from "@/lib/ai/companionTypes";
import {
  getVisualEnvironmentPreference,
  type VisualEnvironmentPreference,
} from "@/lib/ai/visualEnvironmentPreference";

const LAB_IDS = ["identity", "meaning", "agency"] as const;
const RECENT_CHECK_IN_LIMIT = 5;
const RECENT_SESSION_LIMIT = 5;
const RECENT_JOURNAL_LIMIT = 5;

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function asStringArray(value: unknown, limit = 8): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
    .map((item) => item.trim())
    .slice(0, limit);
}

function toIso(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();

  const timestamp = value as { toDate?: () => Date };
  try {
    return typeof timestamp.toDate === "function"
      ? timestamp.toDate().toISOString()
      : undefined;
  } catch {
    return undefined;
  }
}

async function safeRead<T>(label: string, reader: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await reader();
  } catch (error) {
    console.warn(`[Companion context] Unable to read ${label}:`, error);
    return fallback;
  }
}

function getProfileContext(data: UnknownRecord): CompanionProfileContext {
  const aiPreferences = asRecord(data.aiPreferences);
  const focusAreas = [
    ...asStringArray(data.focusAreas),
    ...asStringArray(data.businessGoals),
    ...asStringArray(aiPreferences.focusAreas),
  ];

  return {
    displayName: asString(data.displayName),
    timezone: asString(data.timezone),
    archetypePrimary: asString(data.archetypePrimary),
    archetypeSecondary: asString(data.archetypeSecondary),
    identityAnchor: asString(data.identityAnchor),
    purposeStatement: asString(data.purposeStatement),
    focusAreas: [...new Set(focusAreas)].slice(0, 5),
    visualEnvironmentPreference: getVisualEnvironmentPreference(
      data.visualEnvironmentPreference
    ),
  };
}

interface CompanionProfileReadResult {
  profile: CompanionProfileContext;
  email?: string;
}

async function readCompanionProfile(uid: string): Promise<CompanionProfileReadResult> {
  const [userDocument, authUser] = await Promise.all([
    firebaseAdmin.firestore().collection("users").doc(uid).get(),
    safeRead("authenticated profile", () => firebaseAdmin.auth().getUser(uid), null),
  ]);
  const userData = userDocument.exists ? asRecord(userDocument.data()) : {};
  const profile = getProfileContext(userData);
  if (!profile.displayName) profile.displayName = authUser?.displayName || undefined;

  return {
    profile,
    email: authUser?.email || undefined,
  };
}

/**
 * Return the bounded companion profile for a verified Firebase UID.
 * Authentication and entitlement checks remain the responsibility of the API
 * route so callers can never select another user's profile.
 */
export async function getCompanionProfile(uid: string): Promise<CompanionProfileContext> {
  const { profile } = await readCompanionProfile(uid);
  return profile;
}

/** Update only the authenticated user's current Compass focus areas. */
export async function updateCompanionFocusAreas(
  uid: string,
  focusAreas: string[]
): Promise<CompanionProfileContext> {
  const normalized = focusAreas
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 2);

  await firebaseAdmin.firestore().collection("users").doc(uid).set(
    {
      focusAreas: normalized,
      updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return getCompanionProfile(uid);
}

/** Update only the authenticated user's visual-environment preference. */
export async function updateCompanionVisualEnvironment(
  uid: string,
  visualEnvironmentPreference: VisualEnvironmentPreference
): Promise<CompanionProfileContext> {
  await firebaseAdmin.firestore().collection("users").doc(uid).set(
    {
      visualEnvironmentPreference,
      updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return getCompanionProfile(uid);
}

async function readClarityCheck(email: string | undefined): Promise<CompanionClarityContext | undefined> {
  if (!email) return undefined;

  const snapshot = await firebaseAdmin
    .firestore()
    .collection("clarityCheckSubmissions")
    .where("email", "==", email.toLowerCase())
    .orderBy("createdAt", "desc")
    .limit(1)
    .get();

  if (snapshot.empty) return undefined;
  const data = asRecord(snapshot.docs[0].data());
  const scores = asRecord(data.scores);

  return {
    identityType: asString(data.identityType),
    totalScore: asNumber(scores.totalScore),
    internalClarity: asNumber(scores.internalClarity),
    readinessForSupport: asNumber(scores.readinessForSupport),
    frictionBetweenInsightAndAction: asNumber(scores.frictionBetweenInsightAndAction),
    integrationAndMomentum: asNumber(scores.integrationAndMomentum),
    resultSummary: asString(data.resultSummary),
    nextStep: asString(data.nextStep),
    completedAt: toIso(data.createdAt),
  };
}

async function readRecentCheckIns(uid: string): Promise<CompanionCheckInContext[]> {
  const snapshot = await firebaseAdmin
    .firestore()
    .collection("users")
    .doc(uid)
    .collection("checkIns")
    .orderBy("createdAt", "desc")
    .limit(RECENT_CHECK_IN_LIMIT)
    .get();

  return snapshot.docs.map((document) => {
    const data = asRecord(document.data());
    return {
      alignmentScore: asNumber(data.alignmentScore),
      emotions: asStringArray(data.emotions, 6),
      need: asString(data.need),
      recordedAt: toIso(data.createdAt),
    };
  });
}

interface DailySessionReadResult {
  sessions: CompanionDailySessionContext[];
  reflections: CompanionReflectionContext[];
}

async function readRecentDailySessions(uid: string): Promise<DailySessionReadResult> {
  const snapshot = await firebaseAdmin
    .firestore()
    .collection("users")
    .doc(uid)
    .collection("dailySessions")
    .orderBy("date", "desc")
    .limit(RECENT_SESSION_LIMIT)
    .get();

  const reflections: CompanionReflectionContext[] = [];
  const sessions = snapshot.docs.map((document) => {
    const data = asRecord(document.data());
    const checkIns = Array.isArray(data.checkIns) ? data.checkIns.map(asRecord) : [];
    const latestCheckIn = checkIns.at(-1) || {};
    const labEntries = Array.isArray(data.labEntries) ? data.labEntries.map(asRecord) : [];
    const sessionReflections = Array.isArray(data.reflections)
      ? data.reflections.map(asRecord)
      : [];

    sessionReflections.slice(-3).reverse().forEach((reflection) => {
      const content = asString(reflection.summary);
      if (!content) return;
      reflections.push({
        source: "daily-session",
        content,
        title: asString(reflection.labName),
        recordedAt: toIso(reflection.recordedAt) || asString(data.date),
      });
    });

    return {
      date: asString(data.date) || document.id,
      alignmentScore: asNumber(latestCheckIn.alignmentScore),
      statedNeed: asString(latestCheckIn.need),
      completedLabs: labEntries
        .filter((entry) => entry.status === "complete")
        .map((entry) => asString(entry.labName) || asString(entry.labId))
        .filter((value): value is string => Boolean(value))
        .slice(0, 3),
      reflectionCount: sessionReflections.length,
    };
  });

  return { sessions, reflections: reflections.slice(0, 5) };
}

async function readRecentJournal(uid: string): Promise<CompanionReflectionContext[]> {
  const snapshot = await firebaseAdmin
    .firestore()
    .collection("users")
    .doc(uid)
    .collection("journalEntries")
    .orderBy("updatedAt", "desc")
    .limit(RECENT_JOURNAL_LIMIT)
    .get();

  return snapshot.docs.flatMap((document) => {
    const data = asRecord(document.data());
    const content = asString(data.content);
    if (!content) return [];
    return [{
      source: "journal" as const,
      content,
      title: asString(data.promptText) || asString(data.type),
      recordedAt: toIso(data.updatedAt) || asString(data.dateKey),
    }];
  });
}

function collectStrings(value: unknown, depth = 0): string[] {
  if (typeof value === "string") return value.trim() ? [value.trim()] : [];
  if (depth >= 2 || !value || typeof value !== "object") return [];
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectStrings(item, depth + 1));
  }
  return Object.values(value as UnknownRecord).flatMap((item) => collectStrings(item, depth + 1));
}

async function readLabs(uid: string): Promise<CompanionLabContext[]> {
  const db = firebaseAdmin.firestore();
  const userLabRefs = LAB_IDS.map((labId) =>
    db.collection("users").doc(uid).collection("labs").doc(labId)
  );
  const legacyRefs = [
    db.collection("identity_maps").doc(uid),
    db.collection("meaning_maps").doc(uid),
    db.collection("agency_maps").doc(uid),
  ];
  const aggregateLabRef = db.collection("labs").doc(uid);

  const [userLabs, legacyLabs, aggregateLab] = await Promise.all([
    db.getAll(...userLabRefs),
    db.getAll(...legacyRefs),
    aggregateLabRef.get(),
  ]);
  const aggregateData = aggregateLab.exists ? asRecord(aggregateLab.data()) : {};

  return LAB_IDS.flatMap((labId, index) => {
    const userData = userLabs[index].exists ? asRecord(userLabs[index].data()) : {};
    const legacyData = legacyLabs[index].exists ? asRecord(legacyLabs[index].data()) : {};
    const aggregateLabData = asRecord(aggregateData[labId]);
    const strings = [
      ...collectStrings(userData),
      ...collectStrings(legacyData),
      ...collectStrings(aggregateLabData),
    ]
      .filter((value, position, all) => all.indexOf(value) === position)
      .slice(0, 6);
    if (!strings.length) return [];

    return [{
      labId,
      status: asString(userData.status),
      summary: strings.join(" | "),
      updatedAt: toIso(userData.updatedAt) || toIso(legacyData.updatedAt) || toIso(aggregateData.updatedAt),
    }];
  });
}

/**
 * Assemble a bounded, server-only view of the authenticated user's recent journey.
 * Every read is scoped by the verified Firebase UID (or its profile email for the
 * existing Clarity Check schema). Individual source failures degrade gracefully.
 */
export async function getCompanionContext(uid: string): Promise<CompanionContext> {
  const { profile, email } = await readCompanionProfile(uid);
  // The Clarity Check's legacy schema is email-linked. Use the email owned by
  // the authenticated Firebase account, never an arbitrary client value.

  const [clarityCheck, recentCheckIns, dailySessions, recentLabs, journalReflections] =
    await Promise.all([
      safeRead("Clarity Check", () => readClarityCheck(email), undefined),
      safeRead("check-ins", () => readRecentCheckIns(uid), []),
      safeRead(
        "daily sessions",
        () => readRecentDailySessions(uid),
        { sessions: [], reflections: [] }
      ),
      safeRead("Labs", () => readLabs(uid), []),
      safeRead("journal reflections", () => readRecentJournal(uid), []),
    ]);

  const recentReflections = [...dailySessions.reflections, ...journalReflections]
    .sort((a, b) => (b.recordedAt || "").localeCompare(a.recordedAt || ""))
    .slice(0, 8);

  return {
    profile,
    clarityCheck,
    recentCheckIns,
    recentDailySessions: dailySessions.sessions,
    recentLabs,
    recentReflections,
    generatedAt: new Date().toISOString(),
  };
}

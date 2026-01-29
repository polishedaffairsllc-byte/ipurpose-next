import crypto from "crypto";
import { firebaseAdmin } from "@/lib/firebaseAdmin";

const EVENTS_COLLECTION = "lab_events";
const ACTIVATION_COLLECTION = "activation_a_states";
const USERS_COLLECTION = "users";

type LabSaveEvent = {
  event: "lab_save" | "activation_a_reached";
  uid: string;
  sessionId: string;
  labId: string;
  promptId: string;
  wordCountBucket: string;
  environment: string;
  success: boolean;
  entitlementTier?: string;
  errorCode?: string;
  contentHash?: string;
  meaningful?: boolean;
  timestamp?: Date;
};

export function getEnvironment(): string {
  return process.env.NODE_ENV ?? "development";
}

export function getSessionId(request: Request): string {
  return (
    request.headers.get("x-session-id") ||
    request.headers.get("x-vercel-id") ||
    request.headers.get("x-request-id") ||
    "unknown"
  );
}

function bucketWordCount(wordCount: number): string {
  if (wordCount <= 0) return "0";
  if (wordCount < 25) return "1-24";
  if (wordCount < 50) return "25-49";
  if (wordCount < 100) return "50-99";
  return "100+";
}

export function buildContentMetrics(parts: Array<string | null | undefined>) {
  const normalized = parts
    .filter((p) => typeof p === "string" && p.trim().length > 0)
    .map((p) => p!.trim())
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  const charCount = normalized.length;
  const wordCount = normalized ? normalized.split(/\s+/).length : 0;
  const wordCountBucket = bucketWordCount(wordCount);
  const meaningful = wordCount >= 25 || charCount >= 140;
  const contentHash = normalized
    ? crypto.createHash("sha256").update(normalized).digest("hex")
    : "empty";

  return { normalized, wordCount, charCount, wordCountBucket, meaningful, contentHash };
}

async function writeEvent(event: LabSaveEvent) {
  const db = firebaseAdmin.firestore();
  await db.collection(EVENTS_COLLECTION).add({
    ...event,
    timestamp: event.timestamp ?? firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
  });
}

export async function emitLabSaveEventSafe(event: LabSaveEvent) {
  try {
    await writeEvent(event);
  } catch (err) {
    console.error("lab_save event emit failed", err);
  }
}

export async function recordActivationAOnce(params: {
  uid: string;
  sessionId: string;
  labId: string;
  promptId: string;
  contentHash: string;
  wordCountBucket: string;
  environment: string;
  entitlementTier?: string;
}) {
  const { uid, sessionId, labId, promptId, contentHash, wordCountBucket, environment, entitlementTier } = params;
  const db = firebaseAdmin.firestore();
  const docId = `${uid}_${contentHash}`;
  const docRef = db.collection(ACTIVATION_COLLECTION).doc(docId);
  const existing = await docRef.get();
  if (existing.exists) return false;

  const payload = {
    uid,
    sessionId,
    labId,
    promptId,
    contentHash,
    wordCountBucket,
    environment,
    entitlementTier,
    createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
  };

  await docRef.set(payload);

  // Persist activation flag on user profile if missing (write-once)
  try {
    const userRef = db.collection(USERS_COLLECTION).doc(uid);
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(userRef);
      const alreadyActivated = snap.exists && Boolean(snap.get("activation.activatedAt"));
      if (alreadyActivated) return;
      tx.set(
        userRef,
        {
          activation: {
            activatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
          },
        },
        { merge: true }
      );
    });
  } catch (err) {
    console.error("activation flag persist failed", err);
  }

  await emitLabSaveEventSafe({
    event: "activation_a_reached",
    uid,
    sessionId,
    labId,
    promptId,
    wordCountBucket,
    environment,
    success: true,
    entitlementTier,
    contentHash,
    meaningful: true,
  });

  return true;
}

import { ok, fail } from "@/lib/http";
import { clampText } from "@/lib/validators";
import { requireUid, requireRole } from "@/lib/firebase/requireUser";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import {
  buildContentMetrics,
  emitLabSaveEventSafe,
  getEnvironment,
  getSessionId,
  recordActivationAOnce,
} from "@/lib/labs/activationEvents";

type Body = {
  awarenessPatterns?: string;
  decisionPatterns?: string;
  actionPatterns?: string;
  completeEnough?: boolean;
};

export async function POST(request: Request) {
  const environment = getEnvironment();
  const sessionId = getSessionId(request);
  const labId = "agency";
  const promptId = "agency_primary";
  const entitlementTier = "FREE";
  let uid: string | null = null;
  let metrics = buildContentMetrics([]);
  try {
    uid = await requireUid();
    await requireRole(uid, "explorer");
    const body = (await request.json().catch(() => ({}))) as Body;

    const awarenessPatterns = clampText(body.awarenessPatterns);
    const decisionPatterns = clampText(body.decisionPatterns);
    const actionPatterns = clampText(body.actionPatterns);
    const completeEnough = Boolean(body.completeEnough);

    metrics = buildContentMetrics([awarenessPatterns, decisionPatterns, actionPatterns]);

    if (awarenessPatterns === null && decisionPatterns === null && actionPatterns === null) {
      await emitLabSaveEventSafe({
        event: "lab_save",
        uid,
        sessionId,
        labId,
        promptId,
        wordCountBucket: metrics.wordCountBucket,
        environment,
        success: false,
        entitlementTier,
        errorCode: "VALIDATION_ERROR",
        contentHash: metrics.contentHash,
        meaningful: metrics.meaningful,
      });
      return fail("VALIDATION_ERROR", "Provide at least one field to save.", 400);
    }

    const db = firebaseAdmin.firestore();
    const docRef = db.collection("agency_maps").doc(uid);
    const docSnap = await docRef.get();

    const payload: Record<string, unknown> = {
      uid,
      version: "mvp_v1",
      awarenessPatterns: awarenessPatterns ?? "",
      decisionPatterns: decisionPatterns ?? "",
      actionPatterns: actionPatterns ?? "",
      completeEnough,
      updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    };

    if (!docSnap.exists) {
      payload.createdAt = firebaseAdmin.firestore.FieldValue.serverTimestamp();
    }

    await docRef.set(payload, { merge: true });

    await emitLabSaveEventSafe({
      event: "lab_save",
      uid,
      sessionId,
      labId,
      promptId,
      wordCountBucket: metrics.wordCountBucket,
      environment,
      success: true,
      entitlementTier,
      contentHash: metrics.contentHash,
      meaningful: metrics.meaningful,
    });

    if (metrics.meaningful) {
      await recordActivationAOnce({
        uid,
        sessionId,
        labId,
        promptId,
        contentHash: metrics.contentHash,
        wordCountBucket: metrics.wordCountBucket,
        environment,
        entitlementTier,
      });
    }

    return ok({ mapId: docRef.id }, docSnap.exists ? 200 : 201);
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 500;
    const safeUid = uid ?? "unknown";
    const errorCode = status === 401
      ? "UNAUTHENTICATED"
      : status === 403
        ? "FORBIDDEN"
        : "SERVER_ERROR";
    await emitLabSaveEventSafe({
      event: "lab_save",
      uid: safeUid,
      sessionId,
      labId,
      promptId,
      wordCountBucket: metrics.wordCountBucket,
      environment,
      success: false,
      entitlementTier,
      errorCode,
      contentHash: metrics.contentHash,
      meaningful: metrics.meaningful,
    });
    if (status === 401) return fail("UNAUTHENTICATED", "Log in to continue.", 401);
    if (status === 403) return fail("FORBIDDEN", "You don’t have access to this lab.", 403);
    console.error("/api/labs/agency/save POST error:", error);
    return fail("SERVER_ERROR", "Failed to save agency map.", 500);
  }
}

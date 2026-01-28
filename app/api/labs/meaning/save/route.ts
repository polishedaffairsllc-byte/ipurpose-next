import { ok, fail } from "@/lib/http";
import { clampText } from "@/lib/validators";
import { requireUid, requireRole } from "@/lib/firebase/requireUser";
import { firebaseAdmin } from "@/lib/firebaseAdmin";

type Body = {
  valueStructure?: string;
  coherenceStructure?: string;
  directionStructure?: string;
  completeEnough?: boolean;
};

export async function POST(request: Request) {
  try {
    const uid = await requireUid();
    await requireRole(uid, "explorer");
    const body = (await request.json().catch(() => ({}))) as Body;

    const valueStructure = clampText(body.valueStructure);
    const coherenceStructure = clampText(body.coherenceStructure);
    const directionStructure = clampText(body.directionStructure);
    const completeEnough = Boolean(body.completeEnough);

    if (valueStructure === null && coherenceStructure === null && directionStructure === null) {
      return fail("VALIDATION_ERROR", "Provide at least one field to save.", 400);
    }

    const db = firebaseAdmin.firestore();
    const docRef = db.collection("meaning_maps").doc(uid);
    const docSnap = await docRef.get();

    const payload: Record<string, unknown> = {
      uid,
      version: "mvp_v1",
      valueStructure: valueStructure ?? "",
      coherenceStructure: coherenceStructure ?? "",
      directionStructure: directionStructure ?? "",
      completeEnough,
      updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    };

    if (!docSnap.exists) {
      payload.createdAt = firebaseAdmin.firestore.FieldValue.serverTimestamp();
    }

    await docRef.set(payload, { merge: true });

    return ok({ mapId: docRef.id }, docSnap.exists ? 200 : 201);
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 500;
    if (status === 401) return fail("UNAUTHENTICATED", "Log in to continue.", 401);
    if (status === 403) return fail("FORBIDDEN", "You don’t have access to this lab.", 403);
    console.error("/api/labs/meaning/save POST error:", error);
    return fail("SERVER_ERROR", "Failed to save meaning map.", 500);
  }
}

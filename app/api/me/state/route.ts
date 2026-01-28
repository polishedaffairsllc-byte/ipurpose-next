import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { ok, fail } from "@/lib/http";
import { requireUid } from "@/lib/firebase/requireUser";

export async function PATCH(request: Request) {
  try {
    const uid = await requireUid();
    const body = await request.json();

    const stage = typeof body?.stage === "string" ? body.stage : null;
    const stageNote = typeof body?.stageNote === "string" ? body.stageNote : null;

    if (!stage) {
      return fail("VALIDATION_ERROR", "Stage is required.", 400);
    }

    const db = firebaseAdmin.firestore();
    await db.collection("users").doc(uid).set(
      {
        stage,
        stageNote,
        stageUpdatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return ok({ stage, stageNote });
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 500;
    if (status === 401) return fail("UNAUTHENTICATED", "Log in to continue.", 401);
    console.error("/api/me/state PATCH error:", error);
    return fail("SERVER_ERROR", "Failed to update state.", 500);
  }
}

import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { ok, fail } from "@/lib/http";
import { requireUid, requireRole } from "@/lib/firebase/requireUser";

export async function POST(request: Request) {
  try {
    const uid = await requireUid();
    await requireRole(uid, "explorer");
    const body = await request.json();
    const { currentStep, completedSteps } = body || {};

    const db = firebaseAdmin.firestore();
    const docRef = db.collection("learning_path_progress").doc(uid);

    await docRef.set(
      {
        ...(currentStep ? { currentStep } : {}),
        ...(Array.isArray(completedSteps) ? { completedSteps: completedSteps.slice(0, 200) } : {}),
        percentComplete:
          typeof body?.percentComplete === "number"
            ? Math.max(0, Math.min(100, Math.floor(body.percentComplete)))
            : undefined,
        updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return ok({ updated: true });
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 500;
    if (status === 401) return fail("UNAUTHENTICATED", "Log in to continue.", 401);
    if (status === 403) return fail("FORBIDDEN", "You don’t have access to this path.", 403);
    console.error("/api/learning-path/orientation/progress POST error:", error);
    return fail("SERVER_ERROR", "Failed to update progress.", 500);
  }
}

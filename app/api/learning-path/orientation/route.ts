import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { ok, fail } from "@/lib/http";
import { requireUid, requireRole } from "@/lib/firebase/requireUser";

export async function GET() {
  try {
    const uid = await requireUid();
    await requireRole(uid, "explorer");
    const db = firebaseAdmin.firestore();
    const docRef = db.collection("learning_path_progress").doc(uid);
    const progressData = await db.runTransaction(async transaction => {
      const snapshot = await transaction.get(docRef);
      if (snapshot.exists) return snapshot.data()!;
      const initial = {
        uid, arcKey: "orientation", currentStep: "orientation_intro",
        completedSteps: [], percentComplete: 0,
        createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      };
      transaction.set(docRef, initial);
      return initial;
    });

    const completedSteps = Array.isArray(progressData.completedSteps) ? progressData.completedSteps : [];
    const percentComplete = typeof progressData.percentComplete === "number" ? progressData.percentComplete : 0;

    return ok({
      path: { key: "orientation_path", title: "Orientation Path" },
      progress: {
        currentStep: progressData.currentStep ?? null,
        completedSteps,
        percentComplete,
      },
    });
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 500;
    if (status === 401) return fail("UNAUTHENTICATED", "Log in to continue.", 401);
    if (status === 403) return fail("FORBIDDEN", "You don’t have access to this path.", 403);
    console.error("/api/learning-path/orientation GET error:", error);
    return fail("SERVER_ERROR", "Failed to load learning path.", 500);
  }
}

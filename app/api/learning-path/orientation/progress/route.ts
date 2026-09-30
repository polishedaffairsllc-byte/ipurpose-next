import { ORIENTATION_STEPS, updateOrientationProgress } from "@/lib/labs/completion";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { ok, fail } from "@/lib/http";
import { requireUid, requireRole } from "@/lib/firebase/requireUser";

export async function POST(request: Request) {
  try {
    const uid = await requireUid();
    await requireRole(uid, "explorer");
    const body = await request.json();
    const { currentStep, completedSteps } = body || {};

    const validStep = (step: unknown): step is string => typeof step === "string" && (ORIENTATION_STEPS as readonly string[]).includes(step);
    if ((currentStep !== undefined && !validStep(currentStep)) ||
        (completedSteps !== undefined && (!Array.isArray(completedSteps) || !completedSteps.every(validStep)))) {
      return fail("VALIDATION_ERROR", "Choose valid orientation steps.", 400);
    }
    await updateOrientationProgress(firebaseAdmin.firestore(), uid, completedSteps ?? [], currentStep);

    return ok({ updated: true });
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 500;
    if (status === 401) return fail("UNAUTHENTICATED", "Log in to continue.", 401);
    if (status === 403) return fail("FORBIDDEN", "You don’t have access to this path.", 403);
    console.error("/api/learning-path/orientation/progress POST error:", error);
    return fail("SERVER_ERROR", "Failed to update progress.", 500);
  }
}

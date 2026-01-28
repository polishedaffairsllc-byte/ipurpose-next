import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { ok, fail } from "@/lib/http";
import { requireUid } from "@/lib/firebase/requireUser";

export async function GET() {
  try {
    const uid = await requireUid();
    const db = firebaseAdmin.firestore();
    const userDoc = await db.collection("users").doc(uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    return ok({
      userId: uid,
      roleKeys: userData?.roleKeys ?? ["visitor"],
      profile: {
        displayName: userData?.displayName ?? null,
        timezone: userData?.timezone ?? null,
      },
      state: {
        stage: userData?.stage ?? "Orientation",
        stageNote: userData?.stageNote ?? null,
      },
    });
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 500;
    if (status === 401) return fail("UNAUTHENTICATED", "Log in to continue.", 401);
    console.error("/api/me GET error:", error);
    return fail("SERVER_ERROR", "Failed to load user.", 500);
  }
}

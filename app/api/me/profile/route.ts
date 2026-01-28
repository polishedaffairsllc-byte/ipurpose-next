import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { ok, fail } from "@/lib/http";
import { requireUid } from "@/lib/firebase/requireUser";

export async function PATCH(request: Request) {
  try {
    const uid = await requireUid();
    const body = await request.json();

    const displayName = typeof body?.displayName === "string" ? body.displayName : null;
    const timezone = typeof body?.timezone === "string" ? body.timezone : null;

    const db = firebaseAdmin.firestore();
    const userRef = db.collection("users").doc(uid);

    await userRef.set(
      {
        displayName,
        timezone,
        profileUpdatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return ok({ profile: { displayName, timezone } });
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 500;
    if (status === 401) return fail("UNAUTHENTICATED", "Log in to continue.", 401);
    console.error("/api/me/profile PATCH error:", error);
    return fail("SERVER_ERROR", "Failed to update profile.", 500);
  }
}

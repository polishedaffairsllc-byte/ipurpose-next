import { ok, fail } from "@/lib/http";
import { requireUid, requireRole } from "@/lib/firebase/requireUser";
import { firebaseAdmin } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const uid = await requireUid();
    await requireRole(uid, "explorer");

    const db = firebaseAdmin.firestore();
    const doc = await db.collection("agency_maps").doc(uid).get();
    const data = doc.exists ? doc.data() : null;

    const map = data
      ? {
          id: doc.id,
          version: data.version ?? "mvp_v1",
          awarenessPatterns: data.awarenessPatterns ?? "",
          decisionPatterns: data.decisionPatterns ?? "",
          actionPatterns: data.actionPatterns ?? "",
          synthesis: data.synthesis ?? null,
          updatedAt: data.updatedAt?.toDate?.() ?? null,
        }
      : null;

    return ok({ map });
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 500;
    if (status === 401) return fail("UNAUTHENTICATED", "Log in to continue.", 401);
    if (status === 403) return fail("FORBIDDEN", "You don’t have access to this lab.", 403);
    console.error("/api/labs/agency/active GET error:", error);
    return fail("SERVER_ERROR", "Failed to load agency map.", 500);
  }
}

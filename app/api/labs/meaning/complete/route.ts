import { ok, fail } from "@/lib/http";
import { hasMeaningfulText } from "@/lib/validators";
import { requireUid, requireRole } from "@/lib/firebase/requireUser";
import { firebaseAdmin } from "@/lib/firebaseAdmin";

function countWords(value: string) {
  return (value.trim().match(/\S+/g) ?? []).length;
}

export async function POST() {
  try {
    const uid = await requireUid();
    await requireRole(uid, "explorer");

    const db = firebaseAdmin.firestore();
    const mapSnap = await db.collection("meaning_maps").doc(uid).get();
    const data = mapSnap.exists ? mapSnap.data() : null;

    if (!data) {
      return fail("NOT_FOUND", "No active lab draft found.", 404);
    }

    const fields = [
      String(data.valueStructure ?? ""),
      String(data.coherenceStructure ?? ""),
      String(data.directionStructure ?? ""),
    ];

    const chars = fields.join("\n").trim().length;
    const words = fields.reduce((acc, value) => acc + countWords(value), 0);
    const completeEnough = Boolean(data.completeEnough);

    const ready = completeEnough || chars >= 50 || words >= 20 || fields.some((value) => hasMeaningfulText(value));

    if (!ready) {
      return fail("NOT_READY", "Add a bit more detail in at least one section before completing.", 400);
    }

    const completionRef = db.collection("lab_completion").doc(`${uid}_meaning`);
    await completionRef.set(
      {
        uid,
        labKey: "meaning",
        completedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        method: completeEnough ? "checkbox" : "threshold",
      },
      { merge: true }
    );

    const completionSnap = await completionRef.get();
    const completedAt = completionSnap.data()?.completedAt?.toDate?.() ?? null;

    return ok({ labKey: "meaning", completedAt });
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 500;
    if (status === 401) return fail("UNAUTHENTICATED", "Log in to continue.", 401);
    if (status === 403) return fail("FORBIDDEN", "You don’t have access to this lab.", 403);
    console.error("/api/labs/meaning/complete POST error:", error);
    return fail("SERVER_ERROR", "Failed to complete meaning lab.", 500);
  }
}

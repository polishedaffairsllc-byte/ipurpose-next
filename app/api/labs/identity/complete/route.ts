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
    const mapSnap = await db.collection("identity_maps").doc(uid).get();
    const data = mapSnap.exists ? mapSnap.data() : null;

    if (!data) {
      return fail("NOT_FOUND", "No active lab draft found.", 404);
    }

    const fields = [
      String(data.selfPerceptionMap ?? ""),
      String(data.selfConceptMap ?? ""),
      String(data.selfNarrativeMap ?? ""),
    ];

    const chars = fields.join("\n").trim().length;
    const words = fields.reduce((acc, value) => acc + countWords(value), 0);
    const completeEnough = Boolean(data.completeEnough);

    const ready = completeEnough || chars >= 50 || words >= 20 || fields.some((value) => hasMeaningfulText(value));

    if (!ready) {
      return fail("NOT_READY", "Add a bit more detail in at least one section before completing.", 400);
    }

    const completionRef = db.collection("lab_completion").doc(`${uid}_identity`);
    await completionRef.set(
      {
        uid,
        labKey: "identity",
        completedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        method: completeEnough ? "checkbox" : "threshold",
      },
      { merge: true }
    );

    const completionSnap = await completionRef.get();
    const completedAt = completionSnap.data()?.completedAt?.toDate?.() ?? null;

    // Update learning_path_progress to sync with Learning Path page
    const [identityCompletion, meaningCompletion, agencyCompletion] = await db.getAll(
      db.collection("lab_completion").doc(`${uid}_identity`),
      db.collection("lab_completion").doc(`${uid}_meaning`),
      db.collection("lab_completion").doc(`${uid}_agency`)
    );

    const completedSteps: string[] = [];
    if (identityCompletion.exists) completedSteps.push("identity_lab");
    if (meaningCompletion.exists) completedSteps.push("meaning_lab");
    if (agencyCompletion.exists) completedSteps.push("agency_lab");

    const percentComplete = Math.round((completedSteps.length / 6) * 100); // 6 total steps including other activities

    await db.collection("learning_path_progress").doc(uid).set(
      {
        completedSteps,
        percentComplete,
        updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return ok({ labKey: "identity", completedAt });
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 500;
    if (status === 401) return fail("UNAUTHENTICATED", "Log in to continue.", 401);
    if (status === 403) return fail("FORBIDDEN", "You don’t have access to this lab.", 403);
    console.error("/api/labs/identity/complete POST error:", error);
    return fail("SERVER_ERROR", "Failed to complete identity lab.", 500);
  }
}

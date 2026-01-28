import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { ok, fail } from "@/lib/http";
import { isBlank } from "@/lib/validators";
import { requireUid, requireRole } from "@/lib/firebase/requireUser";

export async function GET() {
  try {
    const uid = await requireUid();
    await requireRole(uid, "explorer");
    const db = firebaseAdmin.firestore();
    const [userDoc, identityDoc, meaningDoc, agencyDoc, completionDocs] = await Promise.all([
      db.collection("users").doc(uid).get(),
      db.collection("identity_maps").doc(uid).get(),
      db.collection("meaning_maps").doc(uid).get(),
      db.collection("agency_maps").doc(uid).get(),
      db.getAll(
        db.collection("lab_completion").doc(`${uid}_identity`),
        db.collection("lab_completion").doc(`${uid}_meaning`),
        db.collection("lab_completion").doc(`${uid}_agency`)
      ),
    ]);

    const completed = new Set<string>();
    completionDocs.forEach((doc) => {
      if (doc.exists) {
        const key = doc.data()?.labKey as string | undefined;
        if (key) completed.add(key);
      }
    });

    const identity = identityDoc.exists ? identityDoc.data() : null;
    const meaning = meaningDoc.exists ? meaningDoc.data() : null;
    const agency = agencyDoc.exists ? agencyDoc.data() : null;

    const computeStatus = (labKey: "identity" | "meaning" | "agency", active: Record<string, unknown> | null | undefined, fields: string[]) => {
      if (completed.has(labKey)) return "complete";
      if (!active) return "not_started";
      const allEmpty = fields.every((field) => isBlank(String(active[field] ?? "")));
      return allEmpty ? "not_started" : "in_progress";
    };

    const identityStatus = computeStatus("identity", identity, ["selfPerceptionMap", "selfConceptMap", "selfNarrativeMap"]);
    const meaningStatus = computeStatus("meaning", meaning, ["valueStructure", "coherenceStructure", "directionStructure"]);
    const agencyStatus = computeStatus("agency", agency, ["awarenessPatterns", "decisionPatterns", "actionPatterns"]);

    return ok({
      stage: userDoc.data()?.stage ?? "Orientation",
      identityStatus,
      meaningStatus,
      agencyStatus,
      activeMapIds: {
        identity: identityDoc.exists ? identityDoc.id : null,
        meaning: meaningDoc.exists ? meaningDoc.id : null,
        agency: agencyDoc.exists ? agencyDoc.id : null,
      },
    });
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 500;
    if (status === 401) return fail("UNAUTHENTICATED", "Log in to continue.", 401);
    if (status === 403) return fail("FORBIDDEN", "You don’t have access to this area.", 403);
    console.error("/api/dashboard GET error:", error);
    return fail("SERVER_ERROR", "Failed to load dashboard.", 500);
  }
}

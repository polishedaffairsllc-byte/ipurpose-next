import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { firebaseAdmin } from "@/lib/firebaseAdmin";

const steps = [
  "orientation_intro",
  "identity_lab",
  "meaning_lab",
  "agency_lab",
  "integration_reflection",
  "community_reflection",
];

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("FirebaseSession")?.value;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const db = firebaseAdmin.firestore();
    const progressDoc = await db.collection("userProgress").doc(decoded.uid).collection("orientation").doc("status").get();

    const progress = progressDoc.exists ? progressDoc.data() : { currentStep: null, completedSteps: [] };
    const completedSteps = Array.isArray(progress.completedSteps) ? progress.completedSteps : [];
    const percentComplete = steps.length ? Math.round((completedSteps.length / steps.length) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        path: { key: "orientation_path", title: "Orientation" },
        progress: {
          currentStep: progress.currentStep || null,
          completedSteps,
          percentComplete,
        },
      },
    });
  } catch (error) {
    console.error("/api/learning-path/orientation GET error:", error);
    return NextResponse.json({ error: "Failed to load learning path" }, { status: 500 });
  }
}

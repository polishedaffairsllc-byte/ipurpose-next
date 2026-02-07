import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { checkRateLimit, recordRequest } from "@/app/api/gpt/utils/rate-limiter";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("FirebaseSession")?.value;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const docRef = firebaseAdmin.firestore().collection("identity_maps").doc(decoded.uid);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({
        success: true,
        data: { text: "" },
      });
    }

    const data = docSnap.data();
    const selfPerceptionMap = data?.selfPerceptionMap || "";
    const selfConceptMap = data?.selfConceptMap || "";
    const selfNarrativeMap = data?.selfNarrativeMap || "";

    // Format as summary text for Integration display
    const parts = [];
    if (selfPerceptionMap) parts.push(`Self-Perception: ${selfPerceptionMap}`);
    if (selfConceptMap) parts.push(`Self-Concept: ${selfConceptMap}`);
    if (selfNarrativeMap) parts.push(`Self-Narrative: ${selfNarrativeMap}`);
    
    const text = parts.length > 0 ? parts.join(" | ") : "";

    return NextResponse.json({
      success: true,
      data: { text },
    });
  } catch (error) {
    console.error("Identity lab GET error:", error);
    return NextResponse.json({ error: "Failed to load lab" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("FirebaseSession")?.value;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const rateLimit = await checkRateLimit(decoded.uid);

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: rateLimit.reason || "Rate limited" }, { status: 429 });
    }

    const body = await request.json();
    const text = typeof body?.text === "string" ? body.text : "";

    const docRef = firebaseAdmin.firestore().collection("users").doc(decoded.uid).collection("labs").doc("identity");
    await docRef.set(
      {
        text,
        updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await recordRequest(decoded.uid, 1);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Identity lab POST error:", error);
    return NextResponse.json({ error: "Failed to save lab" }, { status: 500 });
  }
}

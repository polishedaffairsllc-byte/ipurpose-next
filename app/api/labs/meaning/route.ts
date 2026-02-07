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
    const docRef = firebaseAdmin.firestore().collection("meaning_maps").doc(decoded.uid);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({
        success: true,
        data: { text: "" },
      });
    }

    const data = docSnap.data();
    const valueStructure = data?.valueStructure || "";
    const coherenceStructure = data?.coherenceStructure || "";
    const directionStructure = data?.directionStructure || "";

    // Format as summary text for Integration display
    const parts = [];
    if (valueStructure) parts.push(`Values: ${valueStructure}`);
    if (coherenceStructure) parts.push(`Coherence: ${coherenceStructure}`);
    if (directionStructure) parts.push(`Direction: ${directionStructure}`);
    
    const text = parts.length > 0 ? parts.join(" | ") : "";

    return NextResponse.json({
      success: true,
      data: { text },
    });
  } catch (error) {
    console.error("Meaning lab GET error:", error);
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

    const docRef = firebaseAdmin.firestore().collection("users").doc(decoded.uid).collection("labs").doc("meaning");
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
    console.error("Meaning lab POST error:", error);
    return NextResponse.json({ error: "Failed to save lab" }, { status: 500 });
  }
}

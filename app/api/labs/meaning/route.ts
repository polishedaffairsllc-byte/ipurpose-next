import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { firebaseAdmin } from "@/lib/firebaseAdmin";

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

// Old text-only writes used a different path from GET and could not be reloaded.
// Structured /save and /active endpoints are the supported editor contract.
export async function POST() {
  return NextResponse.json(
    { error: "Please refresh and use the lab editor to save your changes." },
    { status: 410 }
  );
}

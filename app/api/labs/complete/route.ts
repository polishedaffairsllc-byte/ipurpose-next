import { getLabCompletion } from "@/lib/labs/completion";
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
    const data = await getLabCompletion(firebaseAdmin.firestore(), decoded.uid);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Lab completion GET error:", error);
    return NextResponse.json({ error: "Failed to load completion" }, { status: 500 });
  }
}

// No in-repository caller remains; use the per-lab endpoint with readiness checks.
export async function POST() {
  return NextResponse.json(
    { error: "Please refresh and complete the lab from its editor." },
    { status: 410 }
  );
}

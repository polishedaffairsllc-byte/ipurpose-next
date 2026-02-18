import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("FirebaseSession")?.value;
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const db = firebaseAdmin.firestore();
    const progressRef = db
      .collection("users")
      .doc(decoded.uid)
      .collection("accelerator")
      .doc("progress");

    // Reset to empty completed weeks
    await progressRef.set(
      {
        completedWeeks: [],
        lastUpdated: new Date().toISOString(),
        resetAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({ success: true, completedWeeks: [] });
  } catch (error: any) {
    console.error("Reset progress error:", error);
    return NextResponse.json({ error: "Failed to reset progress" }, { status: 500 });
  }
}

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { firebaseAdmin } from "@/lib/firebaseAdmin";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("FirebaseSession")?.value;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const body = await request.json();
    const { currentStep, completedSteps } = body || {};

    const db = firebaseAdmin.firestore();
    const docRef = db.collection("userProgress").doc(decoded.uid).collection("orientation").doc("status");

    await docRef.set(
      {
        ...(currentStep ? { currentStep } : {}),
        ...(completedSteps ? { completedSteps } : {}),
        updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("/api/learning-path/orientation/progress POST error:", error);
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
}

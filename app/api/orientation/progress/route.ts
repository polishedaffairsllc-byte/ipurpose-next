import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { firebaseAdmin } from "@/lib/firebaseAdmin";

const DEFAULT_PROGRESS = {
  currentStep: "identity",
  completedSteps: [],
  startedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
  updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
};

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("FirebaseSession")?.value;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const db = firebaseAdmin.firestore();
    const docRef = db.collection("userProgress").doc(decoded.uid).collection("orientation").doc("status");
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      await docRef.set(DEFAULT_PROGRESS);
      const created = await docRef.get();
      return NextResponse.json({ success: true, data: created.data() });
    }

    return NextResponse.json({ success: true, data: docSnap.data() });
  } catch (error) {
    console.error("Orientation progress GET error:", error);
    return NextResponse.json({ error: "Failed to load progress" }, { status: 500 });
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
    const body = await request.json();

    const { currentStep, completedSteps } = body || {};

    if (!currentStep && !completedSteps) {
      return NextResponse.json({ error: "Missing progress payload" }, { status: 400 });
    }

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

    const updated = await docRef.get();
    return NextResponse.json({ success: true, data: updated.data() });
  } catch (error) {
    console.error("Orientation progress POST error:", error);
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
}

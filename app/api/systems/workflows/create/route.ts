import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { firebaseAdmin } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("FirebaseSession")?.value ?? null;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const body = await req.json().catch(() => ({} as any));
    const name = (body.name || "").trim();
    const steps = (body.steps || "").trim();

    if (!name) {
      return NextResponse.json({ error: "Workflow name is required." }, { status: 400 });
    }

    const db = firebaseAdmin.firestore();
    const now = firebaseAdmin.firestore.FieldValue.serverTimestamp();
    const docRef = db.collection("workflowSystems").doc();
    await docRef.set({
      uid: decoded.uid,
      name,
      steps,
      createdAt: now,
      updatedAt: now,
    });

    await db.collection("users").doc(decoded.uid).set(
      { systems: { workflowBuilderHasSystem: true } },
      { merge: true }
    );

    return NextResponse.json({ id: docRef.id });
  } catch (error) {
    console.error("Workflow create failed", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

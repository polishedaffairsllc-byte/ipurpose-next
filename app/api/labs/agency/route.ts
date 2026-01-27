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
    const docRef = firebaseAdmin.firestore().collection("users").doc(decoded.uid).collection("labs").doc("agency");
    const docSnap = await docRef.get();

    return NextResponse.json({
      success: true,
      data: docSnap.exists ? docSnap.data() : { text: "" },
    });
  } catch (error) {
    console.error("Agency lab GET error:", error);
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

    const docRef = firebaseAdmin.firestore().collection("users").doc(decoded.uid).collection("labs").doc("agency");
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
    console.error("Agency lab POST error:", error);
    return NextResponse.json({ error: "Failed to save lab" }, { status: 500 });
  }
}

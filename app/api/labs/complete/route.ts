import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { checkRateLimit, recordRequest } from "@/app/api/gpt/utils/rate-limiter";

const validLabKeys = new Set(["identity", "meaning", "agency"]);

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("FirebaseSession")?.value;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const docRef = firebaseAdmin.firestore().collection("labCompletion").doc(decoded.uid);
    const docSnap = await docRef.get();

    return NextResponse.json({
      success: true,
      data: docSnap.exists ? docSnap.data() : {},
    });
  } catch (error) {
    console.error("Lab completion GET error:", error);
    return NextResponse.json({ error: "Failed to load completion" }, { status: 500 });
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
    const labKey = typeof body?.labKey === "string" ? body.labKey : "";

    if (!validLabKeys.has(labKey)) {
      return NextResponse.json({ error: "Invalid labKey" }, { status: 400 });
    }

    const docRef = firebaseAdmin.firestore().collection("labCompletion").doc(decoded.uid);
    await docRef.set(
      {
        [labKey]: true,
        updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await recordRequest(decoded.uid, 1);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lab completion error:", error);
    return NextResponse.json({ error: "Failed to update completion" }, { status: 500 });
  }
}

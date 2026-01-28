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
    const db = firebaseAdmin.firestore();
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    return NextResponse.json({
      success: true,
      data: {
        userId: decoded.uid,
        entitlement: userData?.entitlement ?? null,
        profile: {
          displayName: userData?.profile?.displayName ?? null,
          timezone: userData?.profile?.timezone ?? null,
        },
        acceptedTermsAt: userData?.acceptedTermsAt ?? null,
      },
    });
  } catch (error) {
    console.error("/api/me GET error:", error);
    return NextResponse.json({ error: "Failed to load user" }, { status: 500 });
  }
}

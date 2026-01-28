import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { firebaseAdmin } from "@/lib/firebaseAdmin";

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("FirebaseSession")?.value;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const body = await request.json();

    const displayName = typeof body?.displayName === "string" ? body.displayName : null;
    const timezone = typeof body?.timezone === "string" ? body.timezone : null;

    const db = firebaseAdmin.firestore();
    const userRef = db.collection("users").doc(decoded.uid);

    await userRef.set(
      {
        profile: {
          displayName,
          timezone,
        },
        profileUpdatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("/api/me/profile PATCH error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

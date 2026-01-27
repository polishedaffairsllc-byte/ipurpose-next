import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { firebaseAdmin } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("FirebaseSession")?.value ?? null;

    if (!session) {
      return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });
    }

    let acceptedTermsVersion = "v1";
    try {
      const body = await req.json();
      if (body?.acceptedTermsVersion) {
        acceptedTermsVersion = body.acceptedTermsVersion;
      }
    } catch {
      // ignore body parse errors
    }

    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const db = firebaseAdmin.firestore();
    const userRef = db.collection("users").doc(decoded.uid);

    await userRef.set(
      {
        acceptedTermsAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        acceptedTermsVersion,
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("onboarding accept error:", error);
    return NextResponse.json({ ok: false, error: "server-error" }, { status: 500 });
  }
}

import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";

// Force this route to be dynamic (no build-time prerendering)
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("FirebaseSession")?.value;

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedClaims = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const userId = decodedClaims.uid;
    const { practiceId, reflection, durationMinutes } = await request.json();

    const db = firebaseAdmin.firestore();
    await db.collection("users").doc(userId).collection("practices").add({
      practiceId,
      reflection: reflection || null,
      durationMinutes,
      completedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp()
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Practice save error:", error);
    return Response.json({ error: "Failed to save practice" }, { status: 500 });
  }
}

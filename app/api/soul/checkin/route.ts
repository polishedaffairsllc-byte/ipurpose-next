import { cookies } from "next/headers";
import { firebaseAdmin } from "@/lib/firebaseAdmin";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("FirebaseSession")?.value;

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedClaims = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const userId = decodedClaims.uid;
    const { emotions, alignmentScore, need, type } = await request.json();

    const db = firebaseAdmin.firestore();
    await db.collection("users").doc(userId).collection("checkIns").add({
      emotions,
      alignmentScore: parseInt(alignmentScore),
      need,
      type,
      createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp()
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Check-in save error:", error);
    return Response.json({ error: "Failed to save check-in" }, { status: 500 });
  }
}

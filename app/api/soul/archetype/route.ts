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
    const { primary, secondary } = await request.json();

    const db = firebaseAdmin.firestore();
    await db.collection("users").doc(userId).update({
      archetypePrimary: primary,
      archetypeSecondary: secondary || null,
      archetypeUpdatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp()
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Archetype save error:", error);
    return Response.json({ error: "Failed to save archetype" }, { status: 500 });
  }
}

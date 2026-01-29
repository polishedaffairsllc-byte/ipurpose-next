import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { requireDeepening } from "@/lib/apiEntitlementHelper";

// Force this route to be dynamic (no build-time prerendering)
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const entitlement = await requireDeepening();
    if (entitlement.error) return entitlement.error;
    const { uid: userId } = entitlement as { uid: string };
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

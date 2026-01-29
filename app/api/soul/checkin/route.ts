import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { requireDeepening } from "@/lib/apiEntitlementHelper";

// Force this route to be dynamic (no build-time prerendering)
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const entitlement = await requireDeepening();
    if (entitlement.error) return entitlement.error;
    const { uid: userId } = entitlement as { uid: string };
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

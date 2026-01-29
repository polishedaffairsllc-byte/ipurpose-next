import { NextResponse } from "next/server";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { checkRateLimit, recordRequest } from "@/app/api/gpt/utils/rate-limiter";
import { requireBasicPaid } from "@/lib/apiEntitlementHelper";

export async function GET() {
  try {
    const entitlement = await requireBasicPaid();
    if (entitlement.error) return entitlement.error;
    const { uid } = entitlement as { uid: string };

    const docRef = firebaseAdmin.firestore().collection("integration").doc(uid);
    const docSnap = await docRef.get();

    return NextResponse.json({
      success: true,
      data: docSnap.exists ? docSnap.data() : null,
    });
  } catch (error) {
    console.error("Integration GET error:", error);
    return NextResponse.json({ error: "Failed to load integration" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const entitlement = await requireBasicPaid();
    if (entitlement.error) return entitlement.error;
    const { uid } = entitlement as { uid: string };

    const rateLimit = await checkRateLimit(uid);

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: rateLimit.reason || "Rate limited" }, { status: 429 });
    }

    const body = await request.json();
    const coreTruth = typeof body?.coreTruth === "string" ? body.coreTruth : "";
    const primaryDirection = typeof body?.primaryDirection === "string" ? body.primaryDirection : "";
    const internalShift = typeof body?.internalShift === "string" ? body.internalShift : "";
    const sevenDayPlan = Array.isArray(body?.sevenDayPlan) ? body.sevenDayPlan : [];

    const docRef = firebaseAdmin.firestore().collection("integration").doc(uid);
    await docRef.set(
      {
        coreTruth,
        primaryDirection,
        internalShift,
        sevenDayPlan,
        updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await recordRequest(uid, 1);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Integration POST error:", error);
    return NextResponse.json({ error: "Failed to save integration" }, { status: 500 });
  }
}

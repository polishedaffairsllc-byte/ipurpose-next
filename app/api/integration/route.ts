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
    const journalEntries = body?.journalEntries || [];
    const labResponses = body?.labResponses || null;
    const labFingerprint = body?.labFingerprint || null;

    const db = firebaseAdmin.firestore();
    const now = firebaseAdmin.firestore.Timestamp.now();
    const dateString = now.toDate().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Save to main integration document (for quick access)
    const docRef = db.collection("integration").doc(uid);
    await docRef.set(
      {
        coreTruth,
        primaryDirection,
        internalShift,
        sevenDayPlan,
        labFingerprint,
        updatedAt: now,
      },
      { merge: true }
    );

    // Create artifact in integration_history for retrieval
    const artifactRef = db.collection("integration_history").doc();
    await artifactRef.set({
      uid,
      title: `Integration Reflection — ${dateString}`,
      createdAt: now,
      coreTruth,
      primaryDirection,
      internalShift,
      sevenDayPlan,
      journalEntries,
      labResponses,
      labFingerprint,
    });

    await recordRequest(uid, 1);

    return NextResponse.json({ 
      success: true,
      artifactId: artifactRef.id,
      title: `Integration Reflection — ${dateString}`
    });
  } catch (error) {
    console.error("Integration POST error:", error);
    return NextResponse.json({ error: "Failed to save integration" }, { status: 500 });
  }
}

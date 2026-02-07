import { NextResponse } from "next/server";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { requireBasicPaid } from "@/lib/apiEntitlementHelper";

export async function POST(request: Request) {
  try {
    const entitlement = await requireBasicPaid();
    if (entitlement.error) return entitlement.error;
    const { uid } = entitlement as { uid: string };

    const body = await request.json();
    const savedFingerprint = body?.savedFingerprint;

    if (!savedFingerprint) {
      return NextResponse.json({ changed: false });
    }

    const db = firebaseAdmin.firestore();

    // Fetch current lab data
    const [identityDoc, meaningDoc, agencyDoc] = await Promise.all([
      db.collection("identity_maps").doc(uid).get(),
      db.collection("meaning_maps").doc(uid).get(),
      db.collection("agency_maps").doc(uid).get(),
    ]);

    const identityData = identityDoc.exists ? identityDoc.data() : {};
    const meaningData = meaningDoc.exists ? meaningDoc.data() : {};
    const agencyData = agencyDoc.exists ? agencyDoc.data() : {};

    // Create current fingerprint
    const currentFingerprint = {
      identityUpdatedAt: identityData?.updatedAt?.toMillis() || 0,
      meaningUpdatedAt: meaningData?.updatedAt?.toMillis() || 0,
      agencyUpdatedAt: agencyData?.updatedAt?.toMillis() || 0,
    };

    // Compare fingerprints
    const changed = 
      currentFingerprint.identityUpdatedAt !== savedFingerprint.identityUpdatedAt ||
      currentFingerprint.meaningUpdatedAt !== savedFingerprint.meaningUpdatedAt ||
      currentFingerprint.agencyUpdatedAt !== savedFingerprint.agencyUpdatedAt;

    return NextResponse.json({ 
      changed,
      currentFingerprint,
      savedFingerprint
    });

  } catch (error) {
    console.error("Check labs changed error:", error);
    return NextResponse.json({ error: "Failed to check changes" }, { status: 500 });
  }
}

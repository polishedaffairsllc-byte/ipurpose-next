import { NextResponse } from "next/server";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { requireUid } from "@/lib/firebase/requireUser";

export async function GET() {
  try {
    const uid = await requireUid();
    const db = firebaseAdmin.firestore();
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    
    // Determine user's entitlement tier
    const isFounder = userData?.isFounder === true || userData?.role === "founder" || userData?.entitlementTier === "founder";
    const membershipTier = userData?.membership?.tier || userData?.entitlementTier || userData?.tier || 'FREE';
    const tier = isFounder ? 'DEEPENING' : membershipTier;
    
    return NextResponse.json({
      success: true,
      data: {
        uid,
        email: userData?.email || "",
        displayName: userData?.displayName || "",
        archetypePrimary: userData?.archetypePrimary || "",
        archetypeSecondary: userData?.archetypeSecondary || "",
        stage: userData?.stage || "Orientation",
        tier: tier,
      },
    });
  } catch (error) {
    console.error("User GET error:", error);
    return NextResponse.json({ error: "Failed to load user data" }, { status: 500 });
  }
}

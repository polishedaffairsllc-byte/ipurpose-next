import { NextResponse } from "next/server";
import { requireBasicPaid } from "@/lib/apiEntitlementHelper";
import { getCompanionProfile } from "@/lib/ai/companionContext";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const entitlement = await requireBasicPaid();
    if (entitlement.error) return entitlement.error;

    const profile = await getCompanionProfile(entitlement.uid);
    return NextResponse.json(
      { profile },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error("Companion profile GET error:", error);
    return NextResponse.json(
      { error: "Failed to load companion profile" },
      { status: 500 }
    );
  }
}

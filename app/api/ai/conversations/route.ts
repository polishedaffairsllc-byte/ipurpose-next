import { NextResponse } from "next/server";
import { requireBasicPaid } from "@/lib/apiEntitlementHelper";
import { listCompanionConversations } from "@/lib/ai/companionConversations";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const entitlement = await requireBasicPaid();
    if (entitlement.error) return entitlement.error;

    const conversations = await listCompanionConversations(entitlement.uid);
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Companion conversations GET error:", error);
    return NextResponse.json(
      { error: "Failed to load Mentor conversations" },
      { status: 500 }
    );
  }
}

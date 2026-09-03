import { NextResponse } from "next/server";
import { requireAuthenticated } from "@/lib/apiEntitlementHelper";
import { listCompanionConversations } from "@/lib/ai/companionConversations";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authentication = await requireAuthenticated();
    if (authentication.error) return authentication.error;

    const conversations = await listCompanionConversations(authentication.uid);
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Companion conversations GET error:", error);
    return NextResponse.json(
      { error: "Failed to load Mentor conversations" },
      { status: 500 }
    );
  }
}

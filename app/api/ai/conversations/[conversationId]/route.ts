import { NextResponse } from "next/server";
import { requireBasicPaid } from "@/lib/apiEntitlementHelper";
import {
  CompanionConversationError,
  getCompanionMessages,
} from "@/lib/ai/companionConversations";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ conversationId: string }>;
}
export async function GET(_request: Request, context: RouteContext) {
  try {
    const entitlement = await requireBasicPaid();
    if (entitlement.error) return entitlement.error;

    const { conversationId } = await context.params;
    const messages = await getCompanionMessages(entitlement.uid, conversationId);
    return NextResponse.json({ conversationId, messages });
  } catch (error) {
    if (error instanceof CompanionConversationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Companion messages GET error:", error);
    return NextResponse.json(
      { error: "Failed to load Mentor conversation" },
      { status: 500 }
    );
  }
}

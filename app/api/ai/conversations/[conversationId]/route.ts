import { NextResponse } from "next/server";
import { requireAuthenticated } from "@/lib/apiEntitlementHelper";
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
    const authentication = await requireAuthenticated();
    if (authentication.error) return authentication.error;

    const { conversationId } = await context.params;
    const messages = await getCompanionMessages(authentication.uid, conversationId);
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

/**
 * Authenticated iPurpose Mentor endpoint with persistent Companion memory.
 */

import { NextRequest, NextResponse } from "next/server";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import {
  getSystemPrompt,
  inferLensFromMessage,
  type ResponseMode,
} from "@/lib/ai/prompts/ipurposeMentorPrompts";
import { requireBasicPaid } from "@/lib/apiEntitlementHelper";
import { getOpenAI } from "@/app/api/gpt/utils/openai-client";
import { checkRateLimit, recordRequest } from "@/app/api/gpt/utils/rate-limiter";
import {
  CompanionConversationError,
  getCompanionHistory,
  saveCompanionTurn,
} from "@/lib/ai/companionConversations";
import { getCompanionContext } from "@/lib/ai/companionContext";
import { formatCompanionContext } from "@/lib/ai/companionContextFormatter";
import {
  getCompanionModelConfig,
  resolveCompanionModel,
} from "@/lib/ai/companionModelConfig";

export const dynamic = "force-dynamic";

const RESPONSE_MODES = new Set<ResponseMode>(["balanced", "reflect", "build", "expand"]);

interface ChatRequest {
  message?: unknown;
  responseMode?: unknown;
  model?: unknown;
  conversationId?: unknown;
}
export async function POST(request: NextRequest) {
  try {
    const entitlement = await requireBasicPaid();
    if (entitlement.error) return entitlement.error;
    const uid = entitlement.uid;

    const body = (await request.json().catch(() => null)) as ChatRequest | null;
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON request" }, { status: 400 });
    }

    const message = typeof body.message === "string" ? body.message.trim() : "";
    const mode = typeof body.responseMode === "string"
      ? body.responseMode as ResponseMode
      : "balanced";
    const conversationId = typeof body.conversationId === "string"
      ? body.conversationId
      : undefined;
    const requestedModel = typeof body.model === "string" ? body.model : undefined;
    const modelConfig = getCompanionModelConfig();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }
    if (message.length > modelConfig.maxInputCharacters) {
      return NextResponse.json(
        { error: `Message must be ${modelConfig.maxInputCharacters} characters or fewer` },
        { status: 400 }
      );
    }
    if (!RESPONSE_MODES.has(mode)) {
      return NextResponse.json({ error: "Invalid response mode" }, { status: 400 });
    }

    const rateLimit = await checkRateLimit(uid);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: rateLimit.reason || "Too many Mentor requests" },
        { status: 429 }
      );
    }

    const [journeyContext, conversationHistory] = await Promise.all([
      getCompanionContext(uid),
      getCompanionHistory(uid, conversationId),
    ]);

    const inferredLens = mode === "balanced" ? inferLensFromMessage(message) : undefined;
    const model = resolveCompanionModel(requestedModel);
    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: getSystemPrompt(mode, inferredLens) },
      { role: "system", content: formatCompanionContext(journeyContext) },
      ...conversationHistory,
      { role: "user", content: message },
    ];

    const response = await getOpenAI().chat.completions.create({
      model,
      messages,
      temperature: 0.8,
      max_tokens: modelConfig.maxOutputTokens,
    });

    const assistantMessage =
      response.choices[0]?.message?.content?.trim() ||
      "I'm unable to respond right now.";

    const savedConversationId = await saveCompanionTurn({
      uid,
      conversationId,
      responseMode: mode,
      userMessage: message,
      assistantMessage,
      model: response.model || model,
      inferredLens,
    });

    recordRequest(uid, response.usage?.total_tokens || 0).catch((error) => {
      console.warn("Unable to record Mentor token usage:", error);
    });

    return NextResponse.json({
      response: assistantMessage,
      conversationId: savedConversationId,
      inferredLens,
      responseMode: mode,
      model: response.model || model,
    });
  } catch (error) {
    if (error instanceof CompanionConversationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Mentor API error:", error);
    return NextResponse.json(
      { error: "The iPurpose Mentor is unavailable right now. Please try again." },
      { status: 500 }
    );
  }
}

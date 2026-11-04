import { randomUUID } from 'node:crypto';
import { reserveCompassRequest, requestFingerprint, failCompassRequest } from '@/lib/ai/compassRequests';
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
import { requireAuthenticated } from "@/lib/apiEntitlementHelper";
import { getOpenAI } from "@/app/api/gpt/utils/openai-client";
import { checkRateLimit, recordRequest } from "@/app/api/gpt/utils/rate-limiter";
import {
  CompanionConversationError,
  getCompanionHistory,
  saveCompanionTurnWithMessage,
} from "@/lib/ai/companionConversations";
import { getCompanionContext } from "@/lib/ai/companionContext";
import { formatCompanionContext } from "@/lib/ai/companionContextFormatter";
import {
  getCompanionModelConfig,
  resolveCompanionModel,
} from "@/lib/ai/companionModelConfig";

import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { CompanionSafetyError, requireAiConsent } from "@/lib/ai/companionSafety";
import { COMPASS_SAFETY_PROMPT, requireSafeContent } from "@/lib/ai/contentSafety";

export const dynamic = "force-dynamic";

const RESPONSE_MODES = new Set<ResponseMode>(["balanced", "reflect", "build", "expand"]);

interface ChatRequest {
  requestId?: unknown;
  message?: unknown;
  responseMode?: unknown;
  model?: unknown;
  conversationId?: unknown;
}
export async function POST(request: NextRequest) {
  let claimed: { uid: string; id: string } | null = null;
  let providerStarted = false;
  try {
    const authentication = await requireAuthenticated();
    if (authentication.error) return authentication.error;
    const uid = authentication.uid;

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
    if (body.model !== undefined && (typeof body.model !== 'string' || !modelConfig.allowedModels.has(body.model))) {
      return NextResponse.json({ error: 'Unsupported generation model. Only gpt-4o-mini is approved.' }, { status: 400 });
    }
    const model = resolveCompanionModel(requestedModel);

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

    await requireAiConsent(firebaseAdmin.firestore(), uid);
    const isV2 = new URL(request.url).pathname.endsWith('/v2');
    if ((body.requestId !== undefined && typeof body.requestId !== 'string') || (isV2 && !body.requestId)) return NextResponse.json({ error: 'A message request identifier is required.' }, { status: 400 });
    const id = typeof body.requestId === 'string' ? body.requestId : randomUUID();
    const cached = await reserveCompassRequest(firebaseAdmin.firestore(), uid, id, requestFingerprint({ message, mode, conversationId: conversationId || null, requestedModel: requestedModel || null }));
    if (cached) return NextResponse.json(cached, { headers: { 'Cache-Control': 'no-store' } });
    claimed = { uid, id };

    const rateLimit = await checkRateLimit(uid);
    if (!rateLimit.allowed) {
      await failCompassRequest(firebaseAdmin.firestore(), uid, id, true, rateLimit.unavailable ? 503 : 429);
      return NextResponse.json(
        { error: rateLimit.reason || "Too many Mentor requests" },
        {
          status: rateLimit.unavailable ? 503 : 429,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    const [journeyContext, conversationHistory] = await Promise.all([
      getCompanionContext(uid),
      getCompanionHistory(uid, conversationId),
    ]);

    const inferredLens = mode === "balanced" ? inferLensFromMessage(message) : undefined;
    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: COMPASS_SAFETY_PROMPT },
      { role: "system", content: getSystemPrompt(mode, inferredLens) },
      { role: "system", content: formatCompanionContext(journeyContext) },
      ...conversationHistory,
      { role: "user", content: message },
    ];

    // Context loading can outlast a permission withdrawal. Check immediately
    // before each new OpenAI request, including moderation.
    await requireAiConsent(firebaseAdmin.firestore(), uid);
    providerStarted = true;
    await requireSafeContent([message, ...conversationHistory.map(item => item.content), formatCompanionContext(journeyContext)]);
    // Recheck after context/moderation awaits so a withdrawal blocks generation.
    await requireAiConsent(firebaseAdmin.firestore(), uid);
    const response = await getOpenAI().chat.completions.create({
      model,
      messages,
      temperature: 0.8,
      max_tokens: modelConfig.maxOutputTokens,
    });

    const assistantMessage =
      response.choices[0]?.message?.content?.trim() ||
      "I'm unable to respond right now.";

    // Account for completed billable work even if conversation persistence fails.
    // Await the write so a serverless response cannot abandon it in the background.
    await recordRequest(uid, response.usage?.total_tokens || 0);

    await requireAiConsent(firebaseAdmin.firestore(), uid);
    await requireSafeContent(assistantMessage);
    await requireAiConsent(firebaseAdmin.firestore(), uid);
    const savedTurn = await saveCompanionTurnWithMessage({
      uid,
      conversationId,
      responseMode: mode,
      userMessage: message,
      assistantMessage,
      model: response.model || model,
      inferredLens,
      requestId: id,
    });

    return NextResponse.json({
      response: assistantMessage,
      conversationId: savedTurn.conversationId,
      assistantMessageId: savedTurn.assistantMessageId,
      inferredLens,
      responseMode: mode,
      model: response.model || model,
    });
  } catch (error) {
    if (claimed) {
      try { await failCompassRequest(firebaseAdmin.firestore(), claimed.uid, claimed.id, !providerStarted, error instanceof CompanionSafetyError ? error.status : 500); }
      catch { /* Keep an uncertain pending request closed to provider replay. */ }
    }
    if (error instanceof CompanionConversationError || error instanceof CompanionSafetyError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Mentor API unavailable");
    return NextResponse.json(
      { error: "The iPurpose Mentor is unavailable right now. Please try again." },
      { status: 500 }
    );
  }
}

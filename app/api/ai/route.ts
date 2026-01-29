/**
 * /api/ai/chat endpoint
 * Handles iPurpose Mentor chat with response mode routing and lens inference
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  getSystemPrompt,
  inferLensFromMessage,
  ResponseMode,
} from "@/lib/ai/prompts/ipurposeMentorPrompts";
import { requireBasicPaid } from "@/lib/apiEntitlementHelper";

// Force this route to be dynamic (no build-time prerendering)
export const dynamic = 'force-dynamic';

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY environment variable');
  }
  return new OpenAI({ apiKey });
}

interface ChatRequest {
  message: string;
  responseMode: "balanced" | "reflect" | "build" | "expand";
  model?: string;
  userId?: string;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
}

export async function POST(request: NextRequest) {
  try {
    const entitlement = await requireBasicPaid();
    if (entitlement.error) return entitlement.error;

    const body = (await request.json()) as ChatRequest;
    const { message, responseMode, model = "gpt-4o-mini", conversationHistory = [] } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const openai = getOpenAI();

    // Get the system prompt for the selected response mode
    const systemPrompt = getSystemPrompt(responseMode as ResponseMode);

    // Infer lens if in balanced mode
    let inferredLens: "soul" | "systems" | "ai" | undefined;
    if (responseMode === "balanced") {
      inferredLens = inferLensFromMessage(message);
    }

    // Build messages array with system prompt as first message
    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...conversationHistory,
      { role: "user" as const, content: message },
    ];

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: 0.8,
      max_tokens: 1024,
    });

    const assistantMessage =
      response.choices[0]?.message?.content || "I'm unable to respond right now.";

    return NextResponse.json({
      response: assistantMessage,
      inferredLens,
      responseMode,
      model,
    });
  } catch (error) {
    console.error("Chat API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

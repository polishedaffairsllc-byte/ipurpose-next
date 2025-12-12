/**
 * AI Tools Domain Handler
 * Handles GPT requests for content generation, prompts, and AI-powered tools
 */

import type { GPTRequest, GPTResponse, AIToolsContext } from '../types';
import { getUserContext } from '../utils/context';
import { compilePrompt } from '../prompt-engine/compiler';
import { logInteraction } from '../utils/firestore';
import { callGPT, validatePromptLength } from '../utils/gpt-core';

export async function handleAIToolsRequest(request: GPTRequest): Promise<GPTResponse> {
  try {
    // 1. Validate prompt length
    if (!validatePromptLength(request.prompt)) {
      return {
        success: false,
        error: {
          code: 'PROMPT_TOO_LONG',
          message: 'Prompt exceeds maximum length',
        },
      };
    }

    // 2. Fetch user context from Firestore
    const userContext = await getUserContext<AIToolsContext>(request.userId, 'ai-tools');

    // 3. Compile prompt with AI tools-specific context
    const compiledPrompt = await compilePrompt({
      domain: 'ai-tools',
      userPrompt: request.prompt,
      context: userContext,
    });

    // 4. Call OpenAI API
    const result = await callGPT({
      userId: request.userId,
      domain: 'ai-tools',
      compiledPrompt,
      temperature: request.options?.temperature,
      maxTokens: request.options?.maxTokens,
      model: request.options?.model,
    });

    // 5. Log interaction to Firestore
    await logInteraction({
      userId: request.userId,
      domain: 'ai-tools',
      prompt: request.prompt,
      response: result.content,
      tokensUsed: result.tokensUsed,
      context: userContext,
      model: result.model,
      finishReason: result.finishReason,
      temperature: request.options?.temperature,
      streamEnabled: false,
    });

    // 6. Return response
    return {
      success: true,
      data: {
        content: result.content,
        tokensUsed: result.tokensUsed,
        model: result.model,
        timestamp: new Date().toISOString(),
      },
    };

  } catch (error) {
    console.error('AI Tools Handler Error:', error);
    
    return {
      success: false,
      error: {
        code: 'AI_TOOLS_HANDLER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to process AI tools request'
      }
    };
  }
}

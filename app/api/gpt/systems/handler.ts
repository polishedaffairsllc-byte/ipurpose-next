/**
 * Systems Domain Handler
 * Handles GPT requests for workflows, offers, and business systems
 */

import type { GPTRequest, GPTResponse, SystemsContext } from '../types';
import { getUserContext } from '../utils/context';
import { compilePrompt } from '../prompt-engine/compiler';
import { logInteraction } from '../utils/firestore';
import { callGPT, validatePromptLength } from '../utils/gpt-core';

export async function handleSystemsRequest(request: GPTRequest): Promise<GPTResponse> {
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
    const userContext = await getUserContext<SystemsContext>(request.userId, 'systems');

    // 3. Compile prompt with systems-specific context
    const compiledPrompt = await compilePrompt({
      domain: 'systems',
      userPrompt: request.prompt,
      context: userContext,
    });

    // 4. Call OpenAI API
    const result = await callGPT({
      userId: request.userId,
      domain: 'systems',
      compiledPrompt,
      temperature: request.options?.temperature,
      maxTokens: request.options?.maxTokens,
      model: request.options?.model,
    });

    // 5. Log interaction to Firestore
    await logInteraction({
      userId: request.userId,
      domain: 'systems',
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
    console.error('Systems Handler Error:', error);
    
    return {
      success: false,
      error: {
        code: 'SYSTEMS_HANDLER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to process systems request'
      }
    };
  }
}

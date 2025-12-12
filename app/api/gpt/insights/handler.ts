/**
 * Insights Domain Handler
 * Handles GPT requests for data analysis, trends, and strategic insights
 */

import type { GPTRequest, GPTResponse, InsightsContext } from '../types';
import { getUserContext } from '../utils/context';
import { compilePrompt } from '../prompt-engine/compiler';
import { logInteraction } from '../utils/firestore';
import { callGPT, validatePromptLength } from '../utils/gpt-core';

export async function handleInsightsRequest(request: GPTRequest): Promise<GPTResponse> {
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
    const userContext = await getUserContext<InsightsContext>(request.userId, 'insights');

    // 3. Compile prompt with insights-specific context
    const compiledPrompt = await compilePrompt({
      domain: 'insights',
      userPrompt: request.prompt,
      context: userContext,
    });

    // 4. Call OpenAI API
    const result = await callGPT({
      userId: request.userId,
      domain: 'insights',
      compiledPrompt,
      temperature: request.options?.temperature,
      maxTokens: request.options?.maxTokens,
      model: request.options?.model,
    });

    // 5. Log interaction to Firestore
    await logInteraction({
      userId: request.userId,
      domain: 'insights',
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
    console.error('Insights Handler Error:', error);
    
    return {
      success: false,
      error: {
        code: 'INSIGHTS_HANDLER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to process insights request'
      }
    };
  }
}

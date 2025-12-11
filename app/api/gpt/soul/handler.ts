/**
 * Soul Domain Handler
 * Handles GPT requests for soul alignment, archetypes, and purpose discovery
 */

import type { GPTRequest, GPTResponse, SoulContext } from '../types';
import { getUserContext } from '../utils/context';
import { compilePrompt } from '../prompt-engine/compiler';
import { logInteraction } from '../utils/firestore';
import { callGPT, validatePromptLength } from '../utils/gpt-core';
import { enrichPrompt, extractInsights } from '../utils/enrichment';
import { upsertConversationSession, saveConversationMemory, getUserPreferences, updateDomainPreferences } from '../utils/preferences';

export async function handleSoulRequest(request: GPTRequest): Promise<GPTResponse> {
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
    const userContext = await getUserContext<SoulContext>(request.userId, 'soul');

    // 3. Enrich prompt with user context and history
    const enrichmentResult = await enrichPrompt(
      request.userId,
      'soul',
      request.prompt,
      userContext.currentArchetype
    );

    // 4. Compile prompt with soul-specific context
    const compiledPrompt = await compilePrompt({
      domain: 'soul',
      userPrompt: enrichmentResult.enrichedPrompt,
      context: userContext,
    });

    // 5. Call OpenAI API
    const result = await callGPT({
      userId: request.userId,
      domain: 'soul',
      compiledPrompt,
      temperature: request.options?.temperature,
      maxTokens: request.options?.maxTokens,
      model: request.options?.model,
    });

    // 6. Extract insights from conversation
    const insights = extractInsights(request.prompt, result.content);

    // 7. Update session
    const sessionId = await upsertConversationSession(request.userId, 'soul', {
      tokensUsed: result.tokensUsed,
      context: {
        selectedCategory: userContext.currentArchetype,
        keyTopics: insights.topics,
        sentimentTrend: insights.sentiment === 'negative' ? 'challenging' : insights.sentiment,
      },
    });

    // 8. Save to conversation memory
    await saveConversationMemory({
      userId: request.userId,
      domain: 'soul',
      message: { role: 'user', content: request.prompt },
      insights: insights,
      sessionId,
    });

    await saveConversationMemory({
      userId: request.userId,
      domain: 'soul',
      message: { role: 'assistant', content: result.content, tokensUsed: result.tokensUsed },
      insights: insights,
      sessionId,
    });

    // 9. Update user preferences if archetype mentioned
    if (userContext.currentArchetype) {
      const prefs = await getUserPreferences(request.userId);
      const exploredArchetypes = prefs.soul.exploredArchetypes || [];
      if (!exploredArchetypes.includes(userContext.currentArchetype)) {
        await updateDomainPreferences(request.userId, 'soul', {
          ...prefs.soul,
          exploredArchetypes: [...exploredArchetypes, userContext.currentArchetype],
        });
      }
    }

    // 10. Log interaction to Firestore
    await logInteraction({
      userId: request.userId,
      domain: 'soul',
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
    console.error('Soul Handler Error:', error);
    
    return {
      success: false,
      error: {
        code: 'SOUL_HANDLER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to process soul request'
      }
    };
  }
}

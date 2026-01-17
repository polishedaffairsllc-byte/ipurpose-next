/**
 * GPT Core Logic
 * Real OpenAI API calls with streaming support
 */

import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { getOpenAI, OPENAI_CONFIG, validateOpenAIKey } from './openai-client';
import { checkRateLimit, recordRequest } from './rate-limiter';
import type { GPTDomain, CompiledPrompt } from '../types';

export interface GPTCallOptions {
  userId: string;
  domain: GPTDomain;
  compiledPrompt: CompiledPrompt;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  model?: string;
}

export interface GPTCallResult {
  content: string;
  tokensUsed: number;
  model: string;
  finishReason: string;
}

/**
 * Call OpenAI API with compiled prompt
 */
export async function callGPT(options: GPTCallOptions): Promise<GPTCallResult> {
  // 1. Validate API key
  if (!validateOpenAIKey()) {
    throw new Error('OpenAI API key not configured');
  }

  // 2. Check rate limits
  const rateLimitCheck = await checkRateLimit(options.userId);
  if (!rateLimitCheck.allowed) {
    throw new Error(rateLimitCheck.reason || 'Rate limit exceeded');
  }

  // 3. Prepare messages
  const messages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: options.compiledPrompt.systemPrompt,
    },
    {
      role: 'user',
      content: options.compiledPrompt.userPrompt,
    },
  ];

  // 4. Get configuration
  const model = options.model || OPENAI_CONFIG.DEFAULT_MODEL;
  const temperature = options.temperature ?? OPENAI_CONFIG.TEMPERATURE[options.domain];
  const maxTokens = Math.min(
    options.maxTokens || OPENAI_CONFIG.MAX_RESPONSE_TOKENS,
    OPENAI_CONFIG.MAX_RESPONSE_TOKENS
  );

  try {
    // 5. Make OpenAI API call
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: false, // Non-streaming for this function
    });

    const choice = completion.choices[0];
    const content = choice.message.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;

    // 6. Record request for rate limiting
    await recordRequest(options.userId, tokensUsed);

    // 7. Return result
    return {
      content,
      tokensUsed,
      model: completion.model,
      finishReason: choice.finish_reason || 'stop',
    };
  } catch (error) {
    console.error('OpenAI API call failed:', error);
    
    // Handle specific OpenAI errors
    if (error instanceof OpenAI.APIError) {
      if (error.status === 429) {
        throw new Error('OpenAI rate limit exceeded. Please try again later.');
      }
      if (error.status === 401) {
        throw new Error('OpenAI API authentication failed');
      }
      if (error.status === 500) {
        throw new Error('OpenAI service error. Please try again.');
      }
    }
    
    throw new Error('Failed to generate response. Please try again.');
  }
}

/**
 * Call OpenAI API with streaming
 */
export async function* callGPTStream(
  options: GPTCallOptions
): AsyncGenerator<string, GPTCallResult, undefined> {
  // 1. Validate API key
  if (!validateOpenAIKey()) {
    throw new Error('OpenAI API key not configured');
  }

  // 2. Check rate limits
  const rateLimitCheck = await checkRateLimit(options.userId);
  if (!rateLimitCheck.allowed) {
    throw new Error(rateLimitCheck.reason || 'Rate limit exceeded');
  }

  // 3. Prepare messages
  const messages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: options.compiledPrompt.systemPrompt,
    },
    {
      role: 'user',
      content: options.compiledPrompt.userPrompt,
    },
  ];

  // 4. Get configuration
  const model = options.model || OPENAI_CONFIG.DEFAULT_MODEL;
  const temperature = options.temperature ?? OPENAI_CONFIG.TEMPERATURE[options.domain];
  const maxTokens = Math.min(
    options.maxTokens || OPENAI_CONFIG.MAX_RESPONSE_TOKENS,
    OPENAI_CONFIG.MAX_RESPONSE_TOKENS
  );

  try {
    // 5. Make streaming OpenAI API call
    const openai = getOpenAI();
    const stream = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    });

    let fullContent = '';
    let finishReason = 'stop';

    // 6. Stream chunks
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      const content = delta?.content || '';
      
      if (content) {
        fullContent += content;
        yield content;
      }

      if (chunk.choices[0]?.finish_reason) {
        finishReason = chunk.choices[0].finish_reason;
      }
    }

    // 7. Estimate tokens (streaming doesn't return usage)
    const tokensUsed = estimateTokens(fullContent, options.compiledPrompt.systemPrompt);

    // 8. Record request for rate limiting
    await recordRequest(options.userId, tokensUsed);

    // 9. Return final result
    return {
      content: fullContent,
      tokensUsed,
      model,
      finishReason,
    };
  } catch (error) {
    console.error('OpenAI streaming API call failed:', error);
    
    // Handle specific OpenAI errors
    if (error instanceof OpenAI.APIError) {
      if (error.status === 429) {
        throw new Error('OpenAI rate limit exceeded. Please try again later.');
      }
      if (error.status === 401) {
        throw new Error('OpenAI API authentication failed');
      }
      if (error.status === 500) {
        throw new Error('OpenAI service error. Please try again.');
      }
    }
    
    throw new Error('Failed to generate response. Please try again.');
  }
}

/**
 * Estimate token count (rough approximation)
 * Real token counting requires tiktoken library
 */
function estimateTokens(content: string, systemPrompt: string): number {
  // Rough estimate: 1 token ≈ 4 characters
  const totalChars = content.length + systemPrompt.length;
  return Math.ceil(totalChars / 4);
}

/**
 * Validate prompt length
 */
export function validatePromptLength(prompt: string): boolean {
  return prompt.length <= OPENAI_CONFIG.MAX_PROMPT_LENGTH;
}

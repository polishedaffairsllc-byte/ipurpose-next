/**
 * OpenAI Client Configuration
 * Centralized OpenAI API client with safety guards
 */

import OpenAI from 'openai';

// Validate environment variables
if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️  OPENAI_API_KEY not found in environment variables');
}

/**
 * OpenAI client instance
 */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 * OpenAI Configuration Constants
 */
export const OPENAI_CONFIG = {
  // Default model settings
  DEFAULT_MODEL: 'gpt-4-turbo-preview',
  FALLBACK_MODEL: 'gpt-3.5-turbo',
  
  // Token limits by model
  MAX_TOKENS: {
    'gpt-4-turbo-preview': 4096,
    'gpt-4': 8192,
    'gpt-3.5-turbo': 4096,
  } as Record<string, number>,
  
  // Temperature defaults by domain
  TEMPERATURE: {
    soul: 0.7,      // Balanced for wisdom & creativity
    systems: 0.5,   // More focused for practical advice
    'ai-tools': 0.8, // Higher creativity for content
    insights: 0.4,  // Lower for analytical consistency
  } as Record<string, number>,
  
  // Rate limiting
  RATE_LIMITS: {
    requestsPerMinute: 60,
    tokensPerMinute: 90000,
    requestsPerDay: 1000,
    tokensPerDay: 500000,
  },
  
  // Safety guards
  MAX_PROMPT_LENGTH: 8000,
  MAX_RESPONSE_TOKENS: 2000,
  TIMEOUT_MS: 30000,
} as const;

/**
 * Validate OpenAI API key
 */
export function validateOpenAIKey(): boolean {
  return !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 0;
}

/**
 * Get model token limit
 */
export function getModelTokenLimit(model: string): number {
  return OPENAI_CONFIG.MAX_TOKENS[model] || OPENAI_CONFIG.MAX_TOKENS['gpt-3.5-turbo'];
}

/**
 * Check if OpenAI is available
 */
export async function checkOpenAIHealth(): Promise<boolean> {
  if (!validateOpenAIKey()) {
    return false;
  }
  
  try {
    // Simple test call to verify API key
    await openai.models.list();
    return true;
  } catch (error) {
    console.error('OpenAI health check failed:', error);
    return false;
  }
}

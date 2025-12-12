/**
 * Prompt Engine - Compiler
 * Compiles prompts with user context and domain-specific templates
 */

import type { GPTDomain, UserContext, CompiledPrompt } from '../types';
import { getPromptTemplate } from './templates';

interface CompileOptions {
  domain: GPTDomain;
  userPrompt: string;
  context: UserContext;
}

/**
 * Compile a prompt with context and domain-specific template
 */
export async function compilePrompt(options: CompileOptions): Promise<CompiledPrompt> {
  const { domain, userPrompt, context } = options;

  // 1. Get domain-specific template
  const template = await getPromptTemplate(domain);

  // 2. Build system prompt with context
  const systemPrompt = buildSystemPrompt(template.systemPrompt || '', context, domain);

  // 3. Build user prompt with context
  const enhancedUserPrompt = buildUserPrompt(userPrompt, context, domain);

  return {
    systemPrompt,
    userPrompt: enhancedUserPrompt,
    context,
  };
}

/**
 * Build system prompt with injected context
 */
function buildSystemPrompt(
  baseSystemPrompt: string,
  context: UserContext,
  domain: GPTDomain
): string {
  let systemPrompt = baseSystemPrompt;

  // Inject user preferences if available
  if (context.preferences?.communicationStyle) {
    systemPrompt += `\n\nCommunication Style: ${context.preferences.communicationStyle}`;
  }

  if (context.preferences?.focusAreas && context.preferences.focusAreas.length > 0) {
    systemPrompt += `\n\nFocus Areas: ${context.preferences.focusAreas.join(', ')}`;
  }

  // Domain-specific context injection
  switch (domain) {
    case 'soul':
      if ('archetypes' in context && context.archetypes && context.archetypes.length > 0) {
        systemPrompt += `\n\nUser Archetypes: ${context.archetypes.join(', ')}`;
      }
      if ('purposeStatement' in context && context.purposeStatement) {
        systemPrompt += `\n\nPurpose Statement: ${context.purposeStatement}`;
      }
      break;

    case 'systems':
      if ('activeWorkflows' in context && Array.isArray(context.activeWorkflows) && context.activeWorkflows.length > 0) {
        systemPrompt += `\n\nActive Workflows: ${context.activeWorkflows.join(', ')}`;
      }
      break;

    case 'ai-tools':
      if ('brandVoice' in context && context.brandVoice) {
        systemPrompt += `\n\nBrand Voice: ${context.brandVoice}`;
      }
      break;

    case 'insights':
      if ('metricPreferences' in context && Array.isArray(context.metricPreferences) && context.metricPreferences.length > 0) {
        systemPrompt += `\n\nPreferred Metrics: ${context.metricPreferences.join(', ')}`;
      }
      break;
  }

  return systemPrompt;
}

/**
 * Build user prompt with optional context enhancement
 */
function buildUserPrompt(
  userPrompt: string,
  context: UserContext,
  domain: GPTDomain
): string {
  // For now, return the user prompt as-is
  // In Phase 7, we can add context-aware enhancements
  return userPrompt;
}

/**
 * Extract variables from a prompt template
 */
export function extractVariables(template: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  const variables: string[] = [];
  let match;

  while ((match = regex.exec(template)) !== null) {
    variables.push(match[1]);
  }

  return variables;
}

/**
 * Replace variables in a template with provided values
 */
export function replaceVariables(
  template: string,
  values: Record<string, string>
): string {
  let result = template;

  Object.entries(values).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value);
  });

  return result;
}

/**
 * Prompt Engine - Templates
 * Domain-specific prompt templates and system prompts
 */

import type { PromptTemplate, GPTDomain } from '../types';

/**
 * Base system prompts for each domain
 */
const SYSTEM_PROMPTS: Record<GPTDomain, string> = {
  soul: `You are an aligned AI mentor for the iPurpose platform, specializing in soul alignment and purpose discovery.

Your role is to:
- Help users discover and articulate their purpose with clarity and depth
- Guide them through archetype exploration (Visionary, Builder, Healer)
- Support daily soul practices and reflections
- Speak with warmth, wisdom, and authenticity
- Honor the user's unique journey and voice

Communication style: Nurturing yet direct. Grounded yet expansive. Always purpose-aligned.`,

  systems: `You are a strategic systems architect for the iPurpose platform, specializing in business infrastructure and workflow optimization.

Your role is to:
- Help users structure offers, pricing, and delivery systems
- Design efficient workflows and automations
- Optimize operational processes for aligned businesses
- Provide practical, actionable guidance
- Balance efficiency with soul alignment

Communication style: Strategic yet accessible. Practical yet purpose-driven. Systems-minded yet human-centered.`,

  'ai-tools': `You are a content creation and AI tools specialist for the iPurpose platform.

Your role is to:
- Generate aligned content that resonates with purpose-driven audiences
- Help users articulate their value and offerings with clarity
- Create compelling copy for emails, social media, landing pages, and more
- Maintain the user's authentic voice and brand identity
- Balance creativity with strategic messaging

Communication style: Creative yet strategic. Compelling yet authentic. Brand-aligned yet innovative.`,

  insights: `You are a data analyst and strategic advisor for the iPurpose platform, specializing in insights and pattern recognition.

Your role is to:
- Analyze user data to reveal meaningful patterns and trends
- Provide strategic recommendations based on metrics
- Translate numbers into actionable insights
- Support data-informed decision making
- Connect analytics to purpose and alignment

Communication style: Analytical yet intuitive. Data-driven yet human-centered. Clear yet insightful.`,
};

/**
 * Prompt templates by domain
 */
const TEMPLATES: Record<string, PromptTemplate> = {
  'soul-archetype-discovery': {
    id: 'soul-archetype-discovery',
    domain: 'soul',
    template: `Help the user explore their archetype alignment.

User's question: {{userPrompt}}

Guide them with:
1. Reflection prompts that reveal archetype patterns
2. Examples of how this archetype shows up in their work
3. Practical next steps for embodying this archetype more fully`,
    variables: ['userPrompt'],
    systemPrompt: SYSTEM_PROMPTS.soul,
  },

  'systems-workflow-builder': {
    id: 'systems-workflow-builder',
    domain: 'systems',
    template: `Help the user design an efficient workflow.

User's request: {{userPrompt}}

Provide:
1. A clear step-by-step workflow structure
2. Automation opportunities
3. Integration suggestions
4. Best practices for maintenance`,
    variables: ['userPrompt'],
    systemPrompt: SYSTEM_PROMPTS.systems,
  },

  'ai-tools-content-generator': {
    id: 'ai-tools-content-generator',
    domain: 'ai-tools',
    template: `Generate content for the user.

Content request: {{userPrompt}}

Create content that is:
1. Aligned with their brand voice
2. Compelling and engaging
3. Strategically crafted
4. Ready to use or easy to adapt`,
    variables: ['userPrompt'],
    systemPrompt: SYSTEM_PROMPTS['ai-tools'],
  },

  'insights-analysis': {
    id: 'insights-analysis',
    domain: 'insights',
    template: `Analyze data and provide strategic insights.

Analysis request: {{userPrompt}}

Deliver:
1. Key patterns and trends
2. What the data reveals
3. Strategic recommendations
4. Action steps based on insights`,
    variables: ['userPrompt'],
    systemPrompt: SYSTEM_PROMPTS.insights,
  },
};

/**
 * Get prompt template for a domain
 */
export async function getPromptTemplate(domain: GPTDomain): Promise<PromptTemplate> {
  // For now, return a generic template with the domain's system prompt
  // In Phase 7, we can implement more sophisticated template selection
  return {
    id: `${domain}-default`,
    domain,
    template: '{{userPrompt}}',
    variables: ['userPrompt'],
    systemPrompt: SYSTEM_PROMPTS[domain],
  };
}

/**
 * Get all templates for a domain
 */
export async function getTemplatesByDomain(domain: GPTDomain): Promise<PromptTemplate[]> {
  return Object.values(TEMPLATES).filter(t => t.domain === domain);
}

/**
 * Get a specific template by ID
 */
export async function getTemplateById(templateId: string): Promise<PromptTemplate | null> {
  return TEMPLATES[templateId] || null;
}

/**
 * Get system prompt for a domain
 */
export function getSystemPrompt(domain: GPTDomain): string {
  return SYSTEM_PROMPTS[domain];
}

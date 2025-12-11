/**
 * Prompt Enrichment Engine
 * Automatically enriches user prompts with context from preferences and history
 */

import type { GPTDomain } from '../types';
import type { EnrichedPromptContext, ContextEnrichmentResult } from '../types/preferences';
import { getUserPreferences, getRecentMemory, getCrossDomainInsights } from './preferences';

/**
 * Build enriched context for a user and domain
 */
export async function buildEnrichedContext(
  userId: string,
  domain: GPTDomain,
  currentFocus?: string
): Promise<EnrichedPromptContext> {
  try {
    const [preferences, recentMemory, crossDomainInsights] = await Promise.all([
      getUserPreferences(userId),
      getRecentMemory(userId, domain, 5),
      getCrossDomainInsights(userId, 15),
    ]);

    // Extract preferences - map domain to preferences key
    const domainKey = domain === 'ai-tools' ? 'aiTools' : domain;
    const domainPrefs = preferences[domainKey as keyof typeof preferences];
    const generalPrefs = preferences.general;

    // Build context object
    const context: EnrichedPromptContext = {
      preferences: {},
      recentTopics: [],
      recentInsights: [],
      crossDomain: {
        commonThemes: crossDomainInsights.commonThemes,
      },
      currentSession: {},
    };

    // Add domain-specific preferences
    if (domain === 'soul' && typeof domainPrefs !== 'string' && 'primaryArchetype' in domainPrefs) {
      context.preferences.archetype = domainPrefs.primaryArchetype;
      context.crossDomain.soulAlignment = domainPrefs.purposeStatement;
    } else if (domain === 'systems' && typeof domainPrefs !== 'string' && 'workflowPreferences' in domainPrefs) {
      context.preferences.workStyle = domainPrefs.workflowPreferences?.workStyle;
      context.crossDomain.activeSystems = domainPrefs.activeSystems;
    } else if (domain === 'ai-tools' && typeof domainPrefs !== 'string' && 'writingStyle' in domainPrefs) {
      context.preferences.writingStyle = domainPrefs.writingStyle;
      context.preferences.tone = domainPrefs.tonePreference;
    }

    // Add recent topics and insights
    const recentTopics = recentMemory.flatMap(m => m.insights?.topics || []);
    context.recentTopics = [...new Set(recentTopics)].slice(0, 5);

    const recentInsights = recentMemory.flatMap(m => m.insights?.actionItems || []);
    context.recentInsights = recentInsights.slice(0, 3);

    // Add session context
    if (currentFocus) {
      context.currentSession.focus = currentFocus;
    }
    context.currentSession.previousMessages = recentMemory.length;

    return context;
  } catch (error) {
    console.error('Error building enriched context:', error);
    // Return minimal context on error
    return {
      preferences: {},
      recentTopics: [],
      recentInsights: [],
      crossDomain: {},
      currentSession: {},
    };
  }
}

/**
 * Enrich a user prompt with context
 */
export async function enrichPrompt(
  userId: string,
  domain: GPTDomain,
  originalPrompt: string,
  currentFocus?: string
): Promise<ContextEnrichmentResult> {
  try {
    const context = await buildEnrichedContext(userId, domain, currentFocus);
    const addedContext: string[] = [];
    let enrichedPrompt = originalPrompt;

    // Check if enrichment is enabled
    const preferences = await getUserPreferences(userId);
    if (!preferences.general.enableCrossContext) {
      return {
        originalPrompt,
        enrichedPrompt: originalPrompt,
        addedContext: [],
        relevanceScore: 0,
      };
    }

    // Add user preference context
    const prefContext = buildPreferenceContext(domain, context);
    if (prefContext) {
      enrichedPrompt = `${prefContext}\n\n${enrichedPrompt}`;
      addedContext.push('user_preferences');
    }

    // Add recent conversation context
    if (context.recentTopics.length > 0) {
      const topicsText = `Recent topics we've discussed: ${context.recentTopics.join(', ')}`;
      enrichedPrompt = `${topicsText}\n\n${enrichedPrompt}`;
      addedContext.push('recent_topics');
    }

    // Add cross-domain insights
    if (context.crossDomain.commonThemes && context.crossDomain.commonThemes.length > 0) {
      const themesText = `Your recurring themes: ${context.crossDomain.commonThemes.join(', ')}`;
      enrichedPrompt = `${themesText}\n\n${enrichedPrompt}`;
      addedContext.push('common_themes');
    }

    // Add current session focus
    if (context.currentSession.focus) {
      const focusText = `Current focus: ${context.currentSession.focus}`;
      enrichedPrompt = `${focusText}\n\n${enrichedPrompt}`;
      addedContext.push('session_focus');
    }

    // Calculate relevance score (0-1)
    const relevanceScore = calculateRelevanceScore(addedContext, context);

    return {
      originalPrompt,
      enrichedPrompt,
      addedContext,
      relevanceScore,
    };
  } catch (error) {
    console.error('Error enriching prompt:', error);
    return {
      originalPrompt,
      enrichedPrompt: originalPrompt,
      addedContext: [],
      relevanceScore: 0,
    };
  }
}

/**
 * Build preference context string
 */
function buildPreferenceContext(domain: GPTDomain, context: EnrichedPromptContext): string | null {
  const parts: string[] = [];

  if (domain === 'soul' && context.preferences.archetype) {
    parts.push(`User's primary archetype: ${context.preferences.archetype}`);
    if (context.crossDomain.soulAlignment) {
      parts.push(`Purpose statement: ${context.crossDomain.soulAlignment}`);
    }
  }

  if (domain === 'systems' && context.preferences.workStyle) {
    parts.push(`Work style preference: ${context.preferences.workStyle}`);
    if (context.crossDomain.activeSystems && context.crossDomain.activeSystems.length > 0) {
      parts.push(`Active systems: ${context.crossDomain.activeSystems.join(', ')}`);
    }
  }

  if (domain === 'ai-tools') {
    if (context.preferences.writingStyle) {
      parts.push(`Writing style: ${context.preferences.writingStyle}`);
    }
    if (context.preferences.tone) {
      parts.push(`Tone preference: ${context.preferences.tone}`);
    }
  }

  return parts.length > 0 ? parts.join('. ') : null;
}

/**
 * Calculate relevance score based on context richness
 */
function calculateRelevanceScore(
  addedContext: string[],
  context: EnrichedPromptContext
): number {
  let score = 0;

  // Base score for any context
  if (addedContext.length > 0) score += 0.2;

  // Score for preferences
  if (addedContext.includes('user_preferences')) score += 0.3;

  // Score for recent topics
  if (addedContext.includes('recent_topics') && context.recentTopics.length >= 3) {
    score += 0.2;
  }

  // Score for common themes
  if (addedContext.includes('common_themes') && context.crossDomain.commonThemes && context.crossDomain.commonThemes.length >= 3) {
    score += 0.2;
  }

  // Score for session focus
  if (addedContext.includes('session_focus')) score += 0.1;

  return Math.min(score, 1.0);
}

/**
 * Extract insights from a conversation message
 */
export function extractInsights(
  userPrompt: string,
  assistantResponse: string
): {
  keywords: string[];
  topics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  actionItems: string[];
} {
  // Simple keyword extraction (can be enhanced with NLP later)
  const keywords = extractKeywords(userPrompt + ' ' + assistantResponse);
  
  // Topic extraction based on domain keywords
  const topics = extractTopics(userPrompt + ' ' + assistantResponse);
  
  // Basic sentiment analysis
  const sentiment = analyzeSentiment(assistantResponse);
  
  // Extract action items (sentences with action verbs)
  const actionItems = extractActionItems(assistantResponse);

  return {
    keywords: keywords.slice(0, 10),
    topics: topics.slice(0, 5),
    sentiment,
    actionItems: actionItems.slice(0, 3),
  };
}

/**
 * Extract keywords from text
 */
function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
    'i', 'you', 'we', 'they', 'he', 'she', 'it', 'my', 'your', 'our',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));

  // Count frequency
  const frequency: Record<string, number> = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  // Sort by frequency
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);
}

/**
 * Extract topics based on domain keywords
 */
function extractTopics(text: string): string[] {
  const lowerText = text.toLowerCase();
  const topics: string[] = [];

  const topicPatterns: Record<string, string[]> = {
    'purpose': ['purpose', 'mission', 'calling', 'vision'],
    'workflow': ['workflow', 'process', 'routine', 'system'],
    'archetype': ['visionary', 'healer', 'creator', 'guide', 'archetype'],
    'boundaries': ['boundary', 'boundaries', 'limits', 'capacity'],
    'offers': ['offer', 'service', 'package', 'pricing'],
    'content': ['content', 'writing', 'blog', 'email', 'newsletter'],
    'alignment': ['alignment', 'align', 'balance', 'harmony'],
    'growth': ['growth', 'progress', 'improvement', 'development'],
  };

  Object.entries(topicPatterns).forEach(([topic, patterns]) => {
    if (patterns.some(pattern => lowerText.includes(pattern))) {
      topics.push(topic);
    }
  });

  return topics;
}

/**
 * Analyze sentiment of text
 */
function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const lowerText = text.toLowerCase();
  
  const positiveWords = [
    'great', 'good', 'excellent', 'amazing', 'wonderful', 'fantastic',
    'love', 'perfect', 'success', 'achieve', 'accomplish', 'thrive',
  ];
  
  const negativeWords = [
    'bad', 'poor', 'terrible', 'difficult', 'struggle', 'challenge',
    'problem', 'issue', 'concern', 'worry', 'frustrate', 'stuck',
  ];

  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

/**
 * Extract action items from text
 */
function extractActionItems(text: string): string[] {
  const sentences = text.split(/[.!?]+/);
  const actionVerbs = [
    'create', 'build', 'design', 'implement', 'develop', 'establish',
    'start', 'begin', 'initiate', 'launch', 'set up', 'organize',
    'review', 'analyze', 'assess', 'evaluate', 'consider', 'explore',
  ];

  const actionItems = sentences.filter(sentence => {
    const lowerSentence = sentence.toLowerCase();
    return actionVerbs.some(verb => lowerSentence.includes(verb));
  }).map(sentence => sentence.trim());

  return actionItems.filter(item => item.length > 0);
}

/**
 * User Preferences and State Types
 * Defines schemas for cross-page GPT context integration
 */

export interface UserPreferences {
  userId: string;
  createdAt: Date;
  updatedAt: Date;

  // Soul preferences
  soul: {
    primaryArchetype?: string;
    secondaryArchetype?: string;
    exploredArchetypes: string[];
    purposeStatement?: string;
    coreValues: string[];
    lastUpdated: Date;
  };

  // Systems preferences
  systems: {
    activeSystems: string[];
    completedSystems: string[];
    systemsPriority: string[];
    workflowPreferences: {
      workStyle?: 'structured' | 'flexible' | 'hybrid';
      decisionStyle?: 'data-driven' | 'intuitive' | 'balanced';
    };
    lastUpdated: Date;
  };

  // AI Tools preferences
  aiTools: {
    favoriteTools: string[];
    writingStyle?: 'professional' | 'casual' | 'creative' | 'technical';
    tonePreference?: 'warm' | 'direct' | 'inspirational' | 'analytical';
    commonTopics: string[];
    lastUpdated: Date;
  };

  // Insights preferences
  insights: {
    trackedMetrics: string[];
    dashboardLayout?: string[];
    insightFrequency?: 'daily' | 'weekly' | 'monthly';
    lastUpdated: Date;
  };

  // General preferences
  general: {
    temperature?: number;
    maxTokens?: number;
    preferredModel?: string;
    enableMemory: boolean;
    enableCrossContext: boolean;
  };
}

export interface ConversationSession {
  sessionId: string;
  userId: string;
  domain: 'soul' | 'systems' | 'ai-tools' | 'insights';
  startedAt: Date;
  lastActivityAt: Date;
  messageCount: number;
  tokensUsed: number;
  
  // Session context
  context: {
    selectedCategory?: string;
    currentFocus?: string;
    keyTopics: string[];
    sentimentTrend?: 'positive' | 'neutral' | 'challenging';
  };

  // Session metadata
  metadata: {
    deviceType?: string;
    sessionDuration?: number;
    completed: boolean;
  };
}

export interface ConversationMemory {
  userId: string;
  domain: 'soul' | 'systems' | 'ai-tools' | 'insights';
  timestamp: Date;

  // Message content
  message: {
    role: 'user' | 'assistant';
    content: string;
    tokensUsed?: number;
  };

  // Extracted insights
  insights: {
    keywords: string[];
    topics: string[];
    sentiment?: 'positive' | 'neutral' | 'negative';
    actionItems?: string[];
  };

  // Session reference
  sessionId: string;
}

export interface EnrichedPromptContext {
  // User preferences
  preferences: {
    archetype?: string;
    workStyle?: string;
    writingStyle?: string;
    tone?: string;
  };

  // Recent conversation context
  recentTopics: string[];
  recentInsights: string[];
  
  // Cross-domain context
  crossDomain: {
    soulAlignment?: string;
    activeSystems?: string[];
    commonThemes?: string[];
  };

  // Session context
  currentSession: {
    focus?: string;
    previousMessages?: number;
    sessionDuration?: number;
  };
}

export interface ContextEnrichmentResult {
  originalPrompt: string;
  enrichedPrompt: string;
  addedContext: string[];
  relevanceScore: number;
}

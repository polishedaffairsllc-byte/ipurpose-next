/**
 * User Preferences Service
 * Manages user preferences, state storage, and session tracking
 */

import { firebaseAdmin } from '@/lib/firebaseAdmin';
import type { UserPreferences, ConversationSession, ConversationMemory } from '../types/preferences';
import type { GPTDomain } from '../types';

const db = firebaseAdmin.firestore();

/**
 * Get user preferences
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  try {
    const doc = await db.collection('user-preferences').doc(userId).get();

    if (!doc.exists) {
      // Create default preferences
      const defaultPrefs: UserPreferences = {
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        soul: {
          exploredArchetypes: [],
          coreValues: [],
          lastUpdated: new Date(),
        },
        systems: {
          activeSystems: [],
          completedSystems: [],
          systemsPriority: [],
          workflowPreferences: {},
          lastUpdated: new Date(),
        },
        aiTools: {
          favoriteTools: [],
          commonTopics: [],
          lastUpdated: new Date(),
        },
        insights: {
          trackedMetrics: [],
          lastUpdated: new Date(),
        },
        general: {
          enableMemory: true,
          enableCrossContext: true,
        },
      };

      await db.collection('user-preferences').doc(userId).set(defaultPrefs);
      return defaultPrefs;
    }

    return doc.data() as UserPreferences;
  } catch (error) {
    console.error('Error getting user preferences:', error);
    throw error;
  }
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  userId: string,
  updates: Partial<UserPreferences>
): Promise<void> {
  try {
    await db.collection('user-preferences').doc(userId).update({
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
}

/**
 * Update domain-specific preferences
 */
export async function updateDomainPreferences(
  userId: string,
  domain: GPTDomain,
  updates: any
): Promise<void> {
  try {
    const updatePath = `${domain}.lastUpdated`;
    await db.collection('user-preferences').doc(userId).update({
      [domain]: updates,
      [updatePath]: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating domain preferences:', error);
    throw error;
  }
}

/**
 * Create or update conversation session
 */
export async function upsertConversationSession(
  userId: string,
  domain: GPTDomain,
  sessionData: Partial<ConversationSession>
): Promise<string> {
  try {
    const sessionId = sessionData.sessionId || `${userId}-${domain}-${Date.now()}`;
    
    const sessionRef = db.collection('conversation-sessions').doc(sessionId);
    const existing = await sessionRef.get();

    if (existing.exists) {
      // Update existing session
      await sessionRef.update({
        lastActivityAt: new Date(),
        messageCount: firebaseAdmin.firestore.FieldValue.increment(1),
        tokensUsed: firebaseAdmin.firestore.FieldValue.increment(sessionData.tokensUsed || 0),
        ...sessionData,
      });
    } else {
      // Create new session
      const newSession: ConversationSession = {
        sessionId,
        userId,
        domain,
        startedAt: new Date(),
        lastActivityAt: new Date(),
        messageCount: 1,
        tokensUsed: sessionData.tokensUsed || 0,
        context: sessionData.context || {
          keyTopics: [],
        },
        metadata: {
          completed: false,
        },
      };

      await sessionRef.set(newSession);
    }

    return sessionId;
  } catch (error) {
    console.error('Error upserting conversation session:', error);
    throw error;
  }
}

/**
 * Get active session for user and domain
 */
export async function getActiveSession(
  userId: string,
  domain: GPTDomain
): Promise<ConversationSession | null> {
  try {
    const snapshot = await db
      .collection('conversation-sessions')
      .where('userId', '==', userId)
      .where('domain', '==', domain)
      .where('metadata.completed', '==', false)
      .orderBy('lastActivityAt', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    return snapshot.docs[0].data() as ConversationSession;
  } catch (error) {
    console.error('Error getting active session:', error);
    return null;
  }
}

/**
 * Save conversation message to memory
 */
export async function saveConversationMemory(
  memory: Omit<ConversationMemory, 'timestamp'>
): Promise<void> {
  try {
    const memoryWithTimestamp: ConversationMemory = {
      ...memory,
      timestamp: new Date(),
    };

    await db.collection('conversation-memory').add(memoryWithTimestamp);
  } catch (error) {
    console.error('Error saving conversation memory:', error);
    throw error;
  }
}

/**
 * Get recent conversation memory for a domain
 */
export async function getRecentMemory(
  userId: string,
  domain: GPTDomain,
  limit: number = 10
): Promise<ConversationMemory[]> {
  try {
    const snapshot = await db
      .collection('conversation-memory')
      .where('userId', '==', userId)
      .where('domain', '==', domain)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => doc.data() as ConversationMemory);
  } catch (error) {
    console.error('Error getting recent memory:', error);
    return [];
  }
}

/**
 * Get cross-domain insights
 */
export async function getCrossDomainInsights(
  userId: string,
  limit: number = 20
): Promise<{
  commonThemes: string[];
  recentTopics: string[];
  sentimentTrend: string;
}> {
  try {
    const snapshot = await db
      .collection('conversation-memory')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    const memories = snapshot.docs.map(doc => doc.data() as ConversationMemory);

    // Extract insights
    const allTopics = memories.flatMap(m => m.insights?.topics || []);
    const allKeywords = memories.flatMap(m => m.insights?.keywords || []);

    // Count frequency
    const topicFrequency: Record<string, number> = {};
    allTopics.forEach(topic => {
      topicFrequency[topic] = (topicFrequency[topic] || 0) + 1;
    });

    const commonThemes = Object.entries(topicFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic]) => topic);

    // Recent unique topics
    const recentTopics = [...new Set(allTopics.slice(0, 10))];

    // Sentiment analysis
    const sentiments = memories
      .map(m => m.insights?.sentiment)
      .filter(Boolean);
    const positiveCount = sentiments.filter(s => s === 'positive').length;
    const negativeCount = sentiments.filter(s => s === 'negative').length;

    let sentimentTrend = 'neutral';
    if (positiveCount > negativeCount * 1.5) sentimentTrend = 'positive';
    else if (negativeCount > positiveCount * 1.5) sentimentTrend = 'challenging';

    return {
      commonThemes,
      recentTopics,
      sentimentTrend,
    };
  } catch (error) {
    console.error('Error getting cross-domain insights:', error);
    return {
      commonThemes: [],
      recentTopics: [],
      sentimentTrend: 'neutral',
    };
  }
}

/**
 * Complete a session
 */
export async function completeSession(sessionId: string): Promise<void> {
  try {
    await db.collection('conversation-sessions').doc(sessionId).update({
      'metadata.completed': true,
      'metadata.sessionDuration': firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error completing session:', error);
    throw error;
  }
}

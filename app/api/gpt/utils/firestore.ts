/**
 * Firestore Interaction Logging
 * Logs GPT interactions for analytics and context building
 */

import { firebaseAdmin } from '@/lib/firebaseAdmin';
import type { GPTInteraction, GPTDomain, UserContext } from '../types';

// Lazy getter to defer Firestore initialization to request time
function getDb() {
  return firebaseAdmin.firestore();
}

/**
 * Log a GPT interaction to Firestore
 */
export async function logInteraction(params: {
  userId: string;
  domain: GPTDomain;
  prompt: string;
  response: string;
  tokensUsed: number;
  context?: UserContext;
  model?: string;
  finishReason?: string;
  temperature?: number;
  streamEnabled?: boolean;
}): Promise<void> {
  try {
    const db = getDb();
    const collection = db.collection('gpt-interactions');
    
    const interaction: Omit<GPTInteraction, 'id'> & {
      model?: string;
      finishReason?: string;
      temperature?: number;
      streamEnabled?: boolean;
    } = {
      userId: params.userId,
      domain: params.domain,
      prompt: params.prompt,
      response: params.response,
      tokensUsed: params.tokensUsed,
      timestamp: new Date(),
      context: params.context,
      model: params.model,
      finishReason: params.finishReason,
      temperature: params.temperature,
      streamEnabled: params.streamEnabled,
    };

    await collection.add(interaction);
  } catch (error) {
    console.error('Error logging GPT interaction:', error);
    // Don't throw - logging failures shouldn't break the API
  }
}

/**
 * Get user's interaction history for a specific domain
 */
export async function getInteractionHistory(
  userId: string,
  domain?: GPTDomain,
  limit: number = 10
): Promise<GPTInteraction[]> {
  try {
    let query = db
      .collection('gpt-interactions')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit);

    if (domain) {
      query = query.where('domain', '==', domain);
    }

    const snapshot = await query.get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as GPTInteraction));
  } catch (error) {
    console.error('Error fetching interaction history:', error);
    return [];
  }
}

/**
 * Get token usage statistics for a user
 */
export async function getTokenUsage(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<{ total: number; byDomain: Record<GPTDomain, number> }> {
  try {
    let query = db
      .collection('gpt-interactions')
      .where('userId', '==', userId);

    if (startDate) {
      query = query.where('timestamp', '>=', startDate);
    }
    if (endDate) {
      query = query.where('timestamp', '<=', endDate);
    }

    const snapshot = await query.get();
    
    const stats = {
      total: 0,
      byDomain: {
        soul: 0,
        systems: 0,
        'ai-tools': 0,
        insights: 0,
      } as Record<GPTDomain, number>,
    };

    snapshot.docs.forEach(doc => {
      const data = doc.data() as GPTInteraction;
      stats.total += data.tokensUsed;
      stats.byDomain[data.domain] = (stats.byDomain[data.domain] || 0) + data.tokensUsed;
    });

    return stats;
  } catch (error) {
    console.error('Error calculating token usage:', error);
    return {
      total: 0,
      byDomain: { soul: 0, systems: 0, 'ai-tools': 0, insights: 0 },
    };
  }
}

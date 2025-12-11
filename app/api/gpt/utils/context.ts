/**
 * Firestore Context Utilities
 * Manages user context retrieval and storage
 */

import { firebaseAdmin } from '@/lib/firebaseAdmin';
import type { UserContext, UserContextDoc, GPTDomain } from '../types';

const db = firebaseAdmin.firestore();

/**
 * Get user context from Firestore for a specific domain
 */
export async function getUserContext<T extends UserContext>(
  userId: string,
  domain: GPTDomain
): Promise<T> {
  try {
    const docRef = db.collection('user-contexts').doc(userId);
    const doc = await docRef.get();

    if (!doc.exists) {
      // Return minimal context for new users
      return {
        userId,
      } as T;
    }

    const data = doc.data() as UserContextDoc;
    
    // Return domain-specific context merged with base context
    const baseContext = {
      userId,
      preferences: data.preferences,
    };

    switch (domain) {
      case 'soul':
        return { ...baseContext, ...data.soul } as T;
      case 'systems':
        return { ...baseContext, ...data.systems } as T;
      case 'ai-tools':
        return { ...baseContext, ...data.aiTools } as T;
      case 'insights':
        return { ...baseContext, ...data.insights } as T;
      default:
        return baseContext as T;
    }
  } catch (error) {
    console.error(`Error fetching user context for ${userId}:`, error);
    
    // Return minimal context on error
    return {
      userId,
    } as T;
  }
}

/**
 * Update user context in Firestore for a specific domain
 */
export async function updateUserContext(
  userId: string,
  domain: GPTDomain,
  contextData: Partial<UserContext>
): Promise<void> {
  try {
    const docRef = db.collection('user-contexts').doc(userId);
    
    const updateData: any = {
      userId,
      lastUpdated: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    };

    // Update domain-specific context
    updateData[domain === 'ai-tools' ? 'aiTools' : domain] = contextData;

    await docRef.set(updateData, { merge: true });
  } catch (error) {
    console.error(`Error updating user context for ${userId}:`, error);
    throw error;
  }
}

/**
 * Initialize user context document (called on user signup)
 */
export async function initializeUserContext(userId: string): Promise<void> {
  try {
    const docRef = db.collection('user-contexts').doc(userId);
    
    const initialDoc: Partial<UserContextDoc> = {
      userId,
      lastUpdated: new Date(),
      soul: {
        userId,
        archetypes: [],
        values: [],
      },
      systems: {
        userId,
        activeWorkflows: [],
        integrations: [],
      },
      aiTools: {
        userId,
        favoriteTools: [],
        recentPrompts: [],
      },
      insights: {
        userId,
        metricPreferences: [],
      },
    };

    await docRef.set(initialDoc);
  } catch (error) {
    console.error(`Error initializing user context for ${userId}:`, error);
    throw error;
  }
}

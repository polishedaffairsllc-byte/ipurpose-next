/**
 * Rate Limiting Utilities
 * Per-user rate limiting for GPT API calls
 */

import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { OPENAI_CONFIG } from './openai-client';

const db = firebaseAdmin.firestore();

interface RateLimitData {
  userId: string;
  requests: number;
  tokens: number;
  windowStart: Date;
  lastRequest: Date;
}

/**
 * Rate limit windows
 */
const WINDOWS = {
  MINUTE: 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
} as const;

/**
 * Check if user has exceeded rate limits
 */
export async function checkRateLimit(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  resetAt?: Date;
}> {
  try {
    const now = new Date();
    const docRef = db.collection('rate-limits').doc(userId);
    const doc = await docRef.get();

    if (!doc.exists) {
      // First request - initialize rate limit data
      await initializeRateLimit(userId, now);
      return { allowed: true };
    }

    const data = doc.data() as RateLimitData;
    const windowStart = data.windowStart instanceof Date 
      ? data.windowStart 
      : (data.windowStart as any).toDate();
    const timeSinceWindowStart = now.getTime() - windowStart.getTime();

    // Check minute window
    if (timeSinceWindowStart < WINDOWS.MINUTE) {
      if (data.requests >= OPENAI_CONFIG.RATE_LIMITS.requestsPerMinute) {
        const resetAt = new Date(windowStart.getTime() + WINDOWS.MINUTE);
        return {
          allowed: false,
          reason: 'Rate limit exceeded: Too many requests per minute',
          resetAt,
        };
      }
      
      if (data.tokens >= OPENAI_CONFIG.RATE_LIMITS.tokensPerMinute) {
        const resetAt = new Date(windowStart.getTime() + WINDOWS.MINUTE);
        return {
          allowed: false,
          reason: 'Rate limit exceeded: Too many tokens per minute',
          resetAt,
        };
      }
    }

    // Check daily window
    if (timeSinceWindowStart < WINDOWS.DAY) {
      if (data.requests >= OPENAI_CONFIG.RATE_LIMITS.requestsPerDay) {
        const resetAt = new Date(windowStart.getTime() + WINDOWS.DAY);
        return {
          allowed: false,
          reason: 'Rate limit exceeded: Daily request limit reached',
          resetAt,
        };
      }
      
      if (data.tokens >= OPENAI_CONFIG.RATE_LIMITS.tokensPerDay) {
        const resetAt = new Date(windowStart.getTime() + WINDOWS.DAY);
        return {
          allowed: false,
          reason: 'Rate limit exceeded: Daily token limit reached',
          resetAt,
        };
      }
    }

    // Reset window if needed
    if (timeSinceWindowStart >= WINDOWS.DAY) {
      await initializeRateLimit(userId, now);
    }

    return { allowed: true };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Fail open - allow request if rate limiting fails
    return { allowed: true };
  }
}

/**
 * Record a request in rate limit tracking
 */
export async function recordRequest(userId: string, tokensUsed: number): Promise<void> {
  try {
    const docRef = db.collection('rate-limits').doc(userId);
    const now = new Date();
    
    await docRef.set({
      userId,
      requests: firebaseAdmin.firestore.FieldValue.increment(1),
      tokens: firebaseAdmin.firestore.FieldValue.increment(tokensUsed),
      lastRequest: now,
    }, { merge: true });
  } catch (error) {
    console.error('Failed to record request:', error);
    // Don't throw - logging failures shouldn't break API
  }
}

/**
 * Initialize rate limit data for user
 */
async function initializeRateLimit(userId: string, now: Date): Promise<void> {
  const docRef = db.collection('rate-limits').doc(userId);
  
  await docRef.set({
    userId,
    requests: 0,
    tokens: 0,
    windowStart: now,
    lastRequest: now,
  });
}

/**
 * Get rate limit status for user
 */
export async function getRateLimitStatus(userId: string): Promise<{
  requests: number;
  tokens: number;
  requestLimit: number;
  tokenLimit: number;
  windowStart: Date;
  resetAt: Date;
}> {
  try {
    const docRef = db.collection('rate-limits').doc(userId);
    const doc = await docRef.get();

    if (!doc.exists) {
      const now = new Date();
      return {
        requests: 0,
        tokens: 0,
        requestLimit: OPENAI_CONFIG.RATE_LIMITS.requestsPerDay,
        tokenLimit: OPENAI_CONFIG.RATE_LIMITS.tokensPerDay,
        windowStart: now,
        resetAt: new Date(now.getTime() + WINDOWS.DAY),
      };
    }

    const data = doc.data() as RateLimitData;
    const windowStart = data.windowStart instanceof Date 
      ? data.windowStart 
      : (data.windowStart as any).toDate();
    
    return {
      requests: data.requests,
      tokens: data.tokens,
      requestLimit: OPENAI_CONFIG.RATE_LIMITS.requestsPerDay,
      tokenLimit: OPENAI_CONFIG.RATE_LIMITS.tokensPerDay,
      windowStart,
      resetAt: new Date(windowStart.getTime() + WINDOWS.DAY),
    };
  } catch (error) {
    console.error('Failed to get rate limit status:', error);
    throw error;
  }
}

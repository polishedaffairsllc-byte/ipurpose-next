/**
 * Simple Rate Limiter
 * In-memory rate limiting for API endpoints
 */

interface RateLimitConfig {
  requests: number;
  window: number; // milliseconds
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const limitMap = new Map<string, RateLimitEntry>();

export function rateLimit(config: RateLimitConfig) {
  return {
    check: (identifier: string): { allowed: boolean; resetAt?: number } => {
      const now = Date.now();
      const entry = limitMap.get(identifier);

      if (!entry || now > entry.resetAt) {
        // First request or window expired
        limitMap.set(identifier, {
          count: 1,
          resetAt: now + config.window,
        });
        return { allowed: true };
      }

      if (entry.count >= config.requests) {
        return {
          allowed: false,
          resetAt: entry.resetAt,
        };
      }

      entry.count++;
      return { allowed: true };
    },
    
    reset: (identifier: string) => {
      limitMap.delete(identifier);
    },
  };
}

// Cleanup old entries periodically
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of limitMap.entries()) {
      if (now > entry.resetAt + 60000) { // 1 minute grace period
        limitMap.delete(key);
      }
    }
  }, 60000); // Run every minute
}

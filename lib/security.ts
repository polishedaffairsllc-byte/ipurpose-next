/**
 * Security Utilities
 * Production-grade security helpers
 */

import { rateLimit } from '@/lib/rate-limit-simple';

/**
 * Sanitize user input to prevent XSS and injection attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .slice(0, 10000); // Max length
}

/**
 * Validate domain input
 */
export function isValidDomain(domain: string): boolean {
  const validDomains = ['soul', 'systems', 'ai-tools', 'insights'];
  return validDomains.includes(domain);
}

/**
 * Validate prompt length and content
 */
export function validatePrompt(prompt: string): { valid: boolean; error?: string } {
  if (!prompt || typeof prompt !== 'string') {
    return { valid: false, error: 'Invalid prompt format' };
  }

  const sanitized = sanitizeInput(prompt);
  
  if (sanitized.length === 0) {
    return { valid: false, error: 'Prompt cannot be empty' };
  }

  if (sanitized.length > 8000) {
    return { valid: false, error: 'Prompt too long (max 8000 characters)' };
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /system\s*prompt/i,
    /ignore\s*(previous|above|all)/i,
    /your\s*instructions/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(sanitized)) {
      return { valid: false, error: 'Invalid prompt content' };
    }
  }

  return { valid: true };
}

/**
 * Check if request is from valid origin (CORS)
 */
export function isValidOrigin(origin: string | null): boolean {
  if (!origin) return true; // Allow same-origin

  const allowedOrigins = [
    'http://localhost:3000',
    'https://ipurpose-next.vercel.app',
    process.env.NEXT_PUBLIC_APP_URL,
  ].filter(Boolean);

  return allowedOrigins.some(allowed => origin.startsWith(allowed as string));
}

/**
 * Production rate limiter
 */
const limiters = new Map<string, ReturnType<typeof rateLimit>>();

export function getProductionRateLimiter(endpoint: string) {
  if (!limiters.has(endpoint)) {
    const limits = {
      '/api/gpt': { requests: 30, window: 60000 }, // 30 req/min
      '/api/gpt/stream': { requests: 20, window: 60000 }, // 20 req/min
      '/api/preferences': { requests: 100, window: 60000 }, // 100 req/min
      '/api/focus/apply-pattern': { requests: 20, window: 60000 }, // 20 req/min
      default: { requests: 60, window: 60000 }, // 60 req/min default
    };

    const config = limits[endpoint as keyof typeof limits] || limits.default;
    limiters.set(endpoint, rateLimit(config));
  }

  return limiters.get(endpoint)!;
}

/**
 * Generate secure session ID
 */
export function generateSecureId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`;
}

/**
 * Validate environment variables
 */
export function validateEnvironment(): { valid: boolean; missing: string[] } {
  const required = [
    'OPENAI_API_KEY',
    'FIREBASE_SERVICE_ACCOUNT_KEY',
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  ];

  const missing = required.filter(key => !process.env[key]);

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Log security event
 */
export function logSecurityEvent(event: {
  type: 'rate_limit' | 'invalid_input' | 'auth_failure' | 'suspicious_activity';
  userId?: string;
  ip?: string;
  details?: any;
}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    environment: process.env.NODE_ENV,
    ...event,
  };

  if (process.env.NODE_ENV === 'production') {
    // In production, this would go to monitoring service
    console.warn('[SECURITY]', JSON.stringify(logEntry));
  } else {
    console.log('[SECURITY]', logEntry);
  }
}

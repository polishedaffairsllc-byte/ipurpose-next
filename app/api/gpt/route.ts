/**
 * GPT Central Router
 * Main endpoint for GPT requests across all domains
 * Route: /api/gpt
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { sanitizeInput, validatePrompt, isValidDomain, getProductionRateLimiter, logSecurityEvent } from '@/lib/security';
import type { GPTRequest, GPTResponse, GPTDomain } from './types';
import { routeToHandler } from './router';

// Force this route to be dynamic (no build-time prerendering)
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting
    const limiter = getProductionRateLimiter('/api/gpt');
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitCheck = limiter.check(ip);
    
    if (!rateLimitCheck.allowed) {
      logSecurityEvent({ type: 'rate_limit', ip, details: { endpoint: '/api/gpt' } });
      return NextResponse.json(
        { success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests' } },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    // 2. Authenticate user
    const cookieStore = await cookies();
    const session = cookieStore.get('FirebaseSession')?.value;
    
    if (!session) {
      logSecurityEvent({ type: 'auth_failure', ip, details: { reason: 'no_session' } });
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'No session found' } },
        { status: 401 }
      );
    }

    const decodedToken = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const userId = decodedToken.uid;

    // 3. Parse request body
    const body = await request.json();
    const { domain, prompt, context, options } = body as Partial<GPTRequest>;

    // 4. Validate request
    if (!domain || !prompt) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_REQUEST', message: 'Missing required fields: domain, prompt' }
        },
        { status: 400 }
      );
    }

    // 5. Security validation
    if (!isValidDomain(domain)) {
      logSecurityEvent({ type: 'invalid_input', userId, details: { reason: 'invalid_domain', domain } });
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_DOMAIN', message: 'Invalid domain specified' }
        },
        { status: 400 }
      );
    }

    const promptValidation = validatePrompt(prompt);
    if (!promptValidation.valid) {
      logSecurityEvent({ type: 'invalid_input', userId, details: { reason: promptValidation.error } });
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_PROMPT', message: promptValidation.error }
        },
        { status: 400 }
      );
    }

    const sanitizedPrompt = sanitizeInput(prompt);

    // 6. Build GPT request
    const gptRequest: GPTRequest = {
      domain,
      prompt: sanitizedPrompt,
      userId,
      context,
      options: {
        temperature: options?.temperature ?? 0.7,
        maxTokens: options?.maxTokens ?? 1000,
        stream: options?.stream ?? false,
        model: options?.model ?? 'gpt-4',
      },
    };

    // 5. Route to appropriate handler
    const response = await routeToHandler(gptRequest);

    // 6. Return response
    return NextResponse.json(response);

  } catch (error) {
    console.error('GPT API Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'An unexpected error occurred'
        }
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      message: 'GPT API is ready',
      version: '1.0.0',
      domains: ['soul', 'systems', 'ai-tools', 'insights']
    },
    { status: 200 }
  );
}

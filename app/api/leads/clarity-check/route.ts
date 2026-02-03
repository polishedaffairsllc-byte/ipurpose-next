import { NextRequest, NextResponse } from 'next/server';
import { processLead } from '@/lib/leads';
import { rateLimit } from '@/lib/rate-limit-simple';

interface ClarityCheckRequest {
  name: string;
  email: string;
  website?: string; // Honeypot field
}

// Rate limiter: 5 requests per minute per IP
const clarityCheckLimiter = rateLimit({
  requests: 5,
  window: 60 * 1000, // 1 minute
});

/**
 * Extract context from request headers
 */
function getRequestContext(request: NextRequest) {
  return {
    userAgent: request.headers.get('user-agent'),
    ip: request.headers.get('x-forwarded-for')?.split(',')[0] || null,
    referer: request.headers.get('referer'),
    pathname: request.headers.get('x-pathname'),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ClarityCheckRequest;
    const { name, email, website } = body;

    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') ||
               'unknown';

    // Check rate limit
    const rateCheckResult = clarityCheckLimiter.check(`clarity-check:${ip}`);
    if (!rateCheckResult.allowed) {
      console.warn('[CLARITY CHECK] Rate limit exceeded for IP:', ip);
      return NextResponse.json(
        { ok: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    console.log('[CLARITY CHECK] Incoming request:', { name, email });

    // Honeypot validation: silently drop if website field is filled
    if (website && website.trim().length > 0) {
      console.warn('[CLARITY CHECK] Honeypot triggered for IP:', ip);
      // Return success to avoid revealing honeypot existence to bots
      return NextResponse.json({
        ok: true,
        id: 'honeypot-dropped',
        deduped: false,
      });
    }

    // Get request context
    const context = getRequestContext(request);

    // Process lead (validates, dedupes, stores in Firestore)
    const result = await processLead('clarity-check', name, email, context);

    console.log('[CLARITY CHECK] ProcessLead result:', result);

    if (!result.ok) {
      console.error('[CLARITY CHECK] Lead processing failed:', result.error);
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 }
      );
    }

    console.log('[CLARITY CHECK] Success:', { id: result.id, deduped: result.deduped });
    return NextResponse.json({
      ok: true,
      id: result.id,
      deduped: result.deduped,
    });
  } catch (error) {
    console.error('[CLARITY CHECK] Unexpected error:', error);
    return NextResponse.json(
      { ok: false, error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { processLead } from '@/lib/leads';
import { rateLimit } from '@/lib/rate-limit-simple';
import { scheduleEmailSequence, sendClarityCheckResultsEmail, ClarityCheckScores } from '@/lib/email-automation';

interface ClarityCheckRequest {
  name: string;
  email: string;
  website?: string; // Honeypot field
  submissionId?: string;
  identityType?: string;
  totalScore?: number;
  scores?: {
    internalClarity: number;
    readinessForSupport: number;
    frictionBetweenInsightAndAction: number;
    integrationAndMomentum: number;
    totalScore: number;
  };
  resultSummary?: string;
  nextStep?: string;
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
    const { name, email, website, submissionId: clientSubmissionId, identityType, totalScore, scores, resultSummary, nextStep } = body;

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

    // Schedule email sequence (Day 1 thank-you + Day 5 founder's rate)
    try {
      await scheduleEmailSequence({
        email,
        name,
        submissionId: result.id || clientSubmissionId || '',
        ...(identityType && { identityType }),
        ...(totalScore !== undefined && { totalScore }),
      });
    } catch (emailError) {
      console.error('[CLARITY CHECK] Email scheduling failed (non-blocking):', emailError);
    }

    // Send full results email if scores were provided by the client
    if (scores && resultSummary && nextStep) {
      try {
        await sendClarityCheckResultsEmail({
          email,
          name,
          scores: scores as ClarityCheckScores,
          resultSummary,
          nextStep,
          submissionId: clientSubmissionId || '',
          identityType,
        });
      } catch (resultsEmailError) {
        console.error('[CLARITY CHECK] Results email failed (non-blocking):', resultsEmailError);
      }
    }

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


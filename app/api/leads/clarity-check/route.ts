import { NextRequest, NextResponse } from 'next/server';
import { processLead } from '@/lib/leads';

interface ClarityCheckRequest {
  name: string;
  email: string;
}

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
    const { name, email } = body;

    console.log('[CLARITY CHECK] Incoming request:', { name, email });

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


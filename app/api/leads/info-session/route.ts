import { NextRequest, NextResponse } from 'next/server';
import { processLead } from '@/lib/leads';

interface InfoSessionRequest {
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
    const body = (await request.json()) as InfoSessionRequest;
    const { name, email } = body;

    // Get request context
    const context = getRequestContext(request);

    // Process lead (validates, dedupes, stores in Firestore)
    const result = await processLead('info-session', name, email, context);

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      id: result.id,
      deduped: result.deduped,
    });
  } catch (error) {
    console.error('[INFO SESSION] Unexpected error:', error);
    return NextResponse.json(
      { ok: false, error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

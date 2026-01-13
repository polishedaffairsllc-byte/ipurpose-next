import { NextRequest, NextResponse } from 'next/server';

interface ClarityCheckRequest {
  name: string;
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ClarityCheckRequest;
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Log to server console for now
    console.log(`[CLARITY CHECK] New submission:`, { name, email, timestamp: new Date().toISOString() });

    // TODO: Future - save to Firestore or external service
    // For now, just return success

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[CLARITY CHECK] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process clarity check' },
      { status: 500 }
    );
  }
}

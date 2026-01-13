import { NextRequest, NextResponse } from 'next/server';

interface InfoSessionRequest {
  name: string;
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as InfoSessionRequest;
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Log to server console for now
    console.log(`[INFO SESSION] New registration:`, { name, email, timestamp: new Date().toISOString() });

    // TODO: Future - save to Firestore or external service
    // For now, just return success

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[INFO SESSION] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process info session registration' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Add to your leads collection
    const { firebaseAdmin } = await import('@/lib/firebaseAdmin');
    const db = firebaseAdmin.firestore();

    await db.collection('leads').add({
      email,
      source: 'welcome_popup',
      timestamp: new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error saving email:', error);
    return NextResponse.json(
      { error: 'Failed to save email' },
      { status: 500 }
    );
  }
}

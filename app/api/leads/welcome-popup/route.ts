import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, utm_source, utm_medium, utm_campaign, utm_content, utm_term } = await req.json();

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
      utm_source: utm_source || null,
      utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null,
      utm_content: utm_content || null,
      utm_term: utm_term || null,
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

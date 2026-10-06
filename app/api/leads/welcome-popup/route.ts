import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { requestContactVerification } from '@/lib/trust/emailVerification';
import { sendTransactionalEmail } from '@/lib/clarity/lifecycleServer';
import { protectPublicSubmission, PublicInputError, readPublicJson, requestIp, validEmail } from '@/lib/trust/publicProtection';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await readPublicJson(req);
    const { email, utm_source, utm_medium, utm_campaign, utm_content, utm_term } = body;
    const guard = await protectPublicSubmission(firebaseAdmin.firestore(), 'welcome-popup', requestIp(req), body, { requireChallenge: true });
    if (guard === 'dropped') return NextResponse.json({ ok: true });
    if (guard !== 'accepted') return NextResponse.json({ error: 'Please reload the form or wait before trying again.' }, { status: 400 });

    if (!validEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Add to your leads collection

    const db = firebaseAdmin.firestore();

    await db.collection('leads').add({
      email: email.trim().toLowerCase(),
      source: 'welcome_popup',
      timestamp: new Date(),
      utm_source: utm_source || null,
      utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null,
      utm_content: utm_content || null,
      utm_term: utm_term || null,
    });

    await requestContactVerification(db, email, sendTransactionalEmail);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error saving email:', error);
    return NextResponse.json(
      { error: 'Failed to save email' },
      { status: error instanceof PublicInputError ? error.status : 503 }
    );
  }
}

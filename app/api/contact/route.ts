import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { processLead } from '@/lib/leads';

interface ContactRequest {
  name: string;
  email: string;
  topic?: string;
  message: string;
}

function getRequestContext(request: NextRequest) {
  return {
    userAgent: request.headers.get('user-agent'),
    ip: request.headers.get('x-forwarded-for')?.split(',')[0] || null,
    referer: request.headers.get('referer'),
    pathname: request.headers.get('x-pathname'),
  };
}

async function sendFounderNotification(payload: {
  name: string;
  email: string;
  topic?: string;
  message: string;
  docId: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  const founderEmail = process.env.FOUNDER_NOTIFY_EMAIL || 'renita.hamilton@polishedaffairsllc.com';

  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not configured. Founder notification will not be sent.');
    return false;
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(resendApiKey);

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #2a2a2a; }
    .container { max-width: 640px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 24px; }
    .header h1 { font-size: 24px; margin: 0; }
    .row { margin-bottom: 12px; }
    .label { font-weight: 600; color: #444; }
    .value { color: #222; }
    .box { background: #f7f7f7; border-radius: 8px; padding: 16px; white-space: pre-wrap; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Contact Submission</h1>
    </div>
    <div class="row"><span class="label">Name:</span> <span class="value">${payload.name}</span></div>
    <div class="row"><span class="label">Email:</span> <span class="value">${payload.email}</span></div>
    ${payload.topic ? `<div class="row"><span class="label">Topic:</span> <span class="value">${payload.topic}</span></div>` : ''}
    <div class="row"><span class="label">Message:</span></div>
    <div class="box">${payload.message}</div>
    <div class="row" style="margin-top:16px; color:#777; font-size: 12px;">Contact ID: ${payload.docId}</div>
  </div>
</body>
</html>
    `;

    await resend.emails.send({
      from: fromEmail,
      to: founderEmail,
      subject: `New Contact Submission: ${payload.name}`,
      html: emailHtml,
    });

    return true;
  } catch (error) {
    console.error('Error sending contact notification:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ContactRequest;
    const { name, email, topic, message } = body;

    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return NextResponse.json({ ok: false, error: 'INVALID_MESSAGE' }, { status: 400 });
    }

    const context = getRequestContext(request);

    const leadResult = await processLead('contact', name, email, context);

    if (!leadResult.ok || !leadResult.id) {
      return NextResponse.json({ ok: false, error: leadResult.error || 'LEAD_ERROR' }, { status: 400 });
    }

    let contactDocId = leadResult.id;

    try {
      const docRef = await firebaseAdmin.firestore().collection('contactRequests').add({
        name,
        email,
        topic: topic || null,
        message: message.trim(),
        source: 'contact',
        createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      });
      contactDocId = docRef.id;
      console.log('[CONTACT] Stored contact request:', { id: contactDocId, email });
    } catch (firestoreError) {
      console.error('[CONTACT] Firestore error storing contact request:', firestoreError);
    }

    try {
      await sendFounderNotification({ name, email, topic, message: message.trim(), docId: contactDocId });
    } catch (notifyError) {
      console.error('[CONTACT] Notification error:', notifyError);
    }

    return NextResponse.json({ ok: true, id: contactDocId, deduped: leadResult.deduped || false });
  } catch (error) {
    console.error('[CONTACT] Unexpected error:', error);
    return NextResponse.json({ ok: false, error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

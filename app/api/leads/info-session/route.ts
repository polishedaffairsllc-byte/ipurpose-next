import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { processLead } from '@/lib/leads';

interface InfoSessionRequest {
  name: string;
  email: string;
  timezone?: string;
  notes?: string;
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

async function sendParticipantConfirmation(name: string, email: string) {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not configured. Confirmation email will not be sent.');
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
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { font-size: 28px; color: #2a2a2a; margin: 0 0 10px 0; }
    .section { margin-bottom: 25px; }
    .section p { margin: 0 0 15px 0; line-height: 1.7; }
    .detail-box { background: #f5f5f5; padding: 15px; border-radius: 8px; }
    .detail-item { display: flex; margin-bottom: 10px; }
    .detail-label { font-weight: 600; width: 120px; color: #666; }
    .detail-value { flex: 1; color: #2a2a2a; }
    .cta { display: inline-block; margin-top: 20px; padding: 12px 24px; background: linear-gradient(135deg, #a991d8 0%, #6366b8 100%); color: white; text-decoration: none; border-radius: 6px; font-size: 14px; }
    .footer { text-align: center; font-size: 12px; color: #999; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>You're Registered!</h1>
      <p style="color: #666; margin: 0;">Your spot is reserved for the iPurpose Info Session</p>
    </div>

    <div class="section">
      <p>Hi ${name},</p>
      <p>Thanks for registering for the iPurpose Info Session. We're excited to connect with you and explore whether this program is the right fit for your journey.</p>
    </div>

    <div class="section">
      <h3 style="margin: 0 0 15px 0; color: #2a2a2a;">What to Expect</h3>
      <div class="detail-box">
        <div class="detail-item">
          <div class="detail-label">Duration:</div>
          <div class="detail-value">40 minutes</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Format:</div>
          <div class="detail-value">Live group call</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">What's Covered:</div>
          <div class="detail-value">Program overview, Q&A, and next steps</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h3 style="margin: 0 0 15px 0; color: #2a2a2a;">Next Steps</h3>
      <p>Session details will be sent to this email address as we confirm dates. Keep an eye on your inbox for:</p>
      <ul style="margin: 15px 0; padding-left: 20px;">
        <li>Exact date and time</li>
        <li>Zoom link</li>
        <li>Any pre-session prep</li>
      </ul>
    </div>

    <div class="section">
      <p style="margin-bottom: 10px;">Questions in the meantime?</p>
      <p style="margin: 0;">Reply to this email or visit <a href="https://ipurposesoul.com" style="color: #a991d8; text-decoration: none;">ipurposesoul.com</a></p>
    </div>

    <div class="footer">
      <p>This is a confirmation email. Your registration is secure.</p>
    </div>
  </div>
</body>
</html>
    `;

    const result = await resend.emails.send({
      from: 'info@ipurposesoul.com',
      to: email,
      subject: 'You\'re Registered for the iPurpose Info Session',
      html: emailHtml,
    });

    console.log('Participant confirmation email sent:', result);
    return true;
  } catch (error) {
    console.error('Error sending participant confirmation:', error);
    return false;
  }
}

async function sendFounderInfoSessionNotification(
  name: string,
  email: string,
  registrationDocId: string,
  timezone?: string
) {
  const resendApiKey = process.env.RESEND_API_KEY;
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
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { font-size: 24px; color: #2a2a2a; margin: 0 0 10px 0; }
    .info-row { display: flex; padding: 12px 0; border-bottom: 1px solid #eee; }
    .info-label { font-weight: 600; width: 120px; color: #666; }
    .info-value { flex: 1; color: #2a2a2a; }
    .view-link { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #a991d8; color: white; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Info Session Registration</h1>
    </div>

    <div>
      <div className="info-row">
        <div className="info-label">Name:</div>
        <div className="info-value">${name}</div>
      </div>
      <div className="info-row">
        <div className="info-label">Email:</div>
        <div className="info-value">${email}</div>
      </div>
      ${timezone ? `<div className="info-row">
        <div className="info-label">Timezone:</div>
        <div className="info-value">${timezone}</div>
      </div>` : ''}
      <div className="info-row">
        <div className="info-label">Registered:</div>
        <div className="info-value">${new Date().toLocaleString()}</div>
      </div>
    </div>

    <div>
      <a href="https://ipurposesoul.com/deepen/admin/intake?registration=${registrationDocId}" className="view-link">
        View Full Registration
      </a>
    </div>

    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #999;">
      <p>Registration ID: ${registrationDocId}</p>
    </div>
  </div>
</body>
</html>
    `;

    const result = await resend.emails.send({
      from: 'info@ipurposesoul.com',
      to: founderEmail,
      subject: `New Info Session Registration: ${name}`,
      html: emailHtml,
    });

    console.log('Founder info session notification sent:', result);
    return true;
  } catch (error) {
    console.error('Error sending founder notification:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as InfoSessionRequest;
    const { name, email, timezone, notes } = body;

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

    // Store in infoSessionRegistrations collection for founder intake
    let registrationDocId = '';
    try {
      const docRef = await firebaseAdmin
        .firestore()
        .collection('infoSessionRegistrations')
        .add({
          name,
          email,
          timezone: timezone || null,
          notes: notes || null,
          source: 'info_session',
          status: 'registered',
          createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        });
      registrationDocId = docRef.id;
      console.log('Info session registration stored:', { id: registrationDocId, email });
    } catch (firestoreError) {
      console.error('Firestore error storing registration:', firestoreError);
      // Continue anyway—we'll still try to send emails
    }

    // Send confirmation email to participant
    try {
      await sendParticipantConfirmation(name, email);
      console.log('Participant confirmation email sent:', { email });
    } catch (emailError) {
      console.error('Email error sending to participant:', emailError);
      // Don't fail the request if email fails
    }

    // Send founder notification email
    try {
      await sendFounderInfoSessionNotification(name, email, registrationDocId, timezone);
      console.log('Founder notification email sent for registration:', { id: registrationDocId });
    } catch (founderEmailError) {
      console.error('Error sending founder notification:', founderEmailError);
      // Don't fail the request if founder email fails
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

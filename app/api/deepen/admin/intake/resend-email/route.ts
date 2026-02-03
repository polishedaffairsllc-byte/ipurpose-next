import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { requireUid } from '@/lib/firebase/requireUser';
import { deriveFounderContext } from '@/lib/isFounder';

interface ResendEmailRequest {
  type: 'clarity_check' | 'info_session';
  docId: string;
}

async function sendClarityCheckEmail(email: string, summary: string, nextStep: string): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not configured');
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
    .section { margin-bottom: 30px; }
    .section h2 { font-size: 16px; font-weight: 600; color: #2a2a2a; margin: 0 0 15px 0; }
    .summary { background: #f9f5ff; padding: 15px; border-radius: 8px; border-left: 4px solid #a991d8; line-height: 1.7; }
    .next-step { background: #f5f5f5; padding: 15px; border-radius: 8px; line-height: 1.7; }
    .cta { display: inline-block; margin-top: 20px; padding: 12px 24px; background: linear-gradient(135deg, #a991d8 0%, #6366b8 100%); color: white; text-decoration: none; border-radius: 6px; font-size: 14px; }
    .footer { text-align: center; font-size: 12px; color: #999; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Clarity Check Results</h1>
      <p style="color: #666; margin: 0;">Where you are right now</p>
    </div>

    <div class="section">
      <h2>Your Summary</h2>
      <div class="summary">
        ${summary}
      </div>
    </div>

    <div class="section">
      <h2>Your Next Step</h2>
      <div class="next-step">
        ${nextStep}
      </div>
      <a href="https://ipurposesoul.com/offers" class="cta">Explore Programs</a>
    </div>

    <div class="footer">
      <p>This email contains your personal clarity check results.</p>
    </div>
  </div>
</body>
</html>
    `;

    const result = await resend.emails.send({
      from: 'info@ipurposesoul.com',
      to: email,
      subject: 'Your Clarity Check Results',
      html: emailHtml,
    });

    console.log('Clarity check email resent:', result);
    return true;
  } catch (error) {
    console.error('Error resending clarity check email:', error);
    return false;
  }
}

async function sendInfoSessionConfirmation(name: string, email: string): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not configured');
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

    console.log('Info session confirmation resent:', result);
    return true;
  } catch (error) {
    console.error('Error resending info session confirmation:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const uid = await requireUid();

    // Check founder status
    const db = firebaseAdmin.firestore();
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();

    const founderContext = deriveFounderContext(null, userData);

    if (!founderContext.isFounder) {
      return NextResponse.json(
        { ok: false, error: 'Founder access required' },
        { status: 403 }
      );
    }

    const body = (await request.json()) as ResendEmailRequest;
    const { type, docId } = body;

    if (!type || !docId) {
      return NextResponse.json(
        { ok: false, error: 'Missing type or docId' },
        { status: 400 }
      );
    }

    if (type === 'clarity_check') {
      // Get clarity check submission
      const docRef = db.collection('clarityCheckSubmissions').doc(docId);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        return NextResponse.json(
          { ok: false, error: 'Submission not found' },
          { status: 404 }
        );
      }

      const data = docSnap.data();
      const email = data?.email;
      const summary = data?.resultSummary;
      const nextStep = data?.resultDetail;

      if (!email || !summary || !nextStep) {
        return NextResponse.json(
          { ok: false, error: 'Missing email or result data' },
          { status: 400 }
        );
      }

      // Send email
      const sent = await sendClarityCheckEmail(email, summary, nextStep);

      if (!sent) {
        return NextResponse.json(
          { ok: false, error: 'Failed to send email' },
          { status: 500 }
        );
      }

      // Update status
      await docRef.update({
        emailDelivery: {
          attemptedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
          status: 'sent',
        },
        status: 'emailed',
      });

      return NextResponse.json({
        ok: true,
        message: 'Clarity check email sent to ' + email,
      });
    } else if (type === 'info_session') {
      // Get info session registration
      const docRef = db.collection('infoSessionRegistrations').doc(docId);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        return NextResponse.json(
          { ok: false, error: 'Registration not found' },
          { status: 404 }
        );
      }

      const data = docSnap.data();
      const name = data?.name;
      const email = data?.email;

      if (!email || !name) {
        return NextResponse.json(
          { ok: false, error: 'Missing email or name' },
          { status: 400 }
        );
      }

      // Send email
      const sent = await sendInfoSessionConfirmation(name, email);

      if (!sent) {
        return NextResponse.json(
          { ok: false, error: 'Failed to send email' },
          { status: 500 }
        );
      }

      // Update status
      await docRef.update({
        emailDelivery: {
          attemptedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
          status: 'sent',
        },
        status: 'emailed',
      });

      return NextResponse.json({
        ok: true,
        message: 'Info session confirmation sent to ' + email,
      });
    } else {
      return NextResponse.json(
        { ok: false, error: 'Invalid type' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error resending email:', error);
    const status = (error as { status?: number }).status || 500;
    return NextResponse.json(
      { ok: false, error: 'Failed to resend email' },
      { status }
    );
  }
}

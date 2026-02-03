import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

interface ClarityCheckRequest {
  email: string;
  responses: Record<number, number>;
}

function calculateDimensionScores(responses: Record<number, number>) {
  const internalClarity = (responses[1] || 0) + (responses[2] || 0) + (responses[3] || 0);
  const readinessForSupport = (responses[4] || 0) + (responses[5] || 0) + (responses[6] || 0);
  const frictionBetweenInsightAndAction = (responses[7] || 0) + (responses[8] || 0) + (responses[9] || 0);
  const integrationAndMomentum = (responses[10] || 0) + (responses[11] || 0) + (responses[12] || 0);

  const totalScore =
    internalClarity + readinessForSupport + frictionBetweenInsightAndAction + integrationAndMomentum;

  return {
    internalClarity,
    readinessForSupport,
    frictionBetweenInsightAndAction,
    integrationAndMomentum,
    totalScore,
  };
}

function generateSummary(scores: ReturnType<typeof calculateDimensionScores>) {
  const { internalClarity, readinessForSupport, frictionBetweenInsightAndAction, integrationAndMomentum, totalScore } = scores;

  let summary = '';
  let nextStep = '';

  // Determine overall profile and next step
  if (totalScore >= 50) {
    summary =
      "You have real clarity and forward motion right now. Your direction feels grounded, and you're open to support. The next step is integration - turning what you already know into a steady rhythm.";
    nextStep = 'Choose one simple structure to protect your momentum this week (a weekly plan, a daily priority, or a decision filter).';
  } else if (totalScore >= 35) {
    summary =
      "You have insight, but there's a gap between knowing and doing. You can sense what needs to shift, and you're open to support. This isn't a knowledge problem - it's a structure and follow-through problem.";
    nextStep = 'Pick one area where a clear system would remove friction (time, decisions, or next steps) - and start there.';
  } else {
    summary =
      "Things feel foggy right now - and that doesn't mean you're failing. It often means you're carrying too much, moving without a clear anchor, or trying to decide under pressure. You're here because part of you knows it's time to recalibrate.";
    nextStep = 'Name one pressure you can release this week, and one truth you\'re ready to act on - even in a small way.';
  }

  return { summary, nextStep };
}

async function sendFounderNotification(
  userEmail: string,
  scores: ReturnType<typeof calculateDimensionScores>,
  summary: string,
  submissionDocId: string
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
    .section { margin-bottom: 20px; }
    .info-row { display: flex; padding: 12px 0; border-bottom: 1px solid #eee; }
    .info-label { font-weight: 600; width: 150px; color: #666; }
    .info-value { flex: 1; color: #2a2a2a; }
    .scores { background: #f5f5f5; padding: 15px; border-radius: 8px; }
    .score-item { display: flex; justify-content: space-between; padding: 8px 0; }
    .summary { background: #f9f5ff; padding: 15px; border-radius: 8px; border-left: 4px solid #a991d8; line-height: 1.6; }
    .view-link { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #a991d8; color: white; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Clarity Check Submission</h1>
    </div>

    <div className="section">
      <div className="info-row">
        <div className="info-label">Email:</div>
        <div className="info-value">${userEmail}</div>
      </div>
      <div className="info-row">
        <div className="info-label">Submitted:</div>
        <div className="info-value">${new Date().toLocaleString()}</div>
      </div>
    </div>

    <div className="section">
      <h3 style="margin: 0 0 15px 0;">Scores</h3>
      <div className="scores">
        <div className="score-item">
          <span>Internal Clarity:</span>
          <strong>${scores.internalClarity}/15</strong>
        </div>
        <div className="score-item">
          <span>Readiness for Support:</span>
          <strong>${scores.readinessForSupport}/15</strong>
        </div>
        <div className="score-item">
          <span>Friction Between Insight & Action:</span>
          <strong>${scores.frictionBetweenInsightAndAction}/15</strong>
        </div>
        <div className="score-item">
          <span>Integration & Momentum:</span>
          <strong>${scores.integrationAndMomentum}/15</strong>
        </div>
        <div className="score-item" style="border-top: 1px solid rgba(0,0,0,0.1); padding-top: 10px; margin-top: 10px;">
          <span style="font-weight: 600;">Total Score:</span>
          <strong>${scores.totalScore}/60</strong>
        </div>
      </div>
    </div>

    <div className="section">
      <h3 style="margin: 0 0 10px 0;">Summary</h3>
      <div className="summary">
        ${summary}
      </div>
    </div>

    <div>
      <a href="https://ipurposesoul.com/deepen/admin/intake?submission=${submissionDocId}" className="view-link">
        View Full Submission
      </a>
    </div>

    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #999;">
      <p>Submission ID: ${submissionDocId}</p>
    </div>
  </div>
</body>
</html>
    `;

    const result = await resend.emails.send({
      from: 'info@ipurposesoul.com',
      to: founderEmail,
      subject: `New Clarity Check: ${userEmail}`,
      html: emailHtml,
    });

    console.log('Founder notification sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Error sending founder notification:', error);
    return false;
  }
}

async function sendResultsEmail(
  email: string,
  scores: ReturnType<typeof calculateDimensionScores>,
  summary: string,
  nextStep: string
) {
  // Use Resend for email sending
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not configured. Email will not be sent.');
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
    .header p { color: #666; font-size: 14px; }
    .section { margin-bottom: 30px; }
    .section h2 { font-size: 16px; font-weight: 600; color: #2a2a2a; margin: 0 0 15px 0; }
    .scores-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
    .score-box { background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center; }
    .score-box .label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
    .score-box .value { font-size: 24px; font-weight: 600; color: #7c5cbc; margin: 8px 0 0 0; }
    .total-score { background: linear-gradient(135deg, #a991d8 0%, #6366b8 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
    .total-score .label { font-size: 14px; opacity: 0.9; }
    .total-score .value { font-size: 48px; font-weight: 600; margin: 5px 0 0 0; }
    .summary { background: #f9f5ff; padding: 15px; border-radius: 8px; border-left: 4px solid #a991d8; line-height: 1.7; }
    .next-step { background: #f5f5f5; padding: 15px; border-radius: 8px; line-height: 1.7; }
    .footer { text-align: center; font-size: 12px; color: #999; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; }
    .cta { display: inline-block; margin-top: 20px; padding: 12px 24px; background: linear-gradient(135deg, #a991d8 0%, #6366b8 100%); color: white; text-decoration: none; border-radius: 6px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Clarity Check Results</h1>
      <p>Where you are right now</p>
    </div>

    <div class="section">
      <div class="total-score">
        <div class="label">Total Score</div>
        <div class="value">${scores.totalScore} / 60</div>
      </div>

      <h2>Dimension Scores</h2>
      <div class="scores-grid">
        <div class="score-box">
          <div class="label">Internal Clarity</div>
          <div class="value">${scores.internalClarity} / 15</div>
        </div>
        <div class="score-box">
          <div class="label">Readiness for Support</div>
          <div class="value">${scores.readinessForSupport} / 15</div>
        </div>
        <div class="score-box">
          <div class="label">Friction Between Insight & Action</div>
          <div class="value">${scores.frictionBetweenInsightAndAction} / 15</div>
        </div>
        <div class="score-box">
          <div class="label">Integration & Momentum</div>
          <div class="value">${scores.integrationAndMomentum} / 15</div>
        </div>
      </div>
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
      <a href="https://ipurposesoul.com" class="cta">Explore iPurpose Programs</a>
    </div>

    <div class="footer">
      <p>Taken on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      <p>This email contains your personal clarity check results. Keep it safe.</p>
    </div>
  </div>
</body>
</html>
    `;

    const result = await resend.emails.send({
      from: 'info@ipurposesoul.com',
      to: email,
      subject: 'Your iPurpose Clarity Check Results',
      html: emailHtml,
    });

    console.log('Email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Error sending email via Resend:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ClarityCheckRequest = await request.json();
    const { email, responses } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    if (!responses || Object.keys(responses).length !== 12) {
      return NextResponse.json(
        { error: 'All 12 questions must be answered' },
        { status: 400 }
      );
    }

    // Validate all responses are between 1-5
    for (const [key, value] of Object.entries(responses)) {
      if (typeof value !== 'number' || value < 1 || value > 5) {
        return NextResponse.json(
          { error: 'All responses must be a number between 1 and 5' },
          { status: 400 }
        );
      }
    }

    // Calculate scores
    const scores = calculateDimensionScores(responses);
    const { summary, nextStep } = generateSummary(scores);

    // Store in clarityCheckSubmissions collection for founder intake
    let submissionDocId = '';
    try {
      const docRef = await firebaseAdmin
        .firestore()
        .collection('clarityCheckSubmissions')
        .add({
          email,
          responses,
          scores,
          resultSummary: summary,
          resultDetail: nextStep,
          source: 'clarity_check',
          status: 'submitted',
          createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        });
      submissionDocId = docRef.id;
      console.log('Clarity check submission stored:', { id: submissionDocId, email });
    } catch (firestoreError) {
      console.error('Firestore error storing submission:', firestoreError);
      // Continue anyway—we'll still try to send emails
    }

    // Send email with results to user
    try {
      await sendResultsEmail(email, scores, summary, nextStep);
      console.log('User results email sent:', { email });
    } catch (emailError) {
      console.error('Email error sending to user:', emailError);
      // Don't fail the request if email fails
    }

    // Send founder notification email
    try {
      await sendFounderNotification(email, scores, summary, submissionDocId);
      console.log('Founder notification email sent for submission:', { id: submissionDocId });
    } catch (founderEmailError) {
      console.error('Error sending founder notification:', founderEmailError);
      // Don't fail the request if founder email fails
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Clarity check submitted',
        scores,
        summary,
        nextStep,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Clarity check submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process clarity check' },
      { status: 500 }
    );
  }
}

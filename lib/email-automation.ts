/**
 * Email automation for Clarity Check completions
 * - Day 1: Thank you email
 * - Day 5: Founder's rate offer email with 7-day urgency
 */

import { firebaseAdmin } from './firebaseAdmin';

const FROM_ADDRESS = 'iPurpose <renita@ipurposesoul.com>';
const SITE_URL = 'https://ipurposesoul.com';

/**
 * Check if an email address has opted out of marketing emails.
 */
async function isEmailOptedOut(email: string): Promise<boolean> {
  try {
    const db = firebaseAdmin.firestore();
    const key = Buffer.from(email.trim().toLowerCase()).toString('base64');
    const doc = await db.collection('email_opt_outs').doc(key).get();
    return doc.exists;
  } catch {
    return false; // fail open — better to send than to block on an error
  }
}

/**
 * Build a standard unsubscribe footer HTML snippet.
 */
function unsubscribeFooter(email: string): string {
  const link = `${SITE_URL}/api/unsubscribe?email=${encodeURIComponent(email)}`;
  return `<p style="margin:0;font-size:11px;color:#bbb;">
  You received this email because you signed up at ipurposesoul.com.
  &nbsp;·&nbsp;
  <a href="${link}" style="color:#bbb;text-decoration:underline;">Unsubscribe</a>
</p>`;
}

interface ClarityCheckEmailData {
  email: string;
  name: string;
  submissionId: string;
  identityType?: string;
  totalScore?: number;
}

export interface ClarityCheckScores {
  internalClarity: number;
  readinessForSupport: number;
  frictionBetweenInsightAndAction: number;
  integrationAndMomentum: number;
  totalScore: number;
}

/**
 * Notify the founder when someone takes the Clarity Check.
 * Called twice: once on quiz submit (email may be unknown), once on email capture.
 */
export async function sendFounderNotification(data: {
  submissionId: string;
  scores: ClarityCheckScores;
  resultSummary: string;
  email?: string | null;
  name?: string | null;
  identityType?: string | null;
  stage: 'quiz_completed' | 'email_captured';
}) {
  const { submissionId, scores, resultSummary, email, name, identityType, stage } = data;
  const resendApiKey = process.env.RESEND_API_KEY;
  const founderEmail = process.env.FOUNDER_NOTIFY_EMAIL || 'renita@ipurposesoul.com';

  if (!resendApiKey) {
    console.warn('[Founder] RESEND_API_KEY not configured — skipping notification.');
    return false;
  }

  const displayEmail = email || 'Not captured yet';
  const displayName = name || 'Unknown';
  const stageLabel = stage === 'email_captured'
    ? '✅ Email Captured'
    : '📋 Quiz Completed (no email yet)';
  const subjectLine = stage === 'email_captured'
    ? `✅ New Lead: ${name || email} took the Clarity Check`
    : `📋 Someone took the Clarity Check (no email yet)`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #2a2a2a; line-height: 1.6; }
  .wrap { max-width: 600px; margin: 0 auto; padding: 24px; }
  .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;
    background: ${stage === 'email_captured' ? '#d4edda' : '#fff3cd'};
    color: ${stage === 'email_captured' ? '#155724' : '#856404'}; }
  h1 { font-size: 22px; margin: 16px 0 4px; }
  .meta { background: #f5f5f5; border-radius: 8px; padding: 16px; margin: 16px 0; }
  .row { display: flex; padding: 6px 0; border-bottom: 1px solid #e8e8e8; }
  .row:last-child { border-bottom: none; }
  .label { width: 140px; font-weight: 600; color: #555; font-size: 14px; }
  .val { flex: 1; font-size: 14px; }
  .scores { background: #f9f5ff; border-radius: 8px; padding: 16px; margin: 16px 0; }
  .score-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; border-bottom: 1px solid #ede8ff; }
  .score-row:last-child { border-bottom: none; font-weight: 700; padding-top: 10px; }
  .summary-box { background: #f9f5ff; border-left: 4px solid #9C88FF; padding: 14px; border-radius: 0 8px 8px 0; font-size: 14px; margin: 16px 0; }
  .cta { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #9C88FF; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; font-size: 12px; color: #999; text-align: center; }
</style>
</head>
<body>
<div class="wrap">
  <span class="badge">${stageLabel}</span>
  <h1>New Clarity Check Submission</h1>

  <div class="meta">
    <div class="row"><div class="label">Name</div><div class="val">${displayName}</div></div>
    <div class="row"><div class="label">Email</div><div class="val">${displayEmail}</div></div>
    ${identityType ? `<div class="row"><div class="label">Identity Type</div><div class="val">${identityType}</div></div>` : ''}
    <div class="row"><div class="label">Submitted</div><div class="val">${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET</div></div>
    <div class="row"><div class="label">Stage</div><div class="val">${stageLabel}</div></div>
  </div>

  <div class="scores">
    <div class="score-row"><span>Internal Clarity</span><strong>${scores.internalClarity}</strong></div>
    <div class="score-row"><span>Readiness for Support</span><strong>${scores.readinessForSupport}</strong></div>
    <div class="score-row"><span>Friction Between Insight & Action</span><strong>${scores.frictionBetweenInsightAndAction}</strong></div>
    <div class="score-row"><span>Integration & Momentum</span><strong>${scores.integrationAndMomentum}</strong></div>
    <div class="score-row"><span>Total Score</span><strong>${scores.totalScore} / 35</strong></div>
  </div>

  <div class="summary-box">${resultSummary}</div>

  <a href="https://ipurposesoul.com/deepen/admin/intake?submission=${submissionId}" class="cta">View Full Submission →</a>

  <div class="footer"><p>Submission ID: ${submissionId}</p></div>
</div>
</body>
</html>`;

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(resendApiKey);
    const result = await resend.emails.send({
      from: 'info@ipurposesoul.com',
      to: founderEmail,
      subject: subjectLine,
      html,
    });
    console.log(`[Founder] Notification sent (${stage}):`, result);
    return true;
  } catch (error) {
    console.error(`[Founder] Failed to send notification (${stage}):`, error);
    return false;
  }
}

/**
 * Send results email to the user with their scores, summary and next step
 */
export async function sendClarityCheckResultsEmail(data: {
  email: string;
  name: string;
  scores: ClarityCheckScores;
  resultSummary: string;
  nextStep: string;
  submissionId: string;
  identityType?: string;
}) {
  const { email, name, scores, resultSummary, nextStep, submissionId, identityType } = data;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Marcellus', serif; line-height: 1.6; color: #2A2A2A; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #9C88FF; }
          .header h1 { color: #9C88FF; margin: 0; font-size: 28px; }
          .header p { color: #4B4E6D; margin: 10px 0 0 0; font-size: 14px; }
          .content { padding: 30px 0; }
          .total-score { background: linear-gradient(135deg, #9C88FF 0%, #6366b8 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
          .total-score .label { font-size: 14px; opacity: 0.9; }
          .total-score .value { font-size: 48px; font-weight: 600; margin: 5px 0 0 0; font-family: 'Italiana', serif; }
          .scores-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
          .score-box { background: #f5f5f5; padding: 14px; border-radius: 8px; text-align: center; }
          .score-box .label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
          .score-box .value { font-size: 28px; font-weight: 600; color: #9C88FF; margin: 6px 0 0 0; }
          .identity { background: rgba(156, 136, 255, 0.1); padding: 15px; border-left: 4px solid #9C88FF; margin: 20px 0; border-radius: 0 8px 8px 0; }
          .summary { background: #f9f5ff; padding: 15px; border-radius: 8px; border-left: 4px solid #9C88FF; line-height: 1.7; margin-bottom: 20px; }
          .next-step { background: #f5f5f5; padding: 15px; border-radius: 8px; line-height: 1.7; }
          .cta-button { display: inline-block; background: linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0.6)); color: white; padding: 12px 24px; border-radius: 24px; text-decoration: none; font-weight: bold; margin-top: 20px; }
          .footer { text-align: center; padding-top: 30px; border-top: 1px solid #E6C87C; font-size: 12px; color: #4B4E6D; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✨ Your Clarity Check Results</h1>
            <p>Where you are right now — ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div class="content">
            <p>Hi ${name.trim().split(/\s+/)[0].charAt(0).toUpperCase() + name.trim().split(/\s+/)[0].slice(1).toLowerCase()},</p>
            <p>Here are your full results from the Clarity Check.</p>

            <div class="total-score">
              <div class="label">Total Score</div>
              <div class="value">${scores.totalScore} / 35</div>
            </div>

            <div class="scores-grid">
              <div class="score-box"><div class="label">Internal Clarity</div><div class="value">${scores.internalClarity}</div></div>
              <div class="score-box"><div class="label">Readiness for Support</div><div class="value">${scores.readinessForSupport}</div></div>
              <div class="score-box"><div class="label">Friction Between Insight & Action</div><div class="value">${scores.frictionBetweenInsightAndAction}</div></div>
              <div class="score-box"><div class="label">Integration & Momentum</div><div class="value">${scores.integrationAndMomentum}</div></div>
            </div>

            ${identityType ? `<div class="identity"><strong>Your Identity Type: ${identityType}</strong><p style="margin: 8px 0 0 0; font-size: 14px;">This reveals how you naturally show up in the world.</p></div>` : ''}

            <h3 style="color: #4B4E6D;">Your Summary</h3>
            <div class="summary">${resultSummary}</div>

            <h3 style="color: #4B4E6D;">Your Next Step</h3>
            <div class="next-step">${nextStep}</div>

            <p style="text-align: center; margin-top: 30px;">
              <a href="https://ipurposesoul.com/clarity-check/results/${submissionId}" class="cta-button">View Your Full Results →</a>
            </p>
          </div>
          <div class="footer">
            <p>© iPurpose Soul — Where Inner Alignment Becomes Coherent Action</p>
            <p><a href="https://ipurposesoul.com" style="color: #9C88FF; text-decoration: none;">ipurposesoul.com</a></p>
            ${unsubscribeFooter(email)}
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: '✨ Your iPurpose Clarity Check Results',
      html: htmlContent,
    });
    console.log(`[Email] Results email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send results email to ${email}:`, error);
    return false;
  }
}

interface ClarityCheckEmailData {
  email: string;
  name: string;
  submissionId: string;
  identityType?: string;
  totalScore?: number;
}

/**
 * Send Day 1 Thank You Email
 */
export async function sendClarityCheckThankYouEmail(data: ClarityCheckEmailData) {
  const { email, name, submissionId, identityType } = data;
  const firstName = name ? name.trim().split(/\s+/)[0].charAt(0).toUpperCase() + name.trim().split(/\s+/)[0].slice(1).toLowerCase() : 'Friend';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Marcellus', serif; line-height: 1.6; color: #2A2A2A; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #9C88FF; }
          .header h1 { color: #9C88FF; margin: 0; font-size: 28px; }
          .header p { color: #4B4E6D; margin: 10px 0 0 0; font-size: 14px; }
          .content { padding: 30px 0; }
          .content h2 { color: #4B4E6D; font-size: 22px; }
          .content p { font-size: 16px; color: #2A2A2A; margin: 12px 0; }
          .identity { background: rgba(156, 136, 255, 0.1); padding: 15px; border-left: 4px solid #9C88FF; margin: 20px 0; }
          .identity strong { color: #9C88FF; }
          .cta-button { 
            display: inline-block; 
            background: linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0.6));
            color: white; 
            padding: 12px 24px; 
            border-radius: 24px; 
            text-decoration: none; 
            font-weight: bold;
            margin-top: 15px;
          }
          .footer { text-align: center; padding-top: 30px; border-top: 1px solid #E6C87C; font-size: 12px; color: #4B4E6D; }
          .footer p { margin: 5px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✨ You Did It</h1>
            <p>Your Clarity Check is Complete</p>
          </div>

          <div class="content">
            <p>Hi ${firstName},</p>

            <p>Thank you for taking the Clarity Check. This wasn't just a quiz—it was an act of commitment to understanding yourself more deeply.</p>

            ${
              identityType
                ? `
            <div class="identity">
              <strong>Your Identity Type:</strong> ${identityType}
              <p style="margin: 10px 0 0 0; font-size: 14px;">
                This reveals how you naturally show up in the world and where your unique gifts can shine.
              </p>
            </div>
            `
                : ''
            }

            <p>Your results are ready. They show you exactly where you stand across four dimensions of clarity:</p>
            <ul style="color: #2A2A2A;">
              <li><strong>Internal Clarity</strong> — How clear you are on who you are</li>
              <li><strong>Readiness for Support</strong> — Your openness to learning</li>
              <li><strong>Friction Between Insight & Action</strong> — The gap between knowing and doing</li>
              <li><strong>Integration & Momentum</strong> — How coherent your actions are</li>
            </ul>

            <p>These insights matter because clarity without action is just knowledge. The Starter Pack is designed to bridge that gap—turning your understanding into coherent, aligned action.</p>

            <p style="text-align: center; margin-top: 30px;">
              <a href="https://ipurposesoul.com/clarity-check/results/${submissionId}" class="cta-button">
                View Your Full Results →
              </a>
            </p>

            <p style="margin-top: 30px; font-size: 14px; color: #4B4E6D;">
              In 5 days, we'll share something special with you—a founder's rate offer on the Starter Pack. For now, sit with these results. Let them land.
            </p>
          </div>

          <div class="footer">
            <p>© iPurpose Soul — Where Inner Alignment Becomes Coherent Action</p>
            <p><a href="https://ipurposesoul.com" style="color: #9C88FF; text-decoration: none;">ipurposesoul.com</a></p>
            ${unsubscribeFooter(email)}
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: '✨ Your Clarity Check Results Are Ready',
      html: htmlContent,
    });
    console.log(`[Email] Day 1 Thank You sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send Day 1 email to ${email}:`, error);
    return false;
  }
}

/**
 * Send Day 5 Founder's Rate Offer Email
 */
export async function sendClarityCheckFoundersRateEmail(data: ClarityCheckEmailData) {
  const { email, name } = data;
  const firstName = name ? name.trim().split(/\s+/)[0].charAt(0).toUpperCase() + name.trim().split(/\s+/)[0].slice(1).toLowerCase() : 'Friend';

  const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Georgia, 'Times New Roman', serif; line-height: 1.9; color: #2A2A2A; background: #fff; }
          .container { max-width: 580px; margin: 0 auto; padding: 48px 24px; }
          p { font-size: 16px; margin: 0 0 16px 0; }
          .offer { background: rgba(156, 136, 255, 0.06); border: 1px solid #9C88FF; border-radius: 10px; padding: 24px 28px; margin: 32px 0; }
          .offer p { margin: 4px 0; }
          .price { font-size: 28px; color: #9C88FF; font-weight: bold; margin: 8px 0 4px !important; }
          .expires { font-size: 13px; color: #E74C3C; margin-top: 8px !important; }
          .cta { display: inline-block; background: #9C88FF; color: #fff; padding: 14px 36px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 16px; margin: 24px 0; }
          .divider { border: none; border-top: 1px solid #ede8f7; margin: 28px 0; }
          .footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #ede8f7; font-size: 12px; color: #bbb; text-align: center; }
          .footer a { color: #9C88FF; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <p>Hey ${firstName},</p>

          <p>A few years ago, I lost my job.</p>

          <p>And instead of just finding a new one, I spent a year trying to become what everyone else needed me to be.</p>

          <p>
            Different r&eacute;sum&eacute;.<br>
            Different pitch.<br>
            A different version of me &mdash; shaped around what fit <em>their</em> story.
          </p>

          <p>It was exhausting.<br>
          And honestly&hellip; it wasn&rsquo;t working.</p>

          <p>Then something shifted.</p>

          <p>I stopped asking, &ldquo;what do they need?&rdquo;<br>
          and started asking, &ldquo;what is actually mine to do?&rdquo;</p>

          <p>That question changed everything.</p>

          <p>iPurpose wasn&rsquo;t built as a brand. It came out of a moment &mdash; sitting in my car after another interview, wondering, &ldquo;Is there more for me than this?&rdquo; I knew I wasn&rsquo;t the only one asking that.</p>

          <hr class="divider">

          <p>You took the Clarity Check.<br>
          You saw something.<br>
          A recognition.<br>
          A shift.<br>
          A sense that the life you&rsquo;ve been fitting yourself into might not actually be yours.</p>

          <p>Most people ignore that.<br>
          They go back to what&rsquo;s familiar.<br>
          They tell themselves they&rsquo;ll figure it out later.</p>

          <p>But if you&rsquo;re still here&hellip; something in you didn&rsquo;t let it go.</p>

          <hr class="divider">

          <p>That&rsquo;s where the Starter Pack comes in.</p>

          <p>Not a course.<br>
          Not more information.<br>
          It&rsquo;s the bridge between what you felt&hellip; and what you do with it.</p>

          <div class="offer">
            <p>For the next 7 days, I&rsquo;ve opened a founder&rsquo;s rate:</p>
            <p class="price">$27 <span style="font-size:16px; color:#999; font-weight:normal; text-decoration:line-through;">$47</span></p>
            <p class="expires">⏰ Available until ${expiryDate}</p>
          </div>

          <p style="text-align:center;">
            <a href="https://ipurposesoul.com/starter-pack?utm_source=email&utm_medium=day5&utm_campaign=founders_rate" class="cta">Step into the Starter Pack &rarr;</a>
          </p>

          <p>If that tug you felt during the Clarity Check is still there, this is your next step.</p>

          <p>&mdash; Renita</p>

          <div class="footer">
            <p>&copy; iPurpose Soul &mdash; <a href="https://ipurposesoul.com">ipurposesoul.com</a></p>
            ${unsubscribeFooter(email)}
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: "🪞 I almost missed this about myself",
      html: htmlContent,
    });
    console.log(`[Email] Day 5 Founder's Rate sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send Day 5 email to ${email}:`, error);
    return false;
  }
}

const FTC_DISCLAIMER = `<p style="margin:20px 0 0 0;padding-top:16px;border-top:1px solid #eee;font-size:11px;color:#bbb;line-height:1.6;">
  <strong>Income &amp; Results Disclaimer:</strong> Results and experiences shared are individual examples and are not guaranteed. Your results will vary based on your background, experience, effort, and market conditions. iPurpose makes no assurance that you will achieve similar outcomes.
</p>`;

/**
 * Send Day 2 — What your result is actually telling you
 */
export async function sendNurtureEmail1(data: ClarityCheckEmailData) {
  const { email, name } = data;
  const firstName = name ? name.trim().split(/\s+/)[0] : 'Friend';

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <style>
      body{font-family:Georgia,'Times New Roman',serif;line-height:1.9;color:#2A2A2A;background:#fff;}
      .container{max-width:580px;margin:0 auto;padding:48px 24px;}
      p{font-size:16px;margin:0 0 16px 0;}
      .footer{margin-top:48px;padding-top:20px;border-top:1px solid #ede8f7;font-size:12px;color:#bbb;text-align:center;}
      .footer a{color:#9C88FF;text-decoration:none;}
    </style>
    </head><body><div class="container">
      <p>Hi ${firstName},</p>
      <p>A couple of days ago you found out your Identity Type.</p>
      <p>You may have read it and thought &mdash; <em>yes, that&rsquo;s me.</em> Or maybe you read it and felt something shift, like something you already knew finally had a name.</p>
      <p>Either way, I want you to sit with one thing:</p>
      <p>Your Identity Type isn&rsquo;t a personality label. It&rsquo;s a map.</p>
      <p>It tells you how you naturally create value, how you&rsquo;re wired to work, and &mdash; most importantly &mdash; why certain business models feel heavy no matter how hard you try to make them fit.</p>
      <p>The Creator type, for example, doesn&rsquo;t struggle because they lack discipline or focus. They struggle when they&rsquo;re forced into structures built for a different kind of mind. When the system wasn&rsquo;t designed for how they actually think.</p>
      <p>That&rsquo;s not a flaw. That&rsquo;s a mismatch.</p>
      <p>iPurpose exists because of that mismatch. Because the most capable, purposeful people I know aren&rsquo;t stuck because they&rsquo;re not trying hard enough. They&rsquo;re stuck because they&rsquo;ve been handed someone else&rsquo;s map.</p>
      <p>Over the next few days I want to share some things with you &mdash; not to sell you something, but because you took the time to understand yourself a little more deeply, and that deserves to be honored.</p>
      <p>More soon.</p>
      <p>With care,<br>Renita<br>Founder, iPurpose<br><a href="https://ipurposesoul.com" style="color:#9C88FF;">ipurposesoul.com</a></p>
      <div class="footer">
        <p>&copy; iPurpose Soul &mdash; <a href="https://ipurposesoul.com">ipurposesoul.com</a></p>
        ${unsubscribeFooter(email)}
      </div>
    </div></body></html>`;

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({ from: FROM_ADDRESS, to: email, subject: 'What your Clarity Check result is really telling you', html });
    console.log(`[Email] Nurture 1 (Day 2) sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send Nurture 1 to ${email}:`, error);
    return false;
  }
}

/**
 * Send Day 4 — The real reason strategies stop working
 */
export async function sendNurtureEmail2(data: ClarityCheckEmailData) {
  const { email, name } = data;
  const firstName = name ? name.trim().split(/\s+/)[0] : 'Friend';

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <style>
      body{font-family:Georgia,'Times New Roman',serif;line-height:1.9;color:#2A2A2A;background:#fff;}
      .container{max-width:580px;margin:0 auto;padding:48px 24px;}
      p{font-size:16px;margin:0 0 16px 0;}
      .footer{margin-top:48px;padding-top:20px;border-top:1px solid #ede8f7;font-size:12px;color:#bbb;text-align:center;}
      .footer a{color:#9C88FF;text-decoration:none;}
    </style>
    </head><body><div class="container">
      <p>Hi ${firstName},</p>
      <p>Here&rsquo;s something I&rsquo;ve watched happen over and over:</p>
      <p>Someone finds a strategy that works for someone else. They follow it faithfully. It produces some results &mdash; maybe even good ones at first. And then, slowly, it stops working. Or it works but feels completely unsustainable. Or it works financially but leaves them feeling hollow.</p>
      <p>So they find another strategy. And the cycle continues.</p>
      <p>What&rsquo;s rarely talked about is <em>why</em> this happens.</p>
      <p>It&rsquo;s not the strategy. It&rsquo;s the sequence.</p>
      <p>Most business frameworks start with the market &mdash; what&rsquo;s selling, what&rsquo;s trending, what the algorithm rewards. Then they ask you to fit yourself into that.</p>
      <p>iPurpose reverses it.</p>
      <p>We start with you &mdash; your values, your archetype, your energetic wiring &mdash; and build the strategy around that truth. Because a business that&rsquo;s built around who you actually are doesn&rsquo;t require you to perform a version of yourself that drains you every time you show up.</p>
      <p>It requires you to be more of who you already are.</p>
      <p>That&rsquo;s a very different kind of work. And it produces a very different kind of result.</p>
      <p>Tomorrow I&rsquo;ll share something that can help you start bridging that gap &mdash; wherever you are right now.</p>
      <p>With care,<br>Renita</p>
      <div class="footer">
        <p>&copy; iPurpose Soul &mdash; <a href="https://ipurposesoul.com">ipurposesoul.com</a></p>
        ${unsubscribeFooter(email)}
      </div>
    </div></body></html>`;

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({ from: FROM_ADDRESS, to: email, subject: 'The real reason most strategies stop working', html });
    console.log(`[Email] Nurture 2 (Day 4) sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send Nurture 2 to ${email}:`, error);
    return false;
  }
}

/**
 * Send Day 7 — What changes when you build from the inside out
 */
export async function sendNurtureEmail3(data: ClarityCheckEmailData) {
  const { email, name } = data;
  const firstName = name ? name.trim().split(/\s+/)[0] : 'Friend';

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <style>
      body{font-family:Georgia,'Times New Roman',serif;line-height:1.9;color:#2A2A2A;background:#fff;}
      .container{max-width:580px;margin:0 auto;padding:48px 24px;}
      p{font-size:16px;margin:0 0 16px 0;}
      .cta{display:inline-block;background:#9C88FF;color:#fff;padding:14px 36px;border-radius:30px;text-decoration:none;font-weight:bold;font-size:16px;margin:8px 0;}
      .footer{margin-top:48px;padding-top:20px;border-top:1px solid #ede8f7;font-size:12px;color:#bbb;text-align:center;}
      .footer a{color:#9C88FF;text-decoration:none;}
    </style>
    </head><body><div class="container">
      <p>Hi ${firstName},</p>
      <p>I want to tell you about something that happened with a client.</p>
      <p>She had been building her coaching business for two years. She had a website, an offer, a social media presence. By most external measures, she was doing everything right.</p>
      <p>But she was exhausted. And nothing was converting the way she expected.</p>
      <p>When we started working together, the first thing we did wasn&rsquo;t touch her marketing. We looked at her archetype, her values, the way she was actually wired to lead and serve.</p>
      <p>What we found was a significant mismatch. Her offer was designed for the kind of client she thought she <em>should</em> want to work with &mdash; not the ones who energized her, the ones she could genuinely transform.</p>
      <p>Once that shifted, everything else shifted with it. Her copy started sounding like her. Her content attracted different people. Her offers stopped feeling like a performance.</p>
      <p>She didn&rsquo;t work harder. She worked more like herself.</p>
      <p>That is what building from the inside out actually looks like. Not softer. Not less strategic. Just finally aligned.</p>
      <p>If any of this is resonating with you, I&rsquo;d love for you to see what the full iPurpose journey looks like. The Accelerator is where this work goes deep &mdash; six weeks, small cohort, live sessions, and a structure that begins exactly where we talked about.</p>
      <p style="text-align:center;margin:32px 0;">
        <a href="https://ipurposesoul.com/build?utm_source=email&utm_medium=nurture&utm_campaign=day7" class="cta">Learn about the Accelerator &rarr;</a>
      </p>
      <p>No pressure. Just wanted you to know it exists.</p>
      <p>With care,<br>Renita</p>
      ${FTC_DISCLAIMER}
      <div class="footer">
        <p>&copy; iPurpose Soul &mdash; <a href="https://ipurposesoul.com">ipurposesoul.com</a></p>
        ${unsubscribeFooter(email)}
      </div>
    </div></body></html>`;

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({ from: FROM_ADDRESS, to: email, subject: 'What actually changes when you build from the inside out', html });
    console.log(`[Email] Nurture 3 (Day 7) sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send Nurture 3 to ${email}:`, error);
    return false;
  }
}

/**
 * Send Day 10 — The week most programs skip (Money Healing)
 */
export async function sendNurtureEmail4(data: ClarityCheckEmailData) {
  const { email, name } = data;
  const firstName = name ? name.trim().split(/\s+/)[0] : 'Friend';

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <style>
      body{font-family:Georgia,'Times New Roman',serif;line-height:1.9;color:#2A2A2A;background:#fff;}
      .container{max-width:580px;margin:0 auto;padding:48px 24px;}
      p{font-size:16px;margin:0 0 16px 0;}
      .callout{background:rgba(156,136,255,0.06);border-left:4px solid #e6c87c;padding:20px 24px;margin:28px 0;}
      .callout p{margin:0;font-size:15px;}
      .cta{display:inline-block;background:#9C88FF;color:#fff;padding:14px 36px;border-radius:30px;text-decoration:none;font-weight:bold;font-size:16px;margin:8px 0;}
      .footer{margin-top:48px;padding-top:20px;border-top:1px solid #ede8f7;font-size:12px;color:#bbb;text-align:center;}
      .footer a{color:#9C88FF;text-decoration:none;}
    </style>
    </head><body><div class="container">
      <p>Hi ${firstName},</p>
      <p>I want to tell you about Week 2 of the iPurpose Accelerator.</p>
      <p>Most business programs don&rsquo;t include anything like it. Some would consider it too personal, too interior, too far outside the lane of &ldquo;business strategy.&rdquo;</p>
      <div class="callout"><p>We call it <strong>Money Healing.</strong></p></div>
      <p>Before you build a profitable business, you need to look honestly at the beliefs, stories, and wounds that quietly block revenue. The ones that make you underprice your offers. Over-deliver until you&rsquo;re depleted. Freeze before you hit send.</p>
      <p>These aren&rsquo;t mindset problems to be hustled through. They&rsquo;re patterns with real roots &mdash; and they show up in real business decisions every single day.</p>
      <p>Week 2 is where we surface them. Name them. Begin to move through them.</p>
      <p>I include this week because I lived it. Because I&rsquo;ve watched extraordinarily capable people undermine their own success not from lack of skill or strategy &mdash; but from unexamined stories about what they deserve, what&rsquo;s possible, what money means.</p>
      <p>You deserve a program that takes all of you seriously. Not just the strategic parts.</p>
      <p>If you&rsquo;re ready to go deeper, the Summer Cohort opens June 1st. Eight seats. Two Friday session times to choose from.</p>
      <p style="text-align:center;margin:32px 0;">
        <a href="https://ipurposesoul.com/build?utm_source=email&utm_medium=nurture&utm_campaign=day10" class="cta">Learn more about the Accelerator &rarr;</a>
      </p>
      <p>With care,<br>Renita</p>
      ${FTC_DISCLAIMER}
      <div class="footer">
        <p>&copy; iPurpose Soul &mdash; <a href="https://ipurposesoul.com">ipurposesoul.com</a></p>
        ${unsubscribeFooter(email)}
      </div>
    </div></body></html>`;

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({ from: FROM_ADDRESS, to: email, subject: 'The week most programs skip entirely', html });
    console.log(`[Email] Nurture 4 (Day 10) sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send Nurture 4 to ${email}:`, error);
    return false;
  }
}

/**
 * Send Day 14 — You're invited (workshop)
 */
export async function sendNurtureEmail5(data: ClarityCheckEmailData) {
  const { email, name } = data;
  const firstName = name ? name.trim().split(/\s+/)[0] : 'Friend';

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <style>
      body{font-family:Georgia,'Times New Roman',serif;line-height:1.9;color:#2A2A2A;background:#fff;}
      .container{max-width:580px;margin:0 auto;padding:48px 24px;}
      p{font-size:16px;margin:0 0 16px 0;}
      .workshop-box{background:rgba(156,136,255,0.06);border:1px solid #9C88FF;border-radius:8px;padding:24px 28px;margin:28px 0;}
      .workshop-box p{margin:4px 0;font-size:15px;}
      .workshop-box ul{margin:12px 0;padding-left:20px;}
      .workshop-box li{margin:6px 0;font-size:15px;}
      .cta{display:inline-block;background:#9C88FF;color:#fff;padding:14px 36px;border-radius:30px;text-decoration:none;font-weight:bold;font-size:16px;margin:8px 0;}
      .footer{margin-top:48px;padding-top:20px;border-top:1px solid #ede8f7;font-size:12px;color:#bbb;text-align:center;}
      .footer a{color:#9C88FF;text-decoration:none;}
    </style>
    </head><body><div class="container">
      <p>Hi ${firstName},</p>
      <p>Before the Summer Cohort opens, I&rsquo;m hosting a free live workshop.</p>
      <p>It&rsquo;s called <strong>Your Purpose to Income Blueprint</strong> &mdash; a 90-minute session where I&rsquo;ll walk you through the exact methodology we use inside the Accelerator, so you can see what it feels like to build from the inside out before you commit to anything.</p>
      <p>No pitch. No pressure. Just the work, live, with me.</p>
      <div class="workshop-box">
        <p><strong>Here&rsquo;s what we&rsquo;ll cover:</strong></p>
        <ul>
          <li>How to identify your Identity Type and what it means for your business model</li>
          <li>The three places most purpose-driven entrepreneurs lose momentum &mdash; and how to move through them</li>
          <li>A live look at the Soul &rarr; Systems &rarr; AI&trade; sequence and how it applies to where you are right now</li>
          <li>Time for your questions</li>
        </ul>
        <p style="margin-top:16px !important;"><strong>Date:</strong> [WORKSHOP DATE &mdash; TBD]</p>
        <p><strong>Time:</strong> [TIME] ET</p>
        <p><strong>Where:</strong> Online &mdash; free to attend</p>
      </div>
      <p style="text-align:center;margin:32px 0;">
        <a href="[WORKSHOP REGISTRATION LINK]" class="cta">Reserve your spot &rarr;</a>
      </p>
      <p>I built iPurpose because I couldn&rsquo;t find anything that held both the inner work and the real business outcomes at the same time. This workshop is a chance to experience that for yourself.</p>
      <p>I hope to see you there.</p>
      <p>With care,<br>Renita<br>Founder, iPurpose<br><a href="https://ipurposesoul.com" style="color:#9C88FF;">ipurposesoul.com</a></p>
      <p style="font-size:13px;color:#888;margin-top:24px;">P.S. If the Accelerator has been on your mind since you took the Clarity Check, the workshop is a good place to bring your questions. I&rsquo;ll stay on after for anyone who wants to talk.</p>
      <div class="footer">
        <p>&copy; iPurpose Soul &mdash; <a href="https://ipurposesoul.com">ipurposesoul.com</a></p>
        ${unsubscribeFooter(email)}
      </div>
    </div></body></html>`;

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({ from: FROM_ADDRESS, to: email, subject: "You're invited to something free", html });
    console.log(`[Email] Nurture 5 (Day 14) sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send Nurture 5 to ${email}:`, error);
    return false;
  }
}

/**
 * Schedule emails (Day 1 immediately, Day 5 after 5 days)
 */
export async function scheduleEmailSequence(data: ClarityCheckEmailData) {
  try {
    // Skip the whole sequence if the user has already opted out
    const optedOut = await isEmailOptedOut(data.email);
    if (optedOut) {
      console.log(`[Email] Skipping sequence for opted-out address: ${data.email}`);
      return true;
    }

    // Send Day 1 email immediately
    await sendClarityCheckThankYouEmail(data);

    const DAY = 24 * 60 * 60 * 1000;
    const tasks = [
      { type: 'nurture_1', delay: 2 * DAY },   // Day 2
      { type: 'nurture_2', delay: 4 * DAY },   // Day 4
      { type: 'clarity_check_founders_rate', delay: 5 * DAY }, // Day 5 — existing Starter Pack offer
      { type: 'nurture_3', delay: 7 * DAY },   // Day 7
      { type: 'nurture_4', delay: 10 * DAY },  // Day 10
      { type: 'nurture_5', delay: 14 * DAY },  // Day 14
    ];

    const db = firebaseAdmin.firestore();
    const batch = db.batch();
    for (const task of tasks) {
      const ref = db.collection('emailTasks').doc();
      batch.set(ref, {
        email: data.email,
        name: data.name,
        submissionId: data.submissionId,
        ...(data.identityType && { identityType: data.identityType }),
        ...(data.totalScore && { totalScore: data.totalScore }),
        type: task.type,
        scheduledFor: new Date(Date.now() + task.delay),
        status: 'pending',
        createdAt: new Date(),
      });
    }
    await batch.commit();

    console.log(`[Email] Scheduled full nurture sequence (6 tasks) for ${data.email}`);
    return true;
  } catch (error) {
    console.error('[Email] Failed to schedule email sequence:', error);
    return false;
  }
}

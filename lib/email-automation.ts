/**
 * Email automation for Clarity Check completions
 * - Day 1: Thank you email
 * - Day 5: Founder's rate offer email with 7-day urgency
 */

import { firebaseAdmin } from './firebaseAdmin';
import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD?.replace(/\s/g, ''), // Remove spaces from app password
  },
});

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
            <p>Hi ${name},</p>
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
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
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
            <p>Hi ${name},</p>

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
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
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

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Marcellus', serif; line-height: 1.6; color: #2A2A2A; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 30px 20px; background: linear-gradient(to right, rgba(156, 136, 255, 0.1), rgba(252, 196, 183, 0.1)); border-radius: 12px; margin-bottom: 30px; }
          .header h1 { color: #9C88FF; margin: 0; font-size: 32px; }
          .header p { color: #4B4E6D; margin: 10px 0 0 0; font-size: 16px; }
          .content { padding: 0; }
          .content h2 { color: #4B4E6D; font-size: 22px; margin-top: 0; }
          .content p { font-size: 16px; color: #2A2A2A; margin: 12px 0; }
          .offer-box { 
            background: rgba(156, 136, 255, 0.08); 
            border: 2px solid #9C88FF; 
            padding: 25px; 
            border-radius: 12px; 
            margin: 25px 0;
            text-align: center;
          }
          .price-original { font-size: 18px; color: #4B4E6D; text-decoration: line-through; margin: 0; }
          .price-founders { font-size: 42px; color: #9C88FF; font-weight: bold; margin: 10px 0; font-family: 'Italiana', serif; }
          .offer-expires { font-size: 14px; color: #E74C3C; font-weight: bold; margin-top: 15px; }
          .benefit-list { margin: 20px 0; text-align: left; }
          .benefit-list li { margin: 10px 0; font-size: 16px; }
          .cta-button { 
            display: inline-block; 
            background: linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0.6));
            color: white; 
            padding: 16px 40px; 
            border-radius: 30px; 
            text-decoration: none; 
            font-weight: bold;
            font-size: 16px;
            margin-top: 20px;
          }
          .urgency { background: rgba(231, 76, 60, 0.05); border-left: 4px solid #E74C3C; padding: 15px; margin: 20px 0; }
          .urgency p { margin: 0; font-size: 14px; color: #E74C3C; }
          .footer { text-align: center; padding-top: 30px; border-top: 1px solid #E6C87C; font-size: 12px; color: #4B4E6D; }
          .footer p { margin: 5px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>The Clarity → Action Bridge</h1>
            <p>A Founder's Special Rate (Just for You)</p>
          </div>

          <div class="content">
            <p>Hi ${name},</p>

            <p>Five days ago, you took the Clarity Check. You learned where you stand—and maybe you're thinking about what comes next.</p>

            <p>Here's the thing: clarity without a bridge to action stays stuck. The Starter Pack is that bridge.</p>

            <div class="offer-box">
              <p class="price-original">Regular price: $47</p>
              <p class="price-founders">$27</p>
              <p style="margin: 15px 0 0 0; font-size: 16px; color: #4B4E6D;"><strong>Founder's Rate</strong> — For early believers</p>
              <p class="offer-expires">⏰ Expires in 7 Days</p>
            </div>

            <h2>What You Get:</h2>
            <ul class="benefit-list">
              <li>✓ The 7-Step Clarity Framework (workbook + video)</li>
              <li>✓ Your personal Digital Insight Sheet (downloadable)</li>
              <li>✓ The "Foundation to Action" integration guide</li>
              <li>✓ Access to the iPurpose Labs (exclusive resources)</li>
            </ul>

            <p><strong>Why this matters:</strong> Most people understand themselves but never move the needle. The Starter Pack bridges that gap with a practical framework you can implement immediately.</p>

            <div class="urgency">
              <p><strong>⏰ 7-Day Founder's Rate Expires On:</strong> [DATE]</p>
              <p style="margin-top: 8px;">After that, it returns to $47. This price is reserved for people who take action now.</p>
            </div>

            <p style="text-align: center; margin-top: 40px;">
              <a href="https://ipurposesoul.com/starter-pack" class="cta-button">
                Get the Founder's Rate →
              </a>
            </p>

            <p style="margin-top: 30px; font-size: 14px; color: #4B4E6D; text-align: center;">
              Questions? Reply to this email. I read every response.
            </p>
          </div>

          <div class="footer">
            <p>© iPurpose Soul — Where Inner Alignment Becomes Coherent Action</p>
            <p><a href="https://ipurposesoul.com" style="color: #9C88FF; text-decoration: none;">ipurposesoul.com</a></p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "⏰ Your Founder's Rate is Ready ($27 for 7 Days)",
      html: htmlContent,
    });
    console.log(`[Email] Day 5 Founder's Rate sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send Day 5 email to ${email}:`, error);
    return false;
  }
}

/**
 * Schedule emails (Day 1 immediately, Day 5 after 5 days)
 */
export async function scheduleEmailSequence(data: ClarityCheckEmailData) {
  try {
    // Send Day 1 email immediately
    await sendClarityCheckThankYouEmail(data);

    // Store task in Firestore to send Day 5 email
    const emailTask = {
      email: data.email,
      name: data.name,
      submissionId: data.submissionId,
      ...(data.identityType && { identityType: data.identityType }),
      ...(data.totalScore && { totalScore: data.totalScore }),
      type: 'clarity_check_founders_rate',
      scheduledFor: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      status: 'pending',
      createdAt: new Date(),
    };

    await firebaseAdmin
      .firestore()
      .collection('emailTasks')
      .add(emailTask);

    console.log(`[Email] Scheduled Day 5 task for ${data.email}`);
    return true;
  } catch (error) {
    console.error('[Email] Failed to schedule email sequence:', error);
    return false;
  }
}

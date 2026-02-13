import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import crypto from 'crypto';

// Force this route to be dynamic (no build-time prerendering)
export const dynamic = 'force-dynamic';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  }
  return new Stripe(key);
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') || '';

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 }
    );
  }

  let event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      // Verify payment was successful
      if (session.payment_status !== 'paid') {
        console.warn('Session not paid, skipping:', session.id);
        return NextResponse.json({ received: true });
      }

      // Extract data
      const customerId = session.customer as string;
      const email = session.customer_details?.email;
      const sessionId = session.id;
      const product = session.metadata?.product || 'accelerator';
      const cohort = session.metadata?.cohort || 'founding-2026';
      const cohortStartDate = session.metadata?.cohortStartDate || '';

      if (!customerId || !email) {
        console.warn('Missing customer or email in session:', sessionId);
        return NextResponse.json({ received: true });
      }

      // Write enrollment record to Firestore
      const db = firebaseAdmin.firestore();
      const enrollmentRef = db.collection('enrollments').doc(sessionId);

      await enrollmentRef.set({
        checkoutSessionId: sessionId,
        stripeCustomerId: customerId,
        email,
        product,
        cohort,
        cohortStartDate,
        status: 'paid',
        createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      });

      console.log('Enrollment recorded:', sessionId);

      // Map Stripe product keys to entitlement field names
      const PRODUCT_ENTITLEMENT_MAP: Record<string, string> = {
        'starter_pack': 'starterPack',
        'ai_blueprint': 'aiBlueprint',
        'accelerator': 'accelerator',
        'deepen_membership': 'deepen',
      };

      const entitlementKey = PRODUCT_ENTITLEMENT_MAP[product] || product;

      // Attempt to upsert user entitlement by matching users.email === customer email
      try {
        if (!email) throw new Error('No customer email available for entitlement upsert');

        const usersRef = db.collection('users');
        const querySnapshot = await usersRef.where('email', '==', email).limit(1).get();

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const uid = userDoc.id;
          await usersRef.doc(uid).set(
            {
              entitlements: {
                ...(userDoc.get('entitlements') || {}),
                [entitlementKey]: true,
              },
              [`${entitlementKey}PurchaseSessionId`]: sessionId,
              updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
          console.log(`${entitlementKey} entitlement set for uid=${uid}`);
        } else {
          // No matching user found — record a pending entitlement keyed by hashed email
          try {
            const normalized = String(email).trim().toLowerCase();
            const emailHash = crypto.createHash('sha256').update(normalized).digest('hex');
            const pendingRef = db.collection('pending_entitlements').doc(emailHash);

            await pendingRef.set(
              {
                email: normalized,
                entitlements: {
                  [entitlementKey]: true,
                },
                sessions: firebaseAdmin.firestore.FieldValue.arrayUnion(sessionId),
                product,
                cohort,
                createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
                claimed: false,
              },
              { merge: true }
            );

            console.log(`pending entitlement (${entitlementKey}) created for email=${email}`);
          } catch (hashErr) {
            console.error('Error creating pending entitlement:', hashErr);
          }
        }
      } catch (upsertErr) {
        console.error('Error upserting user entitlement:', upsertErr);
      }

      // Product display names and destination URLs
      const PRODUCT_DISPLAY_NAMES: Record<string, string> = {
        'starter_pack': 'Starter Pack',
        'ai_blueprint': 'AI Blueprint',
        'accelerator': 'Accelerator',
        'deepen_membership': 'Deepen Membership',
      };
      const PRODUCT_URLS: Record<string, string> = {
        'starter_pack': '/starter-pack',
        'ai_blueprint': '/ai-blueprint',
        'accelerator': '/accelerator',
        'deepen_membership': '/deepen',
      };
      const productDisplayName = PRODUCT_DISPLAY_NAMES[product] || product;
      const productPath = PRODUCT_URLS[product] || '/';

      // Send fulfillment email (if configured)
      try {
        const resendApiKey = process.env.RESEND_API_KEY;
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@ipurposesoul.com';
        const replyTo = process.env.FOUNDER_NOTIFY_EMAIL || 'renita@ipurposesoul.com';
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ipurposesoul.com';
        const productUrl = `${siteUrl}${productPath}`;
        const firstName = session.customer_details?.name?.split(' ')[0] || '';

        if (!resendApiKey) {
          console.warn('RESEND_API_KEY not configured. Skipping fulfillment email.');
        } else if (email) {
          const { Resend } = await import('resend');
          const resend = new Resend(resendApiKey);

          let emailSubject: string;
          let emailHtml: string;

          if (product === 'starter_pack') {
            // Branded Starter Pack welcome email
            emailSubject = `Welcome to the iPurpose Starter Pack${firstName ? `, ${firstName}` : ''} ✨`;
            emailHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background: #f8f6f3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #2A2A2A; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #ffffff; border-radius: 16px; padding: 40px 32px; box-shadow: 0 4px 24px rgba(156, 136, 255, 0.08); }
    .logo { text-align: center; margin-bottom: 24px; }
    .logo-text { font-size: 28px; font-weight: 700; color: #6B5B95; letter-spacing: 1px; }
    .tagline { text-align: center; font-size: 14px; color: #9C88FF; font-style: italic; margin-bottom: 32px; }
    h1 { font-size: 24px; color: #2A2A2A; margin: 0 0 16px 0; line-height: 1.3; }
    p { font-size: 16px; line-height: 1.7; color: #444; margin: 0 0 16px 0; }
    .highlight { background: linear-gradient(135deg, rgba(156,136,255,0.08), rgba(230,200,124,0.08)); border-left: 4px solid #9C88FF; padding: 16px 20px; border-radius: 8px; margin: 24px 0; }
    .highlight p { margin: 0; font-size: 15px; color: #555; }
    .cta { display: inline-block; background: linear-gradient(135deg, #9C88FF, #6B5B95); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600; font-size: 16px; margin: 24px 0; }
    .steps { margin: 24px 0; }
    .step { display: flex; align-items: flex-start; margin-bottom: 12px; }
    .step-num { background: #9C88FF; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; margin-right: 12px; flex-shrink: 0; }
    .step-text { font-size: 15px; color: #444; padding-top: 3px; }
    .divider { height: 1px; background: linear-gradient(90deg, transparent, #e5e1f5, transparent); margin: 28px 0; }
    .footer { text-align: center; font-size: 13px; color: #999; margin-top: 24px; }
    .footer a { color: #9C88FF; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="logo">
        <div class="logo-text">iPurpose</div>
      </div>
      <div class="tagline">Where Alignment Meets Action</div>

      <h1>${firstName ? `${firstName}, your` : 'Your'} Starter Pack is ready ✨</h1>

      <p>Thank you for investing in yourself. The iPurpose Starter Pack is a guided workbook designed to help you uncover your purpose, clarify your values, and take aligned action.</p>

      <div class="highlight">
        <p><strong>Your workbook saves automatically</strong> — you can come back anytime and pick up right where you left off.</p>
      </div>

      <p><strong>Here's what's inside:</strong></p>

      <div class="steps">
        <div class="step"><span class="step-num">1</span><span class="step-text">Grounding in the Present</span></div>
        <div class="step"><span class="step-num">2</span><span class="step-text">Vision Alignment</span></div>
        <div class="step"><span class="step-num">3</span><span class="step-text">Self-Discovery & Alignment</span></div>
        <div class="step"><span class="step-num">4</span><span class="step-text">Core Values & Passions</span></div>
        <div class="step"><span class="step-num">5</span><span class="step-text">Energy & Flow</span></div>
        <div class="step"><span class="step-num">6</span><span class="step-text">Purpose in Action</span></div>
        <div class="step"><span class="step-num">7</span><span class="step-text">Integration & Next Steps</span></div>
      </div>

      <div style="text-align:center;">
        <a href="${productUrl}" class="cta">Open Your Starter Pack →</a>
      </div>

      <p style="font-size:14px;color:#777;margin-top:24px;">If you haven't created an account yet, <a href="${siteUrl}/signup?next=${encodeURIComponent(productPath)}" style="color:#9C88FF;">sign up here</a> using the same email you purchased with (<strong>${email}</strong>).</p>

      <div class="divider"></div>

      <p style="font-size:14px;color:#777;">Questions? Just reply to this email — I read every message.</p>
      <p style="font-size:14px;color:#777;">With purpose,<br><strong>Renita Hamilton</strong><br>Founder, iPurpose</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} iPurpose · <a href="${siteUrl}">ipurposesoul.com</a></p>
    </div>
  </div>
</body>
</html>`;
          } else {
            // Generic fulfillment email for other products
            emailSubject = `Your iPurpose ${productDisplayName}`;
            emailHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#222;background:#f8f6f3;margin:0;padding:0}.wrapper{max-width:600px;margin:0 auto;padding:40px 20px}.card{background:#fff;border-radius:16px;padding:40px 32px;box-shadow:0 4px 24px rgba(156,136,255,0.08)}.logo{text-align:center;font-size:28px;font-weight:700;color:#6B5B95;margin-bottom:8px}.tagline{text-align:center;font-size:14px;color:#9C88FF;font-style:italic;margin-bottom:32px}h2{color:#2A2A2A;margin:0 0 16px}p{font-size:16px;line-height:1.7;color:#444;margin:0 0 16px}.cta{display:inline-block;background:linear-gradient(135deg,#9C88FF,#6B5B95);color:#fff!important;text-decoration:none;padding:14px 32px;border-radius:50px;font-weight:600;font-size:16px;margin:16px 0}.footer{text-align:center;font-size:13px;color:#999;margin-top:24px}</style></head>
<body><div class="wrapper"><div class="card">
<div class="logo">iPurpose</div><div class="tagline">Where Alignment Meets Action</div>
<h2>${firstName ? `${firstName}, your` : 'Your'} ${productDisplayName} is ready</h2>
<p>Thank you for your purchase! Access your ${productDisplayName} here:</p>
<div style="text-align:center"><a href="${productUrl}" class="cta">Open ${productDisplayName} →</a></div>
<p style="font-size:14px;color:#777">If you don't have an account yet, <a href="${siteUrl}/signup?next=${encodeURIComponent(productPath)}" style="color:#9C88FF">sign up here</a> using <strong>${email}</strong>.</p>
<p style="font-size:14px;color:#777">Questions? Reply to this email — we're here to help.</p>
</div><div class="footer">© ${new Date().getFullYear()} iPurpose · <a href="${siteUrl}" style="color:#9C88FF">ipurposesoul.com</a></div></div>
</body></html>`;
          }

          const result = await resend.emails.send({
            from: fromEmail,
            replyTo,
            to: email,
            subject: emailSubject,
            html: emailHtml,
          });

          console.log(`${productDisplayName} fulfillment email sent:`, result);
        }
      } catch (emailErr) {
        console.error('Error sending fulfillment email:', emailErr);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    );
  }
}

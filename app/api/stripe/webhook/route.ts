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
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ipurposesoul.com';
        const productUrl = `${siteUrl}${productPath}`;

        if (!resendApiKey) {
          console.warn('RESEND_API_KEY not configured. Skipping fulfillment email.');
        } else if (email) {
          const { Resend } = await import('resend');
          const resend = new Resend(resendApiKey);

          const emailHtml = `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#222} .container{max-width:600px;margin:0 auto;padding:20px}</style></head><body><div class="container"><h2>Your ${productDisplayName}</h2><p>Thanks for your purchase! Access your ${productDisplayName} here:</p><p><a href="${productUrl}" target="_blank">Go to ${productDisplayName}</a></p><p>If you don't have an account yet, <a href="${siteUrl}/signup?next=${encodeURIComponent(productPath)}">create one here</a> using the same email you purchased with.</p><p>If you have any trouble, reply to this email and we'll help.</p><p>— iPurpose Team</p></div></body></html>`;

          const result = await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: `Your iPurpose ${productDisplayName}`,
            html: emailHtml,
          });

          console.log(`${productDisplayName} fulfillment email sent:`, result);
        }
      } catch (emailErr) {
        console.error('Error sending Starter Pack email:', emailErr);
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

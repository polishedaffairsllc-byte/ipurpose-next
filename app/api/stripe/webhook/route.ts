import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { firebaseAdmin } from '@/lib/firebaseAdmin';

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
      const cohort = session.metadata?.cohort || '2026-03';

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
        status: 'paid',
        createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      });

      console.log('Enrollment recorded:', sessionId);
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

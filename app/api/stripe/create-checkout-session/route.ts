import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

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
  try {
    if (!process.env.STRIPE_PRICE_ID_6WEEK) {
      return NextResponse.json(
        { error: 'Stripe price ID not configured' },
        { status: 500 }
      );
    }

    const stripe = getStripe();

    const body = await request.json();
    const { product = '6-week', cohort = '2026-03' } = body;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID_6WEEK,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/enroll/create-account?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/program`,
      customer_creation: 'always',
      metadata: {
        product,
        cohort,
      },
    });

    if (!session.url) {
      throw new Error('No checkout URL returned from Stripe');
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Stripe checkout session creation error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: errorMessage },
      { status: 500 }
    );
  }
}

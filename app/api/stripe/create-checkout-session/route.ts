import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Force this route to be dynamic (no build-time prerendering)
export const dynamic = 'force-dynamic';

// Product to price ID mapping
const PRODUCT_PRICE_MAP: { [key: string]: string } = {
  'starter_pack': 'STRIPE_PRICE_STARTER_PACK',
  'ai_blueprint': 'STRIPE_PRICE_ID_AI_BLUEPRINT',
  'accelerator': 'STRIPE_PRICE_ID_ACCELERATOR',
};

// Product to success URL mapping
const PRODUCT_SUCCESS_URL_MAP: { [key: string]: string } = {
  'starter_pack': '/purchase/success?product=starter_pack',
  'ai_blueprint': '/purchase/success?product=ai_blueprint',
  'accelerator': '/enroll/create-account?session_id={CHECKOUT_SESSION_ID}',
};

// Product to cancel URL mapping
const PRODUCT_CANCEL_URL_MAP: { [key: string]: string } = {
  'starter_pack': '/starter-pack',
  'ai_blueprint': '/ai-blueprint',
  'accelerator': '/program',
};

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  }
  return new Stripe(key);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product = 'accelerator', cohort = '2026-03' } = body;

    // Validate product
    if (!PRODUCT_PRICE_MAP[product]) {
      console.error(`Invalid product requested: ${product}`);
      return NextResponse.json(
        { error: `Unknown product: ${product}. Supported products: ${Object.keys(PRODUCT_PRICE_MAP).join(', ')}` },
        { status: 400 }
      );
    }

    // Get price ID from environment
    const priceEnvVar = PRODUCT_PRICE_MAP[product];
    const priceId = process.env[priceEnvVar];

    if (!priceId) {
      console.error(`Missing environment variable: ${priceEnvVar}`);
      return NextResponse.json(
        { error: `Stripe price ID not configured for product: ${product}` },
        { status: 500 }
      );
    }

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Get success and cancel URLs
    let successUrl = PRODUCT_SUCCESS_URL_MAP[product] || '/';
    const cancelUrl = PRODUCT_CANCEL_URL_MAP[product] || '/';

    // For accelerator, preserve the session ID placeholder
    if (product === 'accelerator') {
      successUrl = `${appUrl}/enroll/create-account?session_id={CHECKOUT_SESSION_ID}`;
    } else {
      successUrl = `${appUrl}${successUrl}`;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: `${appUrl}${cancelUrl}`,
      customer_creation: 'always',
      allow_promotion_codes: true,
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

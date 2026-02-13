import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getEnrollableCohort } from '@/lib/accelerator/stages';

export const dynamic = 'force-dynamic';

const PRODUCT_PRICE_MAP: { [key: string]: string } = {
  'starter_pack': 'STRIPE_PRICE_STARTER_PACK',
  'ai_blueprint': 'STRIPE_PRICE_ID_AI_BLUEPRINT',
  'accelerator': 'STRIPE_PRICE_ID_6WEEK',
  'deepen_membership': 'STRIPE_PRICE_ID_DEEPEN',
};

const PRODUCT_SUCCESS_URL_MAP: { [key: string]: string } = {
  'starter_pack': '/purchase/success?product=starter_pack&session_id={CHECKOUT_SESSION_ID}',
  'ai_blueprint': '/purchase/success?product=ai_blueprint&session_id={CHECKOUT_SESSION_ID}',
  'accelerator': '/enroll/create-account?session_id={CHECKOUT_SESSION_ID}',
  'deepen_membership': '/deepen?welcome=true',
};

const PRODUCT_CANCEL_URL_MAP: { [key: string]: string } = {
  'starter_pack': '/starter-pack',
  'ai_blueprint': '/ai-blueprint',
  'accelerator': '/program',
  'deepen_membership': '/deepen',
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
    // Accept form-encoded POSTs from non-JS clients
    const form = await request.formData();
    const product = (form.get('product') as string) || 'starter_pack';

    const enrollableCohort = getEnrollableCohort();
    const cohort = enrollableCohort.id;

    if (!PRODUCT_PRICE_MAP[product]) {
      return NextResponse.json({ error: `Unknown product: ${product}` }, { status: 400 });
    }

    const priceEnvVar = PRODUCT_PRICE_MAP[product];
    const priceId = process.env[priceEnvVar as keyof NodeJS.ProcessEnv];
    if (!priceId) {
      return NextResponse.json({ error: `Stripe price ID not configured for product: ${product}` }, { status: 500 });
    }

    const stripe = getStripe();

    // Determine base URL from headers
    const headers = request.headers;
    const proto = headers.get('x-forwarded-proto') || 'https';
    const host = headers.get('x-forwarded-host') || headers.get('host') || 'localhost:3000';
    let baseUrl = `${proto}://${host}`;

    const stripeKey = process.env.STRIPE_SECRET_KEY || '';
    const isLiveMode = stripeKey.startsWith('sk_live_');
    const allowlist = [
      'https://ipurposesoul.com',
      'https://ipurposesoul.online',
      'https://mshmltn.com',
    ];

    if (isLiveMode && (host.includes('localhost') || host.includes('127.0.0.1'))) {
      baseUrl = allowlist[0];
    }
    if (isLiveMode && !allowlist.some((a) => baseUrl.startsWith(a))) {
      baseUrl = allowlist[0];
    }

    let successUrl;
    if (product === 'accelerator') {
      successUrl = `${baseUrl}/enroll/create-account?session_id={CHECKOUT_SESSION_ID}`;
    } else {
      successUrl = `${baseUrl}${PRODUCT_SUCCESS_URL_MAP[product] || '/'}
`;
    }
    const cancelUrl = `${baseUrl}${PRODUCT_CANCEL_URL_MAP[product] || '/'}
`;

    const isSubscription = product === 'deepen_membership';

    const session = await stripe.checkout.sessions.create({
      mode: isSubscription ? 'subscription' : 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      ...(isSubscription ? {} : { customer_creation: 'always' }),
      allow_promotion_codes: true,
      metadata: { product, cohort, cohortStartDate: enrollableCohort.startDate },
    });

    if (!session.url) throw new Error('No checkout URL returned from Stripe');

    return NextResponse.redirect(session.url);
  } catch (err) {
    console.error('Form checkout error:', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'Failed to create checkout session', details: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getEnrollableCohort } from '@/lib/accelerator/stages';
import { firebaseAdmin } from '@/lib/firebaseAdmin';

// Force this route to be dynamic (no build-time prerendering)
export const dynamic = 'force-dynamic';

// Product to price ID mapping
const PRODUCT_PRICE_MAP: { [key: string]: string } = {
  'starter_pack': 'STRIPE_PRICE_STARTER_PACK',
  'ai_blueprint': 'STRIPE_PRICE_ID_AI_BLUEPRINT',
  'accelerator': 'STRIPE_PRICE_ID_6WEEK',           // regular $1,997
  'deepen_membership': 'STRIPE_PRICE_ID_DEEPEN',
};

// Early-bird price ID (first 4 seats at $1,497)
const ACCELERATOR_EARLY_BIRD_PRICE_ENV = 'STRIPE_PRICE_ID_ACCELERATOR_EARLY_BIRD';
const ACCELERATOR_EARLY_BIRD_SEATS = 4;
const ACCELERATOR_REGULAR_PRICE = 1997;
const ACCELERATOR_EARLY_BIRD_PRICE = 1497;

// Product pricing for event tracking
const PRODUCT_PRICING: { [key: string]: number } = {
  'starter_pack': 27,
  'ai_blueprint': 47,
  'accelerator': ACCELERATOR_REGULAR_PRICE,
  'deepen_membership': 0, // subscription, no fixed price here
};

// Product display names
const PRODUCT_NAMES: { [key: string]: string } = {
  'starter_pack': 'Starter Pack',
  'ai_blueprint': 'AI Blueprint',
  'accelerator': 'Accelerator',
  'deepen_membership': 'Deepen Membership',
};

// Product to success URL mapping
const PRODUCT_SUCCESS_URL_MAP: { [key: string]: string } = {
  'starter_pack': '/purchase/success?product=starter_pack&session_id={CHECKOUT_SESSION_ID}',
  'ai_blueprint': '/purchase/success?product=ai_blueprint&session_id={CHECKOUT_SESSION_ID}',
  'accelerator': '/enroll/create-account?session_id={CHECKOUT_SESSION_ID}',
  'deepen_membership': '/deepen?welcome=true',
};

// Product to cancel URL mapping
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
    const body = await request.json();
    const { product = 'accelerator' } = body;
    // Resolve cohort from the live schedule (not from client)
    const enrollableCohort = getEnrollableCohort();
    const cohort = enrollableCohort.id;

    // Validate product
    if (!PRODUCT_PRICE_MAP[product]) {
      console.error(`Invalid product requested: ${product}`);
      return NextResponse.json(
        { error: `Unknown product: ${product}. Supported products: ${Object.keys(PRODUCT_PRICE_MAP).join(', ')}` },
        { status: 400 }
      );
    }

    // Get price ID from environment
    let priceEnvVar = PRODUCT_PRICE_MAP[product];

    // For accelerator: check if early-bird seats are still available
    let effectivePrice = PRODUCT_PRICING[product] || 0;
    if (product === 'accelerator') {
      const earlyBirdPriceId = process.env[ACCELERATOR_EARLY_BIRD_PRICE_ENV];
      if (earlyBirdPriceId) {
        try {
          const db = firebaseAdmin.firestore();
          const enrollmentsSnap = await db
            .collection('enrollments')
            .where('product', '==', 'accelerator')
            .where('cohort', '==', cohort)
            .count()
            .get();
          const enrolledCount = enrollmentsSnap.data().count;
          if (enrolledCount < ACCELERATOR_EARLY_BIRD_SEATS) {
            priceEnvVar = ACCELERATOR_EARLY_BIRD_PRICE_ENV;
            effectivePrice = ACCELERATOR_EARLY_BIRD_PRICE;
            console.log(`[Accelerator] Early bird pricing applied (${enrolledCount}/${ACCELERATOR_EARLY_BIRD_SEATS} seats taken)`);
          } else {
            console.log(`[Accelerator] Regular pricing applied (${enrolledCount} enrolled, early bird closed)`);
          }
        } catch (e) {
          console.warn('[Accelerator] Could not fetch enrollment count, falling back to regular price:', e);
        }
      }
    }

    const priceId = process.env[priceEnvVar];

    if (!priceId) {
      console.error(`Missing environment variable: ${priceEnvVar}`);
      return NextResponse.json(
        { error: `Stripe price ID not configured for product: ${product}` },
        { status: 500 }
      );
    }

    const stripe = getStripe();

    // Dynamically determine domain from request headers
    const headers = request.headers;
    const proto = headers.get('x-forwarded-proto') || 'https';
    const host = headers.get('x-forwarded-host') || headers.get('host') || 'localhost:3000';
    let baseUrl = `${proto}://${host}`;

    // Stripe livemode check
    const stripeKey = process.env.STRIPE_SECRET_KEY || '';
    const isLiveMode = stripeKey.startsWith('sk_live_');
    const allowlist = [
      'https://ipurposesoul.com',
      'https://ipurposesoul.online',
      'https://mshmltn.com',
    ];

    // If in live mode and host is localhost/127.0.0.1, force to primary domain
    if (isLiveMode && (host.includes('localhost') || host.includes('127.0.0.1'))) {
      baseUrl = allowlist[0]; // primary domain
    }

    // If in live mode and host is not in allowlist, fallback to primary domain
    if (isLiveMode && !allowlist.some((allowed) => baseUrl.startsWith(allowed))) {
      baseUrl = allowlist[0];
    }

    // Log chosen base URL and incoming host/proto
    console.log('[Stripe Checkout] Base URL:', baseUrl, '| Incoming host:', host, '| Proto:', proto);

    // Get success and cancel URLs
    // Note: {CHECKOUT_SESSION_ID} is a Stripe template variable that Stripe replaces
    // with the actual session ID when redirecting the customer after payment.
    let successUrlPath = PRODUCT_SUCCESS_URL_MAP[product] || '/';
    let cancelUrlPath = PRODUCT_CANCEL_URL_MAP[product] || '/';

    const successUrl = `${baseUrl}${successUrlPath}`;
    const cancelUrl = `${baseUrl}${cancelUrlPath}`;

    const isSubscription = product === 'deepen_membership';

    const session = await stripe.checkout.sessions.create({
      mode: isSubscription ? 'subscription' : 'payment',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      ...(isSubscription ? {} : { customer_creation: 'always' }),
      allow_promotion_codes: true,
      metadata: {
        product,
        cohort,
        cohortStartDate: enrollableCohort.startDate,
      },
    });

    if (!session.url) {
      throw new Error('No checkout URL returned from Stripe');
    }

    // Log checkout event for analytics tracking
    const eventName = `${product}_checkout_started`;
    const price = product === 'accelerator' ? effectivePrice : (PRODUCT_PRICING[product] || 0);
    const productName = PRODUCT_NAMES[product] || product;
    
    console.log('[Analytics Event]', {
      event: eventName,
      product,
      productName,
      price,
      currency: 'USD',
      sessionId: session.id,
      cohort,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ 
      url: session.url, 
      sessionId: session.id,
      // Include event tracking info for client-side GTM integration
      analyticsEvent: {
        name: eventName,
        data: {
          product,
          productName,
          value: price,
          currency: 'USD',
        }
      }
    });
  } catch (error) {
    console.error('Stripe checkout session creation error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: errorMessage },
      { status: 500 }
    );
  }
}

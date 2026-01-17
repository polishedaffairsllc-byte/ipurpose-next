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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { verified: false, error: 'Missing session_id' },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Retrieve session with line items expanded
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });

    // Verify payment status
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { verified: false, error: 'Payment not completed', status: session.payment_status },
        { status: 400 }
      );
    }

    // Verify it's a payment mode session
    if (session.mode !== 'payment') {
      return NextResponse.json(
        { verified: false, error: 'Invalid session mode' },
        { status: 400 }
      );
    }

    // Optional: Verify line items include the 6-week price
    if (process.env.STRIPE_PRICE_ID_6WEEK && session.line_items) {
      const hasValidPrice = session.line_items.data.some(
        (item: any) => item.price?.id === process.env.STRIPE_PRICE_ID_6WEEK
      );

      if (!hasValidPrice) {
        return NextResponse.json(
          { verified: false, error: 'Invalid product in order' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      verified: true,
      sessionId: session.id,
      customerId: session.customer,
      email: session.customer_details?.email,
      product: session.metadata?.product || '6-week',
      cohort: session.metadata?.cohort || '2026-03',
    });
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json(
      { verified: false, error: 'Failed to verify session' },
      { status: 500 }
    );
  }
}

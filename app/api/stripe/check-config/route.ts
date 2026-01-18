import { NextResponse } from 'next/server';

// Diagnostic endpoint to check which Stripe price IDs are configured
// Remove this after troubleshooting
export async function GET() {
  const config = {
    STRIPE_PRICE_ID_STARTER_PACK: process.env.STRIPE_PRICE_ID_STARTER_PACK ? '✅ SET' : '❌ MISSING',
    STRIPE_PRICE_ID_AI_BLUEPRINT: process.env.STRIPE_PRICE_ID_AI_BLUEPRINT ? '✅ SET' : '❌ MISSING',
    STRIPE_PRICE_ID_ACCELERATOR: process.env.STRIPE_PRICE_ID_ACCELERATOR ? '✅ SET' : '❌ MISSING',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? '✅ SET' : '❌ MISSING',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'not set',
  };

  return NextResponse.json(config);
}

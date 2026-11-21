import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { verifiedWebsitePurchase } from '@/lib/verifiedWebsitePurchase';

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = (await cookies()).get('FirebaseSession')?.value;
    if (!sessionCookie) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
    let uid: string;
    try { uid = (await firebaseAdmin.auth().verifySessionCookie(sessionCookie, true)).uid; }
    catch { return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 }); }
    const { sessionId } = await request.json();
    if (typeof sessionId !== 'string' || !sessionId.startsWith('cs_')) return NextResponse.json({ error: 'Invalid checkout session.' }, { status: 400 });
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('Stripe is not configured');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const [session, account] = await Promise.all([
      stripe.checkout.sessions.retrieve(sessionId, { expand: ['line_items'] }),
      firebaseAdmin.auth().getUser(uid),
    ]);
    const purchase = verifiedWebsitePurchase(session, account, {
      starter_pack: [process.env.STRIPE_PRICE_STARTER_PACK || ''],
      ai_blueprint: [process.env.STRIPE_PRICE_ID_AI_BLUEPRINT || ''],
      accelerator: [process.env.STRIPE_PRICE_ID_6WEEK || '', process.env.STRIPE_PRICE_ID_ACCELERATOR_EARLY_BIRD || ''],
    });
    if (!purchase) return NextResponse.json({ error: 'Verify the email used for your purchase and try again. Contact support if you need help.' }, { status: 403 });
    const tierMap: Record<string, string> = { accelerator: 'ACCELERATOR', starter_pack: 'STARTER_PACK', ai_blueprint: 'AI_BLUEPRINT' };
    await firebaseAdmin.firestore().collection('users').doc(uid).set({
      email: purchase.email,
      entitlement: { tier: tierMap[purchase.product], status: 'active', product: purchase.product, cohort: purchase.cohort, cohortId: purchase.cohort, cohortStartDate: purchase.cohortStartDate, checkoutSessionId: purchase.sessionId, stripeCustomerId: purchase.customerId },
      updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Purchase claim failed:', error);
    return NextResponse.json({ error: 'Could not confirm your purchase. Please try again or contact support.' }, { status: 500 });
  }
}

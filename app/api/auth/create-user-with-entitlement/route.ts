import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { verifiedWebsitePurchase } from '@/lib/verifiedWebsitePurchase';
import { canGrantWebsiteOrder } from '@/lib/websiteOrder';

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
      stripe.checkout.sessions.retrieve(sessionId, { expand: ['line_items', 'payment_intent.latest_charge'] }),
      firebaseAdmin.auth().getUser(uid),
    ]);
    const purchase = verifiedWebsitePurchase(session, account, {
      starter_pack: [process.env.STRIPE_PRICE_STARTER_PACK || ''],
      ai_blueprint: [process.env.STRIPE_PRICE_ID_AI_BLUEPRINT || ''],
      accelerator: [process.env.STRIPE_PRICE_ID_6WEEK || '', process.env.STRIPE_PRICE_ID_ACCELERATOR_EARLY_BIRD || ''],
    });
    if (!purchase) return NextResponse.json({ error: 'Verify the email used for your purchase and try again. Contact support if you need help.' }, { status: 403 });
    const intent = session.payment_intent;
    const charge = intent && typeof intent !== 'string' ? intent.latest_charge : null;
    if (!charge || typeof charge === 'string' || !charge.paid || charge.refunded || charge.amount_refunded >= charge.amount) {
      return NextResponse.json({ error: 'This payment is no longer eligible for access. Contact support if you need help.' }, { status: 403 });
    }
    const tierMap: Record<string, string> = { accelerator: 'ACCELERATOR', starter_pack: 'STARTER_PACK', ai_blueprint: 'AI_BLUEPRINT' };
    const entitlementKeys: Record<string, string> = { accelerator: 'accelerator', starter_pack: 'starterPack', ai_blueprint: 'aiBlueprint' };
    const key = entitlementKeys[purchase.product];
    const db = firebaseAdmin.firestore();
    const userRef = db.collection('users').doc(uid);
    const granted = await db.runTransaction(async tx => {
      const [user, eligible] = await Promise.all([tx.get(userRef), canGrantWebsiteOrder(tx, db, purchase.sessionId)]);
      if (!eligible) return false;
      const profile = user.data();
      const current = profile?.entitlement;
      const preserveTier = current?.status === 'active' && current?.tier !== tierMap[purchase.product];
      const timestamp = firebaseAdmin.firestore.FieldValue.serverTimestamp();
      tx.set(userRef, {
        email: purchase.email,
        entitlements: { ...profile?.entitlements, [key]: true },
        [`${key}PurchaseSessionId`]: purchase.sessionId,
        ...(!preserveTier ? { entitlement: { tier: tierMap[purchase.product], status: 'active', product: purchase.product, cohort: purchase.cohort, cohortId: purchase.cohort, cohortStartDate: purchase.cohortStartDate, checkoutSessionId: purchase.sessionId, stripeCustomerId: purchase.customerId } } : {}),
        updatedAt: timestamp,
      }, { merge: true });
      tx.set(db.collection('enrollments').doc(purchase.sessionId), {
        checkoutSessionId: purchase.sessionId,
        stripeCustomerId: purchase.customerId,
        email: purchase.email,
        product: purchase.product,
        cohort: purchase.cohort,
        cohortStartDate: purchase.cohortStartDate,
        status: 'paid',
        updatedAt: timestamp,
      }, { merge: true });
      return true;
    });
    if (!granted) return NextResponse.json({ error: 'This order cannot be claimed. Contact support if you need help.' }, { status: 403 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Purchase claim failed:', error);
    return NextResponse.json({ error: 'Could not confirm your purchase. Please try again or contact support.' }, { status: 500 });
  }
}

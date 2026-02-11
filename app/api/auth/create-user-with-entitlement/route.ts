import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('FirebaseSession')?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'No session cookie' },
        { status: 401 }
      );
    }

    // Verify session is valid
    let decodedClaim;
    try {
      decodedClaim = await firebaseAdmin.auth().verifySessionCookie(sessionCookie, true);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { uid, email, sessionId, customerId, product, cohort, cohortStartDate } = body;

    // Verify UID matches session
    if (uid !== decodedClaim.uid) {
      return NextResponse.json(
        { error: 'UID mismatch' },
        { status: 403 }
      );
    }

    // Map product to entitlement tier
    const tierMap: Record<string, string> = {
      accelerator: 'ACCELERATOR',
      deepen_membership: 'DEEPENING',
    };
    const tier = tierMap[product] || product?.toUpperCase() || 'ACCELERATOR';

    // Write user document with entitlement
    // cohort = the unified cohortId (e.g. "founding-2026")
    // cohortStartDate = ISO date persisted for resilience against schedule changes
    const db = firebaseAdmin.firestore();
    await db.collection('users').doc(uid).set({
      email,
      entitlement: {
        tier,
        status: 'active',
        product,
        cohort,
        cohortId: cohort, // Explicit alias for clarity
        cohortStartDate: cohortStartDate || '',
        checkoutSessionId: sessionId,
        stripeCustomerId: customerId,
      },
      createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

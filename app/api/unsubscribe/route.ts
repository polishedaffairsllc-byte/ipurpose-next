import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/unsubscribe?email=...
 * Marks the email as opted-out in Firestore across both leads and users collections.
 * Used by the one-click unsubscribe link in email footers.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get('email');

  if (!raw) {
    return NextResponse.redirect(
      new URL('/unsubscribe?status=missing', request.url)
    );
  }

  const email = decodeURIComponent(raw).trim().toLowerCase();

  try {
    const db = firebaseAdmin.firestore();

    // 1. Mark any matching leads as opted out
    const leadsSnap = await db
      .collection('leads')
      .where('email', '==', email)
      .get();

    const batch = db.batch();
    leadsSnap.docs.forEach((doc) => {
      batch.update(doc.ref, {
        emailOptOut: true,
        optOutAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      });
    });

    // 2. Mark matching users as opted out
    const usersSnap = await db
      .collection('users')
      .where('email', '==', email)
      .get();

    usersSnap.docs.forEach((doc) => {
      batch.update(doc.ref, {
        emailOptOut: true,
        optOutAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      });
    });

    // 3. Write a dedicated opt-out record (works even if no lead/user doc exists yet)
    const optOutRef = db.collection('email_opt_outs').doc(
      Buffer.from(email).toString('base64')
    );
    batch.set(
      optOutRef,
      {
        email,
        optOutAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await batch.commit();

    console.log(`[Unsubscribe] ${email} opted out`);
    return NextResponse.redirect(
      new URL(`/unsubscribe?status=success&email=${encodeURIComponent(email)}`, request.url)
    );
  } catch (err) {
    console.error('[Unsubscribe] Error:', err);
    return NextResponse.redirect(
      new URL('/unsubscribe?status=error', request.url)
    );
  }
}

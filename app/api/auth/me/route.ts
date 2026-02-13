import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/me
 * Returns the current user's Firestore profile data using the session cookie.
 * Replaces direct client-side Firestore reads to `users/{uid}` which fail
 * when Firestore security rules are restrictive.
 */
export async function GET(req: NextRequest) {
  try {
    const cookie = req.cookies.get('FirebaseSession')?.value;
    if (!cookie || !firebaseAdmin.apps.length) {
      return NextResponse.json({ user: null });
    }

    const decoded = await firebaseAdmin.auth().verifySessionCookie(cookie, true);
    const uid = decoded.uid;
    if (!uid) {
      return NextResponse.json({ user: null });
    }

    const db = firebaseAdmin.firestore();
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      // User doc doesn't exist yet — return minimal info from the auth token
      return NextResponse.json({
        user: {
          uid,
          email: decoded.email || null,
          displayName: null,
          entitlements: {},
        },
      });
    }

    const data = userDoc.data() || {};

    // Return a safe subset of user data (no sensitive server fields)
    return NextResponse.json({
      user: {
        uid,
        email: data.email || decoded.email || null,
        displayName: data.displayName || null,
        isFounder: data.isFounder || false,
        role: data.role || null,
        entitlementTier: data.entitlementTier || null,
        entitlements: data.entitlements || {},
        archetypePrimary: data.archetypePrimary || null,
        identityAnchor: data.identityAnchor || null,
      },
    });
  } catch (err: any) {
    // Session invalid or expired
    if (err?.code === 'auth/session-cookie-revoked' || err?.code === 'auth/session-cookie-expired') {
      return NextResponse.json({ user: null });
    }
    console.error('[AUTH/ME] Error:', err);
    return NextResponse.json({ user: null });
  }
}

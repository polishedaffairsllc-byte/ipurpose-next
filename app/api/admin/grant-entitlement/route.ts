import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * Admin endpoint to manually grant entitlements for purchases that happened
 * before the webhook improvements were deployed.
 *
 * POST /api/admin/grant-entitlement
 * Body: { email, product, adminKey }
 *
 * Supported products: starter_pack, ai_blueprint, accelerator, deepen_membership
 *
 * This creates/updates a pending_entitlements doc (same shape the webhook writes).
 * The next time the user logs in, the login route reconciles it onto their user doc.
 *
 * If the user already has a Firestore user doc (matched by email), the entitlement
 * is written directly to their user doc as well — so they don't even need to re-login.
 */

const PRODUCT_ENTITLEMENT_MAP: Record<string, string> = {
  starter_pack: 'starterPack',
  ai_blueprint: 'aiBlueprint',
  accelerator: 'accelerator',
  deepen_membership: 'deepen',
};

function isAuthorized(req: NextRequest, body: any): boolean {
  if (process.env.NODE_ENV === 'development') return true;
  const key = process.env.ADMIN_API_KEY;
  if (!key) return false;
  return body?.adminKey === key || req.headers.get('x-admin-key') === key;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!isAuthorized(req, body)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 403 });
    }

    const email = String(body.email || '').trim().toLowerCase();
    const product = String(body.product || '').trim();

    if (!email) {
      return NextResponse.json({ error: 'missing email' }, { status: 400 });
    }

    const entitlementKey = PRODUCT_ENTITLEMENT_MAP[product];
    if (!entitlementKey) {
      return NextResponse.json(
        { error: `unknown product "${product}". Valid: ${Object.keys(PRODUCT_ENTITLEMENT_MAP).join(', ')}` },
        { status: 400 }
      );
    }

    const db = firebaseAdmin.firestore();
    const emailHash = crypto.createHash('sha256').update(email).digest('hex');

    // 1. Write/update the pending_entitlements doc (same shape as webhook)
    const pendingRef = db.collection('pending_entitlements').doc(emailHash);
    await pendingRef.set(
      {
        email,
        entitlements: {
          [entitlementKey]: true,
        },
        product,
        createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        claimed: false,
        grantedManually: true,
        grantedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    console.log(`[ADMIN] Pending entitlement (${entitlementKey}) created for email=${email}, hash=${emailHash}`);

    // 2. If a user doc already exists with this email, also write the entitlement directly
    let directGrant = false;
    let matchedUid: string | null = null;

    // First try finding user doc by email field
    const usersSnap = await db.collection('users').where('email', '==', email).limit(1).get();
    if (!usersSnap.empty) {
      const userDoc = usersSnap.docs[0];
      matchedUid = userDoc.id;
      const existing = userDoc.data();

      await userDoc.ref.set(
        {
          email,
          entitlements: {
            ...(existing?.entitlements || {}),
            [entitlementKey]: true,
          },
          updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      directGrant = true;
      console.log(`[ADMIN] Direct entitlement (${entitlementKey}) set on user doc uid=${matchedUid} (found by email query)`);
    } else {
      // Email query failed — try Firebase Auth to find the UID, then write by UID
      try {
        const authUser = await firebaseAdmin.auth().getUserByEmail(email);
        if (authUser?.uid) {
          matchedUid = authUser.uid;
          const userRef = db.collection('users').doc(authUser.uid);
          const existingDoc = await userRef.get();
          const existing = existingDoc.exists ? existingDoc.data() : null;

          await userRef.set(
            {
              email,
              entitlements: {
                ...(existing?.entitlements || {}),
                [entitlementKey]: true,
              },
              updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );

          directGrant = true;
          console.log(`[ADMIN] Direct entitlement (${entitlementKey}) set on user doc uid=${matchedUid} (found by Firebase Auth UID)`);
        }
      } catch (authErr: any) {
        if (authErr?.code !== 'auth/user-not-found') {
          console.error('[ADMIN] Firebase Auth lookup error:', authErr);
        }
        // No Firebase Auth account — pending entitlement is sufficient
      }
    }

    return NextResponse.json({
      success: true,
      email,
      emailHash,
      product,
      entitlementKey,
      pendingDocWritten: true,
      directGrantToUserDoc: directGrant,
      matchedUid,
      message: directGrant
        ? `Entitlement granted directly on user doc (${matchedUid}) AND pending doc written. Access is immediate.`
        : `Pending entitlement doc written. Access will be granted on next login.`,
    });
  } catch (err: any) {
    console.error('[ADMIN] Grant entitlement error:', err);
    return NextResponse.json({ error: 'internal', details: err?.message }, { status: 500 });
  }
}

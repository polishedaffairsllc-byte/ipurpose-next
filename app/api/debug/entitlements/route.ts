import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function isAuthorized(req: NextRequest) {
  // Allow in development
  if (process.env.NODE_ENV === 'development') return true;

  const keyFromEnv = process.env.DEBUG_ENDPOINT_KEY;
  if (!keyFromEnv) return false;

  const keyQuery = new URL(req.url).searchParams.get('key');
  const keyHeader = req.headers.get('x-debug-endpoint-key');
  return keyFromEnv === keyQuery || keyFromEnv === keyHeader;
}

export async function GET(req: NextRequest) {
  try {
    console.log('[DEBUG/ENTITLEMENTS] Accessed:', req.url);

    if (!isAuthorized(req)) {
      console.warn('[DEBUG/ENTITLEMENTS] Unauthorized access attempt');
      return NextResponse.json({ error: 'unauthorized' }, { status: 403 });
    }

    const url = new URL(req.url);
    const email = url.searchParams.get('email') || '';
    if (!email) {
      return NextResponse.json({ error: 'missing email query param' }, { status: 400 });
    }

    const normalized = String(email).trim().toLowerCase();
    const emailHash = crypto.createHash('sha256').update(normalized).digest('hex');

    const db = firebaseAdmin.firestore();

    const pendingRef = db.collection('pending_entitlements').doc(emailHash);
    const pendingSnap = await pendingRef.get();

    // Redact sensitive fields: remove email and sessions array from returned pendingDoc
    let pendingDoc: any = null;
    if (pendingSnap.exists) {
      const data = pendingSnap.data() || {};
      pendingDoc = {
        product: data.product || null,
        cohort: data.cohort || null,
        createdAt: data.createdAt || null,
        claimed: Boolean(data.claimed),
        // include lastSessionId separately below
      };
    }

    // Lookup user by email
    const usersRef = db.collection('users');
    const querySnapshot = await usersRef.where('email', '==', normalized).limit(1).get();

    let userDocMatch: any = null;
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data() || {};
      userDocMatch = {
        uid: docSnap.id,
        starterPack: Boolean(data.entitlements?.starterPack),
      };
    }

    // Determine lastSessionId: prefer user starterPackPurchaseSessionId, else pending.sessions last
    let lastSessionId: string | null = null;
    let claimed = false;
    if (userDocMatch && userDocMatch.uid) {
      const udoc = await usersRef.doc(userDocMatch.uid).get();
      const udata = udoc.data() || {};
      if (udata.starterPackPurchaseSessionId) lastSessionId = udata.starterPackPurchaseSessionId;
    }

    if (pendingSnap.exists) {
      const pdata = pendingSnap.data() || {};
      const sessions: string[] = Array.isArray(pdata.sessions) ? pdata.sessions : [];
      if (!lastSessionId && sessions.length) lastSessionId = sessions[sessions.length - 1];
      claimed = Boolean(pdata.claimed);
    }

    // Also check Firebase Auth for an account with this email
    let firebaseAuthUser: any = null;
    try {
      const authUser = await firebaseAdmin.auth().getUserByEmail(normalized);
      firebaseAuthUser = {
        uid: authUser.uid,
        email: authUser.email,
        displayName: authUser.displayName || null,
        creationTime: authUser.metadata.creationTime || null,
        lastSignInTime: authUser.metadata.lastSignInTime || null,
      };
    } catch (authErr: any) {
      // auth/user-not-found is expected if no account exists
      if (authErr?.code !== 'auth/user-not-found') {
        console.error('[DEBUG/ENTITLEMENTS] Auth lookup error:', authErr);
      }
      firebaseAuthUser = null;
    }

    // If we found a Firebase Auth user but no Firestore user doc by email query,
    // also try looking up the doc directly by UID
    let userDocByUid: any = null;
    if (firebaseAuthUser?.uid && !userDocMatch) {
      try {
        const uidDoc = await db.collection('users').doc(firebaseAuthUser.uid).get();
        if (uidDoc.exists) {
          const data = uidDoc.data() || {};
          userDocByUid = {
            uid: uidDoc.id,
            email: data.email || null,
            entitlements: data.entitlements || {},
            hasStarterPack: Boolean(data.entitlements?.starterPack),
          };
        }
      } catch (uidErr) {
        console.error('[DEBUG/ENTITLEMENTS] UID doc lookup error:', uidErr);
      }
    }

    const response = {
      normalizedEmail: normalized,
      emailHash,
      pendingEntitlementDocExists: pendingSnap.exists,
      pendingDoc,
      userDocMatch,
      userDocByUid,
      firebaseAuthUser,
      lastSessionId,
      claimed,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error('[DEBUG/ENTITLEMENTS] Error:', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

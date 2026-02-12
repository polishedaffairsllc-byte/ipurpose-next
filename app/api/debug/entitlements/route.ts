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

    const response = {
      normalizedEmail: normalized,
      emailHash,
      pendingEntitlementDocExists: pendingSnap.exists,
      pendingDoc,
      userDocMatch,
      lastSessionId,
      claimed,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error('[DEBUG/ENTITLEMENTS] Error:', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

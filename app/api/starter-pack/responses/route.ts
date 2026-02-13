import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

/**
 * Helper: extract UID from the session cookie.
 */
async function getUidFromSession(req: NextRequest): Promise<string | null> {
  try {
    const cookie = req.cookies.get('FirebaseSession')?.value;
    if (!cookie || !firebaseAdmin.apps.length) return null;
    const decoded = await firebaseAdmin.auth().verifySessionCookie(cookie, true);
    return decoded.uid || null;
  } catch {
    return null;
  }
}

/**
 * GET /api/starter-pack/responses
 * Returns the saved Starter Pack responses for the authenticated user.
 */
export async function GET(req: NextRequest) {
  const uid = await getUidFromSession(req);
  if (!uid) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const db = firebaseAdmin.firestore();
    const docSnap = await db.collection('starterPackResponses').doc(uid).get();

    if (!docSnap.exists) {
      return NextResponse.json({ data: {} });
    }

    // Strip server-only fields before returning
    const data = docSnap.data() || {};
    const { updatedAt, ...rest } = data;
    return NextResponse.json({ data: rest });
  } catch (err: any) {
    console.error('[STARTER-PACK/RESPONSES] GET error:', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

/**
 * POST /api/starter-pack/responses
 * Saves (merges) the user's Starter Pack responses.
 * Body: { responses: Record<string, string> }
 */
export async function POST(req: NextRequest) {
  const uid = await getUidFromSession(req);
  if (!uid) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const responses = body?.responses;

    if (!responses || typeof responses !== 'object') {
      return NextResponse.json({ error: 'missing responses object' }, { status: 400 });
    }

    const db = firebaseAdmin.firestore();
    await db.collection('starterPackResponses').doc(uid).set(
      {
        ...responses,
        updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[STARTER-PACK/RESPONSES] POST error:', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

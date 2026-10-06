import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { getRequestBearerAuth } from '@/lib/firebase/requestAuth';
import { recordAuthEmailStatus } from '@/lib/trust/emailPolicy';
export async function POST() {
  const bearer = await getRequestBearerAuth();
  let uid = bearer.uid;
  if (bearer.attempted && !uid) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  try {
    if (!bearer.attempted) {
      const session = (await cookies()).get('FirebaseSession')?.value;
      if (session) uid = (await firebaseAdmin.auth().verifySessionCookie(session, true)).uid;
    }
    if (!uid) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
    const user = await firebaseAdmin.auth().getUser(uid);
    await recordAuthEmailStatus(firebaseAdmin.firestore(), user);
    return NextResponse.json({ emailVerified: user.emailVerified === true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return NextResponse.json({ error: 'Unable to check email status.' }, { status: 503 }); }
}

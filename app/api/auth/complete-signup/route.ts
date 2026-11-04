import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { completeSignup, requireCompletedSignup } from '@/lib/signup/completion';
import { CompanionSafetyError } from '@/lib/ai/companionSafety';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  const headers = { 'Cache-Control': 'no-store' };
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: 'Cross-origin requests are not allowed.' }, { status: 403, headers });
  const token = /^Bearer ([^\s]+)$/i.exec(request.headers.get('authorization') || '')?.[1];
  if (!token) return NextResponse.json({ error: 'Please sign in to finish account setup.' }, { status: 401, headers });
  let uid: string;
  try { uid = (await firebaseAdmin.auth().verifyIdToken(token, true)).uid; }
  catch { return NextResponse.json({ error: 'Please sign in again to finish account setup.' }, { status: 401, headers }); }
  try {
    const result = await completeSignup(firebaseAdmin.firestore(), await firebaseAdmin.auth().getUser(uid), await request.json().catch(() => null), () => firebaseAdmin.auth().getUser(uid));
    return NextResponse.json(result, { headers });
  } catch (error) {
    return NextResponse.json({ error: error instanceof CompanionSafetyError ? error.message : 'Your AI permission could not be saved. Your account setup is incomplete. Please retry.' }, { status: error instanceof CompanionSafetyError ? error.status : 503, headers });
  }
}

/** Admission check for recovered client authentication; never grants permission. */
export async function GET(request: Request) {
  const headers = { 'Cache-Control': 'no-store' };
  const token = /^Bearer ([^\s]+)$/i.exec(request.headers.get('authorization') || '')?.[1];
  if (!token) return NextResponse.json({ error: 'Authentication required.' }, { status: 401, headers });
  let uid: string;
  try { uid = (await firebaseAdmin.auth().verifyIdToken(token, true)).uid; }
  catch { return NextResponse.json({ error: 'Authentication required.' }, { status: 401, headers }); }
  try {
    await requireCompletedSignup(firebaseAdmin.firestore(), await firebaseAdmin.auth().getUser(uid));
    return NextResponse.json({ completed: true, uid }, { headers });
  } catch (error) {
    if (error instanceof CompanionSafetyError && error.status === 409) return NextResponse.json({ completed: false, uid }, { headers });
    return NextResponse.json({ error: 'Unable to verify account setup. Please retry.' }, { status: 503, headers });
  }
}

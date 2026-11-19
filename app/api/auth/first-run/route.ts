import { NextRequest, NextResponse } from 'next/server';
import { requireAuthenticated } from '@/lib/apiEntitlementHelper';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { advanceFirstRun, getFirstRun } from '@/lib/signup/firstRun';
import { CompanionSafetyError } from '@/lib/ai/companionSafety';

export const dynamic = 'force-dynamic';
function failure(error: unknown) {
  return NextResponse.json({ error: error instanceof CompanionSafetyError ? error.message : 'Account setup could not be saved. Please retry.' },
    { status: error instanceof CompanionSafetyError ? error.status : 503, headers: { 'Cache-Control': 'private, no-store' } });
}
export async function GET() {
  try {
    const auth = await requireAuthenticated();
    if (auth.error) return auth.error;
    const user = await firebaseAdmin.auth().getUser(auth.uid);
    return NextResponse.json({ uid: auth.uid, state: await getFirstRun(firebaseAdmin.firestore(), user) }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) { return failure(error); }
}
export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get('origin');
    if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: 'Cross-origin requests are not allowed.' }, { status: 403 });
    const auth = await requireAuthenticated();
    if (auth.error) return auth.error;
    const user = await firebaseAdmin.auth().getUser(auth.uid);
    const state = await advanceFirstRun(firebaseAdmin.firestore(), user, await request.json().catch(() => null), () => firebaseAdmin.auth().getUser(auth.uid));
    return NextResponse.json({ uid: auth.uid, state }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) { return failure(error); }
}

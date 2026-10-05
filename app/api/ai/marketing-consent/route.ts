import { CLARITY_LIFECYCLE_COPY as COPY } from '@/mobile/src/lib/clarityLifecycleCopy';
import { NextResponse } from 'next/server';
import { getRequestBearerAuth } from '@/lib/firebase/requestAuth';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { recordMobileMarketingConsent } from '@/lib/clarity/marketingConsent';

export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  const auth = await getRequestBearerAuth();
  if (!auth.uid) return NextResponse.json({ error: COPY.consentSignIn }, { status: 401 });
  try {
    const input = await request.json();
    const user = await firebaseAdmin.auth().getUser(auth.uid);
    if (!user.email) return NextResponse.json({ error: COPY.consentEmail }, { status: 400 });
    await recordMobileMarketingConsent(firebaseAdmin.firestore(), auth.uid, user.email, input);
    return NextResponse.json({ saved: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const invalid = error instanceof Error && error.message === COPY.consentRequired;
    return NextResponse.json({ error: invalid ? COPY.consentRequired : COPY.consentError }, { status: invalid ? 400 : 500 });
  }
}

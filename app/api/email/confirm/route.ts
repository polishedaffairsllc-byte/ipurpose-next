import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { confirmContactEmail } from '@/lib/trust/emailVerification';
import { protectPublicSubmission, PublicInputError, readPublicJson, requestIp } from '@/lib/trust/publicProtection';
export async function POST(request: Request) {
  try {
    const body = await readPublicJson(request);
    const status = await protectPublicSubmission(firebaseAdmin.firestore(), 'email-confirm', requestIp(request), body, { limit: 20 });
    const confirmed = status === 'accepted' && await confirmContactEmail(firebaseAdmin.firestore(), body.key, body.token);
    return NextResponse.json({ confirmed }, { status: confirmed ? 200 : 400, headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } });
  } catch (error) {
    return NextResponse.json({ confirmed: false }, { status: error instanceof PublicInputError ? error.status : 503 });
  }
}

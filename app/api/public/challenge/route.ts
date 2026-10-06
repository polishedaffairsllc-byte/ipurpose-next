import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { issuePublicChallenge, PUBLIC_ACTIONS, PublicInputError, requestIp, type PublicAction } from '@/lib/trust/publicProtection';
export async function GET(request: Request) {
  const action = new URL(request.url).searchParams.get('action') as PublicAction;
  if (!PUBLIC_ACTIONS.includes(action)) return NextResponse.json({ error: 'Invalid form.' }, { status: 400 });
  try {
    const formToken = await issuePublicChallenge(firebaseAdmin.firestore(), action, requestIp(request));
    return NextResponse.json({ formToken }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof PublicInputError ? error.message : 'Please try again.' }, { status: error instanceof PublicInputError ? error.status : 503 });
  }
}

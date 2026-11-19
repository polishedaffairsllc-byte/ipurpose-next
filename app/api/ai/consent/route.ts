import { NextRequest, NextResponse } from 'next/server';
import { requireAuthenticated } from '@/lib/apiEntitlementHelper';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { CompanionSafetyError, readAiConsent, writeAiConsent } from '@/lib/ai/companionSafety';
export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'no-store' };
export async function GET() {
  const auth = await requireAuthenticated();
  if (auth.error) return auth.error;
  try { return NextResponse.json(await readAiConsent(firebaseAdmin.firestore(), auth.uid), { headers }); }
  catch { return NextResponse.json({ error: 'Unable to check your AI permission. Please retry.' }, { status: 503, headers }); }
}
export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: 'Cross-origin requests are not allowed.' }, { status: 403 });
  const auth = await requireAuthenticated();
  if (auth.error) return auth.error;
  try { return NextResponse.json(await writeAiConsent(firebaseAdmin.firestore(), auth.uid, await request.json().catch(() => null)), { headers }); }
  catch (error) { return NextResponse.json({ error: error instanceof CompanionSafetyError ? error.message : 'Unable to save your AI permission. Please retry.' }, { status: error instanceof CompanionSafetyError ? error.status : 503, headers }); }
}

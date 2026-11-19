import { NextRequest, NextResponse } from 'next/server';
import { requireAuthenticated } from '@/lib/apiEntitlementHelper';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { CompanionSafetyError, saveAiReport } from '@/lib/ai/companionSafety';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: 'Cross-origin requests are not allowed.' }, { status: 403 });
  const auth = await requireAuthenticated();
  if (auth.error) return auth.error;
  try { return NextResponse.json(await saveAiReport(firebaseAdmin.firestore(), auth.uid, await request.json().catch(() => null)), { headers: { 'Cache-Control': 'no-store' } }); }
  catch (error) { return NextResponse.json({ error: error instanceof CompanionSafetyError ? error.message : 'Your report could not be saved. Please retry.' }, { status: error instanceof CompanionSafetyError ? error.status : 503 }); }
}

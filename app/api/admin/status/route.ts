import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Dynamically import server-only admin initializer
    const adminModule = await import('@/lib/firebaseAdmin');

    // If firebaseAdmin was exported, we assume initialization succeeded
    const ok = !!adminModule && !!adminModule.firebaseAdmin;

    return NextResponse.json({ adminInitialized: ok, message: ok ? 'Firebase Admin initialized' : 'Firebase Admin not initialized' }, { status: 200 });
  } catch (err: any) {
    // Return safe error info only — do not leak credentials or stack traces
    const message = typeof err?.message === 'string' ? err.message : 'Unknown error';
    return NextResponse.json({ adminInitialized: false, error: message }, { status: 200 });
  }
}

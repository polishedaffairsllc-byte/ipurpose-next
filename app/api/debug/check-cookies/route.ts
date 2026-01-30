import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Simple endpoint to check if session cookie exists
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('FirebaseSession');
    const founderCookie = cookieStore.get('x-founder');

    console.log('[CHECK-COOKIES] Checking cookies...');
    console.log('[CHECK-COOKIES] FirebaseSession exists:', !!sessionCookie);
    console.log('[CHECK-COOKIES] x-founder exists:', !!founderCookie);
    console.log('[CHECK-COOKIES] All cookies:', Array.from(cookieStore).map(c => c.name));

    return NextResponse.json({
      hasSession: !!sessionCookie,
      hasFounder: !!founderCookie,
      sessionValue: sessionCookie?.value?.substring(0, 20) + '...',
      founderValue: founderCookie?.value,
      allCookieNames: Array.from(cookieStore).map(c => c.name),
    });
  } catch (err: any) {
    return NextResponse.json({
      error: err.message,
    }, { status: 500 });
  }
}

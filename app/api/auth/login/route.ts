// app/api/auth/login/route.ts
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    // Dynamically import the server-only admin initializer at request time
    let adminAuth;
    try {
      const adminModule = await import('@/lib/firebaseadmin');
      adminAuth = adminModule.adminAuth;
    } catch (err) {
      console.error('Firebase admin module failed to load:', err);
      return NextResponse.json(
        { success: false, error: 'Server Firebase Admin not configured.' },
        { status: 500 }
      );
    }
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days in ms

    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const cookieStore = await cookies();

    cookieStore.set('FirebaseSession', sessionCookie, {
      maxAge: Math.floor(expiresIn / 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('API Error creating session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create session.' },
      { status: 500 }
    );
  }
}

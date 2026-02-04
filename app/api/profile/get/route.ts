import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('FirebaseSession')?.value;

    if (!session) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decodedClaims = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const uid = decodedClaims.uid;

    // Get user document from Firestore
    const db = firebaseAdmin.firestore();
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({
        ok: true,
        profile: {
          displayName: '',
          photoURL: null,
          email: decodedClaims.email || '',
        },
      });
    }

    const userData = userDoc.data();
    const user = await firebaseAdmin.auth().getUser(uid);

    return NextResponse.json({
      ok: true,
      profile: {
        displayName: userData?.displayName || '',
        photoURL: userData?.photoURL || null,
        email: user.email || '',
      },
    });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to load profile' },
      { status: 500 }
    );
  }
}

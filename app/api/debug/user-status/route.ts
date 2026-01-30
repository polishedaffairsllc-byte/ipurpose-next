import { cookies } from 'next/headers';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('FirebaseSession')?.value;
    const founderCookie = cookieStore.get('x-founder')?.value;

    if (!session) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }

    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    
    // Get user from Auth
    const authUser = await firebaseAdmin.auth().getUser(decoded.uid);
    
    // Get user doc from Firestore
    const userDoc = await firebaseAdmin.firestore().collection('users').doc(decoded.uid).get();

    return NextResponse.json({
      uid: decoded.uid,
      email: authUser.email,
      customClaimsInAuth: authUser.customClaims || {},
      customClaimsInToken: decoded.customClaims || {},
      firestoreData: userDoc.data() || {},
      founderCookieValue: founderCookie,
      decoded: {
        iss: decoded.iss,
        aud: decoded.aud,
      },
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({
      error: err.message,
      stack: err.stack,
    }, { status: 500 });
  }
}

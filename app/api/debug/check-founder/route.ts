import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

/**
 * Debug endpoint: check founder status directly for a given UID
 * Usage: /api/debug/check-founder?uid=PqGLH53bEeUCgkZdCBkS0zy2aIM2
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ error: 'uid parameter required' }, { status: 400 });
    }

    // Get user from Auth
    const authUser = await firebaseAdmin.auth().getUser(uid);
    
    // Get user doc from Firestore
    const userDoc = await firebaseAdmin.firestore().collection('users').doc(uid).get();

    const authClaims = authUser.customClaims || {};
    const firestoreData = userDoc.data() || {};
    
    const isFounderInAuth = authClaims.isFounder === true || authClaims.role === 'founder';
    const isFounderInFirestore = firestoreData.isFounder === true || firestoreData.role === 'founder';

    return NextResponse.json({
      uid,
      email: authUser.email,
      authCustomClaims: authClaims,
      firestoreFields: {
        role: firestoreData.role,
        isFounder: firestoreData.isFounder,
        entitlementTier: firestoreData.entitlementTier,
      },
      isFounderInAuth,
      isFounderInFirestore,
      isFounder: isFounderInAuth || isFounderInFirestore,
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({
      error: err.message,
      code: err.code,
    }, { status: 500 });
  }
}

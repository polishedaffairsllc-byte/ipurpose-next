import { cookies } from 'next/headers';
import { firebaseAdmin } from './firebaseAdmin';

export async function checkEntitlement(): Promise<{
  uid: string | null;
  isEntitled: boolean;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('FirebaseSession')?.value;

    if (!sessionCookie) {
      return { uid: null, isEntitled: false };
    }

    const decodedClaim = await firebaseAdmin
      .auth()
      .verifySessionCookie(sessionCookie, true);
    const uid = decodedClaim.uid;

    const db = firebaseAdmin.firestore();
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return { uid, isEntitled: false, error: 'User document not found' };
    }

    const userData = userDoc.data();
    const isEntitled = userData?.entitlement?.status === 'active';

    return { uid, isEntitled };
  } catch (error) {
    return { uid: null, isEntitled: false };
  }
}

export function redirectIfNotEntitled(uid: string | null, isEntitled: boolean) {
  if (!uid || !isEntitled) {
    return '/enrollment-required';
  }
  return null;
}

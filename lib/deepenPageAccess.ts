import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { hasDeepenEntitlement } from './deepenEntitlement';
import { firebaseAdmin } from './firebaseAdmin';
import { isFounder } from './isFounder';

export const getDeepenPageAccess = cache(async (): Promise<boolean> => {
  const session = (await cookies()).get('FirebaseSession')?.value;
  if (!session) redirect('/login');

  try {
    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const user = (await firebaseAdmin.firestore().collection('users').doc(decoded.uid).get()).data();
    return isFounder(decoded, user) || hasDeepenEntitlement(user);
  } catch {
    redirect('/login');
  }
});

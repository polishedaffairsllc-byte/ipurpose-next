import { cookies } from 'next/headers';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import StarterPackLanding from './StarterPackLandingClient';
import StarterPackWorkspace from './StarterPackWorkspaceClient';

// Server-only page: perform session cookie verification and entitlement check.
// Render client components; all client-side hooks are kept in those components.
export default async function Page() {
  let isEntitled = false;
  let email: string | null = null;

  try {
    const cookieJar = await cookies();
    const cookie = cookieJar.get('FirebaseSession')?.value;
    if (cookie) {
      const decoded = await firebaseAdmin.auth().verifySessionCookie(cookie, true);
      const uid = (decoded as any).uid as string;
      if (uid) {
        const userDoc = await firebaseAdmin.firestore().collection('users').doc(uid).get();
        if (userDoc.exists) {
          const ent = userDoc.get('entitlements') || {};
          isEntitled = !!ent.starterPack;
          email = userDoc.get('email') || null;
        }
      }
    }
  } catch (err) {
    // Treat failures as not entitled — show landing
    console.warn('Starter pack entitlement check failed:', err);
    isEntitled = false;
  }

  if (isEntitled) return <StarterPackWorkspace email={email} />;
  return <StarterPackLanding />;
}

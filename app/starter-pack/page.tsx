import { cookies } from 'next/headers';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import StarterPackLanding from './StarterPackLandingClient';
import StarterPackLandingServer from './StarterPackLandingServer';
import StarterPackWorkspace from './StarterPackWorkspaceClient';

// Server-only page: perform session cookie verification and entitlement check.
// Render client components; all client-side hooks are kept in those components.
export default async function Page() {
  let isEntitled = false;
  let email: string | null = null;
  let claimed = false;

  try {
    const cookieJar = await cookies();
    const cookie = cookieJar.get('FirebaseSession')?.value;
    // short-lived client-readable cookie set on login when a pending entitlement was migrated
    claimed = Boolean(cookieJar.get('starterPackClaimed')?.value);
    // Only attempt Firebase verification if admin SDK is initialized
    if (cookie && firebaseAdmin.apps.length > 0) {
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

  if (isEntitled) return <StarterPackWorkspace email={email} claimed={claimed} />;

  // Render the full styled client landing (hero, gradients, PublicHeader, Footer)
  // with a <noscript> server fallback for environments that don't run JS
  return (
    <>
      <StarterPackLanding />
      <noscript>
        <StarterPackLandingServer />
      </noscript>
    </>
  );
}

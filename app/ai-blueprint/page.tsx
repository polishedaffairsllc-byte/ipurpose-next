import { cookies } from 'next/headers';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { deriveFounderContext } from '@/lib/isFounder';
import AIBlueprintLandingClient from './AIBlueprintLandingClient';
import AIBlueprintWorkspace from './AIBlueprintWorkspaceClient';

export const dynamic = 'force-dynamic';

// Server-only page: session cookie verification + entitlement check.
// Shows landing (sales page) or workspace (interactive workbook + AI tools unlock).
export default async function Page() {
  let isEntitled = false;
  let email: string | null = null;
  let claimed = false;

  try {
    const cookieJar = await cookies();
    const cookie = cookieJar.get('FirebaseSession')?.value;
    claimed = Boolean(cookieJar.get('aiBlueprintClaimed')?.value);

    if (cookie && firebaseAdmin.apps.length > 0) {
      const decoded = await firebaseAdmin.auth().verifySessionCookie(cookie, true);
      const uid = (decoded as any).uid as string;
      if (uid) {
        const userDoc = await firebaseAdmin.firestore().collection('users').doc(uid).get();
        if (userDoc.exists) {
          const ent = userDoc.get('entitlements') || {};
          const userData = userDoc.data() || {};
          const founder = deriveFounderContext(decoded as any, userData);
          isEntitled = !!ent.aiBlueprint || founder.isFounder;
          email = userDoc.get('email') || null;
        }
      }
    }
  } catch (err) {
    console.warn('AI Blueprint entitlement check failed:', err);
    isEntitled = false;
  }

  if (isEntitled) return <AIBlueprintWorkspace email={email} claimed={claimed} />;

  return <AIBlueprintLandingClient />;
}

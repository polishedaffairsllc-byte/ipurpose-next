import { after } from 'next/server';
import { ingestionHandler } from '@/lib/outreach/http';
import { storeOutreachEvent, cleanupOutreachEvents } from '@/lib/outreach/service';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const POST = ingestionHandler(async (event, request) => {
  const { firebaseAdmin } = await import('@/lib/firebaseAdmin');
  // Resolve existing owner/admin session signals server-side without retaining identity.
  const session = /(?:^|;\s*)FirebaseSession=([^;]+)/.exec(request.headers.get('cookie') || '')?.[1];
  if (session) {
    try {
      const user = await firebaseAdmin.auth().verifySessionCookie(decodeURIComponent(session), true);
      const profile = (await firebaseAdmin.firestore().collection('users').doc(user.uid).get()).data();
      if (user.admin === true || profile?.isFounder === true || ['admin', 'founder'].includes(String(profile?.role).toLowerCase()) || profile?.entitlementTier === 'founder') event.traffic_type = 'internal';
    } catch { /* Invalid sessions supply no identity signal. */ }
  }
  await storeOutreachEvent(firebaseAdmin.firestore(), event);
  // Bounded, opportunistic 180-day retention sweep after response; never blocks presentation delivery.
  after(async () => { try { await cleanupOutreachEvents(firebaseAdmin.firestore()); } catch { /* Explicit maintenance command can catch up. */ } });
});

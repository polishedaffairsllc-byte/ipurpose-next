import { proposalById } from '@/lib/outreach/registry';
import { trafficClassification, universityEnvironment } from '@/lib/universities/links';
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
  if (proposalById(event.proposal_id)?.family === 'university') {
    if (universityEnvironment() === 'preview') event.traffic_type = 'internal';
    event.traffic_classification = trafficClassification(request, event.traffic_type === 'internal', event.interaction_qualified);
  }
  await storeOutreachEvent(firebaseAdmin.firestore(), event);
  // Bounded, opportunistic 180-day retention sweep after response; never blocks presentation delivery.
  after(async () => { try { await cleanupOutreachEvents(firebaseAdmin.firestore()); } catch { /* Explicit maintenance command can catch up. */ } });
});

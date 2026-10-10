import { timingSafeEqual } from 'node:crypto';
import type { WeeklyMetrics } from '@/functions/src/model';
import { ACTIVITY_KINDS, type ActivityKind } from '@/lib/admin-activity/types';
import { createActivityService } from '@/lib/admin-activity/service';
import { getGa4Dashboard } from '@/lib/launch-metrics/ga4Dashboard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const responseHeaders = { 'Cache-Control': 'private, no-store', Vary: 'Authorization' };
const COLLECTIONS: Partial<Record<ActivityKind, string>> = {
  profiles: 'users', leads: 'leads', clarity: 'clarityCheckSubmissions', registrations: 'infoSessionRegistrations',
  cohorts: 'cohort-registrations', emails: 'emailTasks',
};

function authorized(request: Request) {
  const expected = process.env.LAUNCH_METRICS_FEED_TOKEN;
  const supplied = /^Bearer[ \t]+(\S+)$/i.exec(request.headers.get('authorization') || '')?.[1];
  return !!expected?.trim() && !!supplied
    && Buffer.byteLength(expected) === Buffer.byteLength(supplied)
    && timingSafeEqual(Buffer.from(expected), Buffer.from(supplied));
}

async function accountCount(auth: ReturnType<typeof import('firebase-admin').auth>) {
  let count = 0; let token: string | undefined;
  do {
    const page = await auth.listUsers(1000, token);
    count += page.users.length; token = page.pageToken;
    if (count > 10000) throw new Error('Account inventory exceeds dashboard safety limit.');
  } while (token);
  return count;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return Response.json({ error: 'Unauthorized' }, {
      status: 401, headers: { ...responseHeaders, 'WWW-Authenticate': 'Bearer realm="launch-metrics-feed"' },
    });
  }

  try {
    const { firebaseAdmin } = await import('@/lib/firebaseAdmin');
    const db = firebaseAdmin.firestore();
    const auth = firebaseAdmin.auth();
    const service = createActivityService(db, auth);
    const url = new URL(request.url);
    const activityKind = url.searchParams.get('activityKind') as ActivityKind | null;

    if (activityKind) {
      if (!ACTIVITY_KINDS.includes(activityKind)) return Response.json({ error: 'Invalid activity kind' }, { status: 400, headers: responseHeaders });
      const cursor = url.searchParams.get('cursor') || undefined;
      const page = await service.list(activityKind, cursor);
      return Response.json({ kind: activityKind, ...page }, { headers: responseHeaders });
    }

    const result = await db.collection('analytics_weekly').orderBy('weekEnding', 'desc').limit(52).get();
    const snapshots = result.docs.map(doc => {
      const data = doc.data() as WeeklyMetrics;
      return {
        schemaVersion: data.schemaVersion, weekStart: data.weekStart, weekEnding: data.weekEnding,
        computedAt: data.computedAt, reportingTimezone: data.reportingTimezone, property: data.property,
        counts: data.counts, byPlatform: data.byPlatform, rates: data.rates,
      };
    });

    const propertyHint = snapshots[0]?.property;
    const ga4Promise = getGa4Dashboard(propertyHint).catch(() => null);
    const countsPromise = Promise.all(ACTIVITY_KINDS.map(async kind => {
      if (kind === 'accounts') return [kind, await accountCount(auth)] as const;
      const collection = COLLECTIONS[kind];
      if (!collection) return [kind, 0] as const;
      const snap = await db.collection(collection).count().get();
      return [kind, snap.data().count] as const;
    }));
    const recentPromise = Promise.all(ACTIVITY_KINDS.map(async kind => {
      const page = await service.list(kind);
      return [kind, { rows: page.rows.slice(0, 10), moreAvailable: !!page.cursor }] as const;
    }));

    const [ga4, countPairs, recentPairs] = await Promise.all([ga4Promise, countsPromise, recentPromise]);
    return Response.json({
      schemaVersion: 2,
      generatedAt: new Date().toISOString(),
      count: snapshots.length,
      snapshots,
      ga4,
      activity: { totals: Object.fromEntries(countPairs), recent: Object.fromEntries(recentPairs) },
    }, { headers: responseHeaders });
  } catch {
    return Response.json({ error: 'Launch metrics unavailable' }, { status: 503, headers: responseHeaders });
  }
}

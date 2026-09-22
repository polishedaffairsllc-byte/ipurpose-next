import { timingSafeEqual } from 'node:crypto';
import type { WeeklyMetrics } from '@/functions/src/model';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const responseHeaders = {
  'Cache-Control': 'private, no-store',
  Vary: 'Authorization',
};

export async function GET(request: Request) {
  const expected = process.env.LAUNCH_METRICS_FEED_TOKEN;
  const supplied = /^Bearer[ \t]+(\S+)$/i.exec(request.headers.get('authorization') || '')?.[1];
  const valid = !!expected?.trim() && !!supplied
    && Buffer.byteLength(expected) === Buffer.byteLength(supplied)
    && timingSafeEqual(Buffer.from(expected), Buffer.from(supplied));

  if (!valid) {
    return Response.json({ error: 'Unauthorized' }, {
      status: 401,
      headers: { ...responseHeaders, 'WWW-Authenticate': 'Bearer realm="launch-metrics-feed"' },
    });
  }

  try {
    // Reuse the existing server singleton, and do not initialize it for denied requests.
    const { firebaseAdmin } = await import('@/lib/firebaseAdmin');
    const result = await firebaseAdmin.firestore().collection('analytics_weekly')
      .orderBy('weekEnding', 'desc').limit(52).get();
    const snapshots = result.docs.map(doc => {
      const data = doc.data() as WeeklyMetrics;
      // Return only the dashboard contract, not unrelated future document fields.
      return {
        schemaVersion: data.schemaVersion,
        weekStart: data.weekStart,
        weekEnding: data.weekEnding,
        computedAt: data.computedAt,
        reportingTimezone: data.reportingTimezone,
        property: data.property,
        counts: data.counts,
        byPlatform: data.byPlatform,
        rates: data.rates,
      };
    });
    return Response.json({ count: snapshots.length, snapshots }, { headers: responseHeaders });
  } catch {
    // Never expose tokens, credentials, or underlying database errors to callers.
    return Response.json({ error: 'Launch metrics unavailable' }, {
      status: 503, headers: responseHeaders,
    });
  }
}

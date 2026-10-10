import 'server-only';
import { firebaseAdmin } from '@/lib/firebaseAdmin';

const API = 'https://analyticsdata.googleapis.com/v1beta';
const TZ = 'America/New_York';

type Row = Record<string, string | number | null>;
type Report = { rows?: Array<{ dimensionValues?: Array<{ value?: string }>; metricValues?: Array<{ value?: string }> }>; dimensionHeaders?: Array<{ name?: string }>; metricHeaders?: Array<{ name?: string }> };

function propertyName(value?: string | null) {
  const raw = value?.trim();
  if (!raw || !/^(properties\/)?\d+$/.test(raw)) throw new Error('GA4 property is not configured.');
  return `properties/${raw.replace(/^properties\//, '')}`;
}

async function accessToken() {
  const app = firebaseAdmin.app();
  const credential = app.options.credential as { getAccessToken?: () => Promise<{ access_token: string }> } | undefined;
  if (!credential?.getAccessToken) throw new Error('Google credential is unavailable.');
  return (await credential.getAccessToken()).access_token;
}

function normalize(report: Report): Row[] {
  const dims = report.dimensionHeaders?.map(x => x.name || '') || [];
  const metrics = report.metricHeaders?.map(x => x.name || '') || [];
  return (report.rows || []).map(row => {
    const out: Row = {};
    dims.forEach((name, i) => { out[name] = row.dimensionValues?.[i]?.value ?? ''; });
    metrics.forEach((name, i) => {
      const raw = row.metricValues?.[i]?.value ?? '';
      out[name] = /^-?\d+(?:\.\d+)?$/.test(raw) ? Number(raw) : raw;
    });
    return out;
  });
}

async function post(property: string, method: 'runReport' | 'runRealtimeReport', body: unknown, token: string) {
  const response = await fetch(`${API}/${property}:${method}`, {
    method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(12000),
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    await response.body?.cancel();
    throw new Error(`GA4 ${method} failed (${response.status}).`);
  }
  return normalize(await response.json() as Report);
}

const metrics = (names: string[]) => names.map(name => ({ name }));
const dimensions = (names: string[]) => names.map(name => ({ name }));

function dated(startDate: string, endDate: string, metricNames: string[], dimensionNames: string[] = [], limit = 100) {
  return { dateRanges: [{ startDate, endDate }], metrics: metrics(metricNames), dimensions: dimensions(dimensionNames), limit, keepEmptyRows: false };
}

export async function getGa4Dashboard(propertyHint?: string | null) {
  const property = propertyName(process.env.GA4_PROPERTY_ID || propertyHint);
  const token = await accessToken();
  const overviewMetrics = ['activeUsers', 'newUsers', 'sessions', 'screenPageViews', 'eventCount', 'userEngagementDuration', 'engagementRate', 'bounceRate'];

  const [today, currentWeek, last7Days, last28Days, daily28, pages, landingPages, channels, sources, events, countries, cities, platforms, devices] = await Promise.all([
    post(property, 'runReport', dated('today', 'today', overviewMetrics), token),
    post(property, 'runReport', dated('7daysAgo', 'today', overviewMetrics), token),
    post(property, 'runReport', dated('6daysAgo', 'today', overviewMetrics), token),
    post(property, 'runReport', dated('27daysAgo', 'today', overviewMetrics), token),
    post(property, 'runReport', dated('27daysAgo', 'today', ['activeUsers', 'sessions', 'screenPageViews', 'eventCount'], ['date'], 35), token),
    post(property, 'runReport', dated('27daysAgo', 'today', ['screenPageViews', 'activeUsers', 'eventCount', 'userEngagementDuration', 'bounceRate'], ['pageTitle', 'pagePath'], 100), token),
    post(property, 'runReport', dated('27daysAgo', 'today', ['sessions', 'activeUsers', 'newUsers', 'engagementRate'], ['landingPagePlusQueryString'], 100), token),
    post(property, 'runReport', dated('27daysAgo', 'today', ['sessions', 'activeUsers', 'engagedSessions'], ['sessionDefaultChannelGroup'], 50), token),
    post(property, 'runReport', dated('27daysAgo', 'today', ['sessions', 'activeUsers', 'newUsers'], ['sessionSourceMedium'], 100), token),
    post(property, 'runReport', dated('27daysAgo', 'today', ['eventCount', 'totalUsers'], ['eventName'], 250), token),
    post(property, 'runReport', dated('27daysAgo', 'today', ['activeUsers', 'sessions'], ['country'], 100), token),
    post(property, 'runReport', dated('27daysAgo', 'today', ['activeUsers', 'sessions'], ['city'], 100), token),
    post(property, 'runReport', dated('27daysAgo', 'today', ['activeUsers', 'sessions', 'eventCount'], ['platform'], 20), token),
    post(property, 'runReport', dated('27daysAgo', 'today', ['activeUsers', 'sessions'], ['deviceCategory', 'browser', 'operatingSystem'], 100), token),
  ]);

  let realtime: Row[] = [];
  try {
    realtime = await post(property, 'runRealtimeReport', {
      dimensions: dimensions(['minutesAgo', 'city', 'country']), metrics: metrics(['activeUsers']), limit: 100,
    }, token);
  } catch {
    // Realtime is useful but should not make the full dashboard unavailable.
  }

  return {
    property,
    reportingTimezone: TZ,
    generatedAt: new Date().toISOString(),
    windows: { today: today[0] || {}, currentWeekToDate: currentWeek[0] || {}, last7Days: last7Days[0] || {}, last28Days: last28Days[0] || {} },
    daily28, realtime,
    topPages: pages,
    landingPages,
    acquisition: { channels, sources },
    events,
    geography: { countries, cities },
    technology: { platforms, devices },
  };
}

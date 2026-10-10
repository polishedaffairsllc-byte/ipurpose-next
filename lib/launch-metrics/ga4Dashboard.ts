import 'server-only';
import { firebaseAdmin } from '@/lib/firebaseAdmin';

const API = 'https://analyticsdata.googleapis.com/v1beta';
const TZ = 'America/New_York';

type Row = Record<string, string | number | null>;
type Report = { rows?: Array<{ dimensionValues?: Array<{ value?: string }>; metricValues?: Array<{ value?: string }> }>; dimensionHeaders?: Array<{ name?: string }>; metricHeaders?: Array<{ name?: string }> };
type Section = { rows: Row[]; available: boolean; error?: string };

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
  const metricNames = report.metricHeaders?.map(x => x.name || '') || [];
  return (report.rows || []).map(row => {
    const out: Row = {};
    dims.forEach((name, i) => { out[name] = row.dimensionValues?.[i]?.value ?? ''; });
    metricNames.forEach((name, i) => {
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
    const detail = (await response.text().catch(() => '')).replace(/\s+/g, ' ').trim();
    throw new Error(`GA4 ${method} failed (${response.status})${detail ? `: ${detail.slice(0, 700)}` : ''}`);
  }
  return normalize(await response.json() as Report);
}

const metrics = (names: string[]) => names.map(name => ({ name }));
const dimensions = (names: string[]) => names.map(name => ({ name }));

function dated(startDate: string, endDate: string, metricNames: string[], dimensionNames: string[] = [], limit = 100) {
  return { dateRanges: [{ startDate, endDate }], metrics: metrics(metricNames), dimensions: dimensions(dimensionNames), limit, keepEmptyRows: false };
}

function localDateParts(now = new Date()) {
  const values = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short',
  }).formatToParts(now).filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
  return { year: Number(values.year), month: Number(values.month), day: Number(values.day), weekday: values.weekday };
}

function isoDate(year: number, month: number, day: number) {
  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

function currentWeekStart(now = new Date()) {
  const { year, month, day, weekday } = localDateParts(now);
  const order: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const diff = ((order[weekday] ?? 1) + 6) % 7;
  const date = new Date(Date.UTC(year, month - 1, day - diff));
  return isoDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

async function safe(work: () => Promise<Row[]>): Promise<Section> {
  try { return { rows: await work(), available: true }; }
  catch (error) {
    return {
      rows: [],
      available: false,
      error: error instanceof Error ? error.message : 'Unknown GA4 error',
    };
  }
}

export async function getGa4Dashboard(propertyHint?: string | null) {
  const property = propertyName(process.env.GA4_PROPERTY_ID || propertyHint);
  const token = await accessToken();
  const overviewMetrics = ['activeUsers', 'newUsers', 'sessions', 'screenPageViews', 'eventCount', 'userEngagementDuration', 'engagementRate', 'bounceRate'];
  const weekStart = currentWeekStart();

  const [today, currentWeek, last7Days, last28Days, daily28, pages, landingPages, channels, sources, events, countries, cities, platforms, devices, realtime] = await Promise.all([
    safe(() => post(property, 'runReport', dated('today', 'today', overviewMetrics), token)),
    safe(() => post(property, 'runReport', dated(weekStart, 'today', overviewMetrics), token)),
    safe(() => post(property, 'runReport', dated('6daysAgo', 'today', overviewMetrics), token)),
    safe(() => post(property, 'runReport', dated('27daysAgo', 'today', overviewMetrics), token)),
    safe(() => post(property, 'runReport', dated('27daysAgo', 'today', ['activeUsers', 'sessions', 'screenPageViews', 'eventCount'], ['date'], 35), token)),
    safe(() => post(property, 'runReport', dated('27daysAgo', 'today', ['screenPageViews', 'activeUsers', 'eventCount', 'userEngagementDuration', 'bounceRate'], ['pageTitle', 'pagePath'], 100), token)),
    safe(() => post(property, 'runReport', dated('27daysAgo', 'today', ['sessions', 'activeUsers', 'newUsers', 'engagementRate'], ['landingPagePlusQueryString'], 100), token)),
    safe(() => post(property, 'runReport', dated('27daysAgo', 'today', ['sessions', 'activeUsers', 'engagedSessions'], ['sessionDefaultChannelGroup'], 50), token)),
    safe(() => post(property, 'runReport', dated('27daysAgo', 'today', ['sessions', 'activeUsers', 'newUsers'], ['sessionSourceMedium'], 100), token)),
    safe(() => post(property, 'runReport', dated('27daysAgo', 'today', ['eventCount', 'totalUsers'], ['eventName'], 250), token)),
    safe(() => post(property, 'runReport', dated('27daysAgo', 'today', ['activeUsers', 'sessions'], ['country'], 100), token)),
    safe(() => post(property, 'runReport', dated('27daysAgo', 'today', ['activeUsers', 'sessions'], ['city'], 100), token)),
    safe(() => post(property, 'runReport', dated('27daysAgo', 'today', ['activeUsers', 'sessions', 'eventCount'], ['platform'], 20), token)),
    safe(() => post(property, 'runReport', dated('27daysAgo', 'today', ['activeUsers', 'sessions'], ['deviceCategory', 'browser', 'operatingSystem'], 100), token)),
    safe(() => post(property, 'runRealtimeReport', { dimensions: dimensions(['minutesAgo', 'city', 'country']), metrics: metrics(['activeUsers']), limit: 100 }, token)),
  ]);

  const diagnosticSections = { today, currentWeek, last7Days, last28Days, daily28, pages, landingPages, channels, sources, events, countries, cities, platforms, devices, realtime };
  const diagnostics = Object.fromEntries(
    Object.entries(diagnosticSections)
      .filter(([, section]) => section.error)
      .map(([name, section]) => [name, section.error]),
  );

  return {
    property,
    reportingTimezone: TZ,
    generatedAt: new Date().toISOString(),
    currentWeekStart: weekStart,
    availability: {
      today: today.available, currentWeek: currentWeek.available, last7Days: last7Days.available, last28Days: last28Days.available,
      daily28: daily28.available, pages: pages.available, landingPages: landingPages.available, channels: channels.available,
      sources: sources.available, events: events.available, countries: countries.available, cities: cities.available,
      platforms: platforms.available, devices: devices.available, realtime: realtime.available,
    },
    diagnostics,
    windows: {
      today: today.rows[0] || {}, currentWeekToDate: currentWeek.rows[0] || {},
      last7Days: last7Days.rows[0] || {}, last28Days: last28Days.rows[0] || {},
    },
    daily28: daily28.rows,
    realtime: realtime.rows,
    topPages: pages.rows,
    landingPages: landingPages.rows,
    acquisition: { channels: channels.rows, sources: sources.rows },
    events: events.rows,
    geography: { countries: countries.rows, cities: cities.rows },
    technology: { platforms: platforms.rows, devices: devices.rows },
  };
}

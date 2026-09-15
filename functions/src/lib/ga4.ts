import { BetaAnalyticsDataClient, protos } from '@google-analytics/data';
import { EVENTS, PLATFORMS, TIMEZONE, emptyPlatforms, type EventName, type Platform } from '../model';

export function propertyName(value: string | undefined) {
  if (!value || !/^(properties\/)?\d+$/.test(value.trim())) throw new Error('Set GA4_PROPERTY_ID to the numeric property ID (not G-...).');
  return `properties/${value.trim().replace(/^properties\//, '')}`;
}

export function parseReport(report: protos.google.analytics.data.v1beta.IRunReportResponse) {
  if (report.metadata?.timeZone !== TIMEZONE) throw new Error(`GA4 reporting timezone must be ${TIMEZONE}; received ${report.metadata?.timeZone || 'unknown'}.`);
  if (report.metadata.subjectToThresholding || report.metadata.dataLossFromOtherRow || report.metadata.samplingMetadatas?.length) {
    throw new Error('GA4 returned thresholded, sampled, or truncated data; no weekly snapshot was saved.');
  }
  const rows = report.rows || [];
  if (report.rowCount !== undefined && report.rowCount !== null && report.rowCount !== rows.length) throw new Error('GA4 report is incomplete.');
  const byPlatform = emptyPlatforms();
  for (const row of rows) {
    const name = row.dimensionValues?.[0]?.value as EventName;
    const platform = row.dimensionValues?.[1]?.value as Platform;
    const raw = row.metricValues?.[0]?.value;
    if (!EVENTS.includes(name) || !PLATFORMS.includes(platform) || !raw || !/^\d+$/.test(raw)) throw new Error('Unexpected GA4 event row.');
    const count = Number(raw);
    if (!Number.isSafeInteger(count) || !Number.isSafeInteger(byPlatform[platform][name] + count)) throw new Error('Invalid GA4 count.');
    byPlatform[platform][name] += count;
  }
  return byPlatform;
}

let client: BetaAnalyticsDataClient | undefined;
export async function fetchEventCounts(startDate: string, endDate: string) {
  const property = propertyName(process.env.GA4_PROPERTY_ID);
  client ??= new BetaAnalyticsDataClient();
  const [report] = await client.runReport({
    property,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'eventName' }, { name: 'platform' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: { filter: { fieldName: 'eventName', inListFilter: { values: [...EVENTS] } } },
    limit: 100,
  });
  return { byPlatform: parseReport(report), property };
}

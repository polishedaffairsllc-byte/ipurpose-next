import { EVENTS, type WeeklyMetrics } from '@/functions/src/model';

function cell(value: string | number) {
  const text = String(value);
  // Protect spreadsheet consumers from formula injection, including future fields.
  return `"${(/^[=+\-@\t\r]/.test(text) ? `'${text}` : text).replace(/"/g, '""')}"`;
}

export function weeklyMetricsCsv(rows: WeeklyMetrics[]): string {
  const header = ['Week starting', 'Week ending', 'App first opens', 'Registrations (all platforms)', 'Clarity starts (all platforms)', 'Clarity completions (all platforms)', 'Confirmed nurture enrollments (web)', ...['Android', 'iOS', 'web'].flatMap(platform => EVENTS.map(event => `${platform}: ${event}`)), 'Native install to registration %', 'Native registration to start %', 'Native start to completion %', 'Native install to completion %', 'Computed at', 'Reporting timezone'];
  const records = rows.map(row => [row.weekStart, row.weekEnding, ...EVENTS.map(event => row.counts[event]), ...(['Android', 'iOS', 'web'] as const).flatMap(platform => EVENTS.map(event => row.byPlatform[platform][event])), row.rates.installToRegistration ?? '', row.rates.registrationToClarityStart ?? '', row.rates.clarityStartToCompletion ?? '', row.rates.installToCompletion ?? '', row.computedAt, row.reportingTimezone]);
  return '\uFEFF' + [header, ...records].map(record => record.map(cell).join(',')).join('\r\n') + '\r\n';
}

export function downloadWeeklyMetrics(rows: WeeklyMetrics[]) {
  const url = URL.createObjectURL(new Blob([weeklyMetricsCsv(rows)], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `ipurpose-launch-metrics-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

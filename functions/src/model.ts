// Pure shared reporting contract; safe for the browser to import.
export const EVENTS = ['first_open', 'sign_up', 'clarity_check_start', 'clarity_check_complete', 'email_signup'] as const;
export type EventName = typeof EVENTS[number];
export type Counts = Record<EventName, number>;
export const PLATFORMS = ['Android', 'iOS', 'web'] as const;
export type Platform = typeof PLATFORMS[number];
export const TIMEZONE = 'America/New_York';
export const emptyCounts = (): Counts => ({ first_open: 0, sign_up: 0, clarity_check_start: 0, clarity_check_complete: 0, email_signup: 0 });
export const addCounts = (a: Counts, b: Counts): Counts => Object.fromEntries(EVENTS.map(event => [event, a[event] + b[event]])) as Counts;
export const emptyPlatforms = (): Record<Platform, Counts> => ({ Android: emptyCounts(), iOS: emptyCounts(), web: emptyCounts() });

export function computeRates(counts: Counts) {
  const ratio = (n: number, d: number) => d > 0 ? Math.round(n / d * 1000) / 10 : null;
  return {
    installToRegistration: ratio(counts.sign_up, counts.first_open),
    registrationToClarityStart: ratio(counts.clarity_check_start, counts.sign_up),
    clarityStartToCompletion: ratio(counts.clarity_check_complete, counts.clarity_check_start),
    installToCompletion: ratio(counts.clarity_check_complete, counts.first_open),
  };
}

export interface WeeklyMetrics {
  schemaVersion: 1;
  weekStart: string;
  weekEnding: string;
  counts: Counts;
  byPlatform: Record<Platform, Counts>;
  // Native-only period ratios: web signups must not be divided by app installs.
  rates: ReturnType<typeof computeRates>;
  computedAt: string;
  reportingTimezone: string;
  property: string;
}

export function getPreviousWeekRange(now: Date) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const value = (key: string) => Number(parts.find(part => part.type === key)!.value);
  const today = new Date(Date.UTC(value('year'), value('month') - 1, value('day')));
  today.setUTCDate(today.getUTCDate() - (today.getUTCDay() || 7));
  return rangeEnding(today.toISOString().slice(0, 10));
}

export function rangeEnding(weekEnding: string) {
  const end = new Date(`${weekEnding}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekEnding) || !Number.isFinite(end.getTime()) || end.toISOString().slice(0, 10) !== weekEnding || end.getUTCDay() !== 0) {
    throw new Error('weekEnding must be a valid Sunday in YYYY-MM-DD format.');
  }
  end.setUTCDate(end.getUTCDate() - 6);
  return { weekStart: end.toISOString().slice(0, 10), weekEnding };
}

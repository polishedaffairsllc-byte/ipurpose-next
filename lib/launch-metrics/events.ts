import { getLaunchMeasurementIds } from './config';

type LaunchEvent = 'sign_up' | 'clarity_check_start' | 'clarity_check_complete' | 'email_signup';
const recorded = new Set<string>();

/** Analytics failure must never turn a successful product action into an error. */
export function emitLaunchEvent(name: LaunchEvent, key?: string, parameters?: { method: string }): boolean {
  if (typeof window === 'undefined') return false;
  const measurementIds = getLaunchMeasurementIds();
  if (!measurementIds.length) return false;
  const onceKey = key ? `ipurpose:analytics:${name}:${key}` : undefined;
  try {
    if (onceKey && (recorded.has(onceKey) || window.sessionStorage.getItem(onceKey))) return false;
  } catch { /* In-memory protection still works when storage is unavailable. */ }
  try {
    // Queue safely when the asynchronous GA tag has not loaded yet.
    window.dataLayer = window.dataLayer || [];
    // Google's gtag queue contract uses an Arguments object, not a raw event array.
    // eslint-disable-next-line prefer-rest-params
    const send = window.gtag || function (..._args: unknown[]) { window.dataLayer.push(arguments); };
    // One command, one event per unique GA4 destination; never send to Ads tags.
    send('event', name, { ...parameters, send_to: measurementIds });
    if (onceKey) {
      recorded.add(onceKey);
      try { window.sessionStorage.setItem(onceKey, '1'); } catch { /* optional */ }
    }
    return true;
  } catch { return false; }
}

export function trackConfirmedEmailSignup(response: unknown) {
  if (!response || typeof response !== 'object') return false;
  const data = response as { ok?: unknown; enrollment?: unknown; id?: unknown };
  if (data.ok !== true || data.enrollment !== 'enrolled' || typeof data.id !== 'string' || !data.id) return false;
  return emitLaunchEvent('email_signup', data.id);
}

export function trackNewClarityResult(result: unknown) {
  if (!result || typeof result !== 'object') return false;
  const data = result as { analyticsAttemptId?: unknown; scores?: { totalScore?: unknown }; resultSummary?: unknown };
  if (typeof data.analyticsAttemptId !== 'string' || !data.analyticsAttemptId || typeof data.scores?.totalScore !== 'number' || typeof data.resultSummary !== 'string' || !data.resultSummary) return false;
  return emitLaunchEvent('clarity_check_complete', data.analyticsAttemptId);
}

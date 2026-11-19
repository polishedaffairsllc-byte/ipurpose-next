/** Campaign constants shared by the private pitch page and its analytics. */
export const FOUNDHERS_CAMPAIGN = 'foundhers_2026';
export const FOUNDHERS_PATH = '/foundhers-stage';
export const FOUNDHERS_UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

/** Keep first-touch attribution, using the same session key as useUTMParams. */
export function foundhersAttribution(search: string, stored: string | null): URLSearchParams {
  const result = new URLSearchParams();
  let previous: Record<string, unknown> = {};
  try { previous = JSON.parse(stored || '{}') || {}; } catch { /* recapture invalid storage */ }
  const incoming = new URLSearchParams(search);
  const hasPrevious = FOUNDHERS_UTM_KEYS.some(key => typeof previous[key] === 'string' && previous[key]);
  for (const key of FOUNDHERS_UTM_KEYS) {
    const value = hasPrevious ? previous[key] : incoming.get(key);
    if (typeof value === 'string' && value) result.set(key, value.slice(0, 200));
  }
  return result;
}

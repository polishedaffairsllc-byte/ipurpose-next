export type VisualEnvironmentName = 'depth' | 'renewal' | 'warmth';
export type VisualEnvironmentMode = 'manual' | 'auto';

export interface VisualEnvironmentPreference {
  mode: VisualEnvironmentMode;
  manualTheme: VisualEnvironmentName;
}

export const DEFAULT_VISUAL_ENVIRONMENT_PREFERENCE: VisualEnvironmentPreference = {
  mode: 'manual',
  manualTheme: 'depth',
};

const VISUAL_ENVIRONMENTS = new Set<VisualEnvironmentName>([
  'depth',
  'renewal',
  'warmth',
]);

export function normalizeVisualEnvironmentPreference(
  value: unknown
): VisualEnvironmentPreference {
  if (!value || typeof value !== 'object') {
    return DEFAULT_VISUAL_ENVIRONMENT_PREFERENCE;
  }

  const candidate = value as Partial<VisualEnvironmentPreference>;
  if (
    (candidate.mode === 'manual' || candidate.mode === 'auto')
    && typeof candidate.manualTheme === 'string'
    && VISUAL_ENVIRONMENTS.has(candidate.manualTheme as VisualEnvironmentName)
  ) {
    return {
      mode: candidate.mode,
      manualTheme: candidate.manualTheme as VisualEnvironmentName,
    };
  }

  return DEFAULT_VISUAL_ENVIRONMENT_PREFERENCE;
}

function getHour(now: Date, timezone?: string) {
  if (timezone) {
    try {
      const hour = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        hourCycle: 'h23',
        timeZone: timezone,
      }).formatToParts(now).find((part) => part.type === 'hour')?.value;
      const parsed = Number(hour);
      if (Number.isInteger(parsed) && parsed >= 0 && parsed <= 23) return parsed;
    } catch {
      // Invalid or unsupported profile timezone: fall back to device local time.
    }
  }

  return now.getHours();
}

export function resolveVisualEnvironment(
  preference: VisualEnvironmentPreference,
  now: Date = new Date(),
  timezone?: string
): VisualEnvironmentName {
  if (preference.mode === 'manual') return preference.manualTheme;

  const hour = getHour(now, timezone);
  if (hour >= 5 && hour < 12) return 'renewal';
  if (hour >= 12 && hour < 19) return 'warmth';
  return 'depth';
}

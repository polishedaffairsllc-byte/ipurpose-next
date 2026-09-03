const MAX_TIMEZONE_LENGTH = 100;

export function normalizeIanaTimezone(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const candidate = value.trim();
  if (!candidate || candidate.length > MAX_TIMEZONE_LENGTH) return null;

  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: candidate,
    }).resolvedOptions().timeZone;
  } catch {
    return null;
  }
}

export function getDeviceTimezone() {
  const resolved = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return normalizeIanaTimezone(resolved) ?? 'UTC';
}

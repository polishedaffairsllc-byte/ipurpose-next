const MAX_TIMEZONE_LENGTH = 100;

/** Validate and canonicalize a timezone supported by the server ICU runtime. */
export function normalizeIanaTimezone(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const candidate = value.trim();
  if (!candidate || candidate.length > MAX_TIMEZONE_LENGTH) return null;

  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: candidate,
    }).resolvedOptions().timeZone;
  } catch {
    return null;
  }
}

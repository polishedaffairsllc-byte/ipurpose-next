type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as UnknownRecord
    : {};
}

export function normalizeFocusAreas(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 2);
}

export function hasExistingFocus(profile: unknown): boolean {
  const data = asRecord(profile);
  const aiPreferences = asRecord(data.aiPreferences);
  return normalizeFocusAreas(data.focusAreas).length > 0
    || normalizeFocusAreas(data.businessGoals).length > 0
    || normalizeFocusAreas(aiPreferences.focusAreas).length > 0;
}

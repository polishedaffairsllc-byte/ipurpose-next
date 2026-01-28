export function isBlank(value?: string | null) {
  return !value || value.trim().length === 0;
}

export function hasMeaningfulText(value?: string | null, minChars = 50, minWords = 20) {
  if (!value) return false;
  const trimmed = value.trim();
  if (trimmed.length >= minChars) return true;
  const words = trimmed.match(/\S+/g) ?? [];
  return words.length >= minWords;
}

export function clampText(value: unknown, maxChars = 25000) {
  if (typeof value !== "string") return null;
  return value.slice(0, maxChars);
}

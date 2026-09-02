export type VisualEnvironmentName = "depth" | "renewal" | "warmth";
export type VisualEnvironmentMode = "manual" | "auto";

export interface VisualEnvironmentPreference {
  mode: VisualEnvironmentMode;
  manualTheme: VisualEnvironmentName;
}

export const DEFAULT_VISUAL_ENVIRONMENT_PREFERENCE: VisualEnvironmentPreference = {
  mode: "manual",
  manualTheme: "depth",
};

const VISUAL_ENVIRONMENTS = new Set<VisualEnvironmentName>([
  "depth",
  "renewal",
  "warmth",
]);

export function parseVisualEnvironmentPreference(
  value: unknown
): VisualEnvironmentPreference | null {
  if (!value || typeof value !== "object") return null;

  const candidate = value as {
    mode?: unknown;
    manualTheme?: unknown;
  };
  if (
    (candidate.mode === "manual" || candidate.mode === "auto")
    && typeof candidate.manualTheme === "string"
    && VISUAL_ENVIRONMENTS.has(candidate.manualTheme as VisualEnvironmentName)
  ) {
    return {
      mode: candidate.mode,
      manualTheme: candidate.manualTheme as VisualEnvironmentName,
    };
  }

  return null;
}

export function getVisualEnvironmentPreference(
  value: unknown
): VisualEnvironmentPreference {
  return parseVisualEnvironmentPreference(value)
    ?? DEFAULT_VISUAL_ENVIRONMENT_PREFERENCE;
}

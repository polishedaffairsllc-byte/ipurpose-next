export const INTRO_FLAGS = {
  welcome: 'hasCompletedWelcome',
  clarity: 'hasSeenClarityIntro',
  purpose: 'hasSeenPurposeIntro',
  compass: 'hasSeenCompassIntro',
} as const;

export type IntroKind = keyof typeof INTRO_FLAGS;
export type IntroCompletions = Partial<Record<typeof INTRO_FLAGS[IntroKind], boolean>>;

export function isIntroKind(value: unknown): value is IntroKind {
  return typeof value === 'string' && Object.hasOwn(INTRO_FLAGS, value);
}

// Absence means unseen. Only literal true is accepted; completion is monotonic.
export function readIntroCompletions(value: unknown): IntroCompletions {
  const record = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return Object.fromEntries(Object.values(INTRO_FLAGS).filter((flag) => record[flag] === true).map((flag) => [flag, true]));
}

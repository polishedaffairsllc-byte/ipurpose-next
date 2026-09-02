export function getDisplayName(
  displayName?: string | null,
  email?: string | null
) {
  if (displayName?.trim()) return displayName.trim();

  const emailName = email?.split('@')[0]?.replace(/[._-]+/g, ' ').trim();
  if (!emailName) return 'iPurpose member';

  return emailName.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getGreetingName(
  profileDisplayName?: string | null,
  authDisplayName?: string | null,
  email?: string | null
): string | null {
  const namedCandidate = [profileDisplayName, authDisplayName]
    .map((value) => value?.trim())
    .find(Boolean);

  if (namedCandidate) return namedCandidate.split(/\s+/)[0];

  const derivedDisplayName = getDisplayName(undefined, email);
  if (derivedDisplayName === 'iPurpose member') return null;
  return derivedDisplayName.split(/\s+/)[0];
}

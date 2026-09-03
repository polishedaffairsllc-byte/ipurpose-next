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
  const getReliableFirstName = (value?: string | null) => {
    const trimmedValue = value?.trim();
    if (!trimmedValue) return null;

    const isHandleLike =
      !/\s/.test(trimmedValue) && /[a-z][A-Z]/.test(trimmedValue);
    if (isHandleLike) return null;

    return trimmedValue.split(/\s+/)[0];
  };

  const namedCandidate = [profileDisplayName, authDisplayName]
    .map(getReliableFirstName)
    .find((value) => value !== null);

  if (namedCandidate) return namedCandidate;

  const derivedDisplayName = getDisplayName(undefined, email);
  if (derivedDisplayName === 'iPurpose member') return null;
  return getReliableFirstName(derivedDisplayName);
}

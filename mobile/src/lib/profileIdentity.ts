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
  preferredDisplayName?: string | null,
  fallbackDisplayName?: string | null,
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

  const namedCandidate = [preferredDisplayName, fallbackDisplayName]
    .map(getReliableFirstName)
    .find((value) => value !== null);

  if (namedCandidate) return namedCandidate;

  const derivedDisplayName = getDisplayName(undefined, email);
  if (derivedDisplayName === 'iPurpose member') return null;
  return getReliableFirstName(derivedDisplayName);
}
export const SIGNUP_NAME_MAX_LENGTH = 80;

export interface SignupName {
  firstName: string;
  lastName: string;
}

export function parseSignupName(first: unknown, last: unknown): SignupName | null {
  if (typeof first !== 'string' || typeof last !== 'string') return null;
  const firstName = first.trim();
  const lastName = last.trim();
  if (!firstName || !lastName || firstName.length > SIGNUP_NAME_MAX_LENGTH || lastName.length > SIGNUP_NAME_MAX_LENGTH) {
    return null;
  }
  return { firstName, lastName };
}

export function formatSignupName({ firstName, lastName }: SignupName) {
  return `${firstName} ${lastName}`;
}

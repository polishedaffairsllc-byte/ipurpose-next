import { getTimeZones } from '@vvo/tzdb';

export interface TimezoneOption {
  city: string;
  country: string;
  timezone: string;
  searchTerms: string[];
  equivalentTimezones: string[];
}

const TIMEZONE_OPTIONS: TimezoneOption[] = getTimeZones({ includeUtc: true }).map((timezone) => {
  const city = timezone.mainCities.find(Boolean)
    || timezone.name.split('/').at(-1)?.replaceAll('_', ' ')
    || timezone.name;

  return {
    city,
    country: timezone.countryName || timezone.continentName || 'Universal time',
    timezone: timezone.name,
    searchTerms: [
      timezone.alternativeName,
      timezone.abbreviation,
      timezone.continentName,
      timezone.countryCode,
      ...timezone.mainCities,
      ...timezone.group.map((name) => name.replaceAll('_', ' ')),
    ],
    equivalentTimezones: timezone.group,
  };
});

const DEFAULT_TIMEZONES = new Set([
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'America/Caracas',
  'Europe/London',
  'Europe/Paris',
  'Asia/Kolkata',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Etc/UTC',
]);

function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .trim();
}

function searchableText(option: TimezoneOption) {
  return normalizeSearch([
    option.city,
    option.country,
    option.timezone.replaceAll('_', ' '),
    ...option.searchTerms,
  ].join(' '));
}

export function searchTimezoneOptions(query: string, limit = 12) {
  const search = normalizeSearch(query);
  const candidates = search
    ? TIMEZONE_OPTIONS.filter((option) => searchableText(option).includes(search))
    : TIMEZONE_OPTIONS.filter((option) => DEFAULT_TIMEZONES.has(option.timezone));

  return candidates
    .sort((left, right) => {
      if (search) {
        const leftCity = normalizeSearch(left.city);
        const rightCity = normalizeSearch(right.city);
        const leftCountry = normalizeSearch(left.country);
        const rightCountry = normalizeSearch(right.country);
        const leftRank = leftCity === search ? 0 : leftCity.startsWith(search) ? 1 : leftCountry === search ? 2 : 3;
        const rightRank = rightCity === search ? 0 : rightCity.startsWith(search) ? 1 : rightCountry === search ? 2 : 3;
        if (leftRank !== rightRank) return leftRank - rightRank;
      }
      return left.city.localeCompare(right.city);
    })
    .slice(0, limit);
}

export function getTimezoneDisplayName(timezone: string) {
  const option = TIMEZONE_OPTIONS.find((candidate) =>
    candidate.timezone === timezone || candidate.equivalentTimezones.includes(timezone)
  );
  if (option) return `${option.city}, ${option.country}`;

  const parts = timezone.split('/');
  return (parts.at(-1) || timezone).replaceAll('_', ' ');
}

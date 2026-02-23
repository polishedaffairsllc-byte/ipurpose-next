/**
 * Canonical URL Utility
 * 
 * Generates proper canonical URLs for all pages
 * Ensures SEO consolidation around https://ipurposesoul.com
 */

const CANONICAL_DOMAIN = 'https://ipurposesoul.com';

/**
 * Get canonical URL for a given pathname
 * @param pathname - The pathname (e.g., '/program', '/soul/chat')
 * @returns Full canonical URL
 */
export function getCanonicalUrl(pathname: string): string {
  // Ensure pathname starts with /
  const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  
  // Remove trailing slash except for root
  const normalizedPath = cleanPath === '/' 
    ? '' 
    : cleanPath.replace(/\/$/, '');
  
  return `${CANONICAL_DOMAIN}${normalizedPath}`;
}

/**
 * Generate metadata alternates object with canonical URL
 * @param pathname - The page pathname
 * @returns Metadata alternates object
 */
export function getCanonicalMetadata(pathname: string) {
  return {
    canonical: getCanonicalUrl(pathname),
  };
}

export const CANONICAL_DOMAIN_CONFIG = {
  domain: CANONICAL_DOMAIN,
  // All domains that redirect to canonical
  redirectDomains: [
    'mshmltn.com',
    'www.mshmltn.com',
    'ipurposesoul.online',
    'www.ipurposesoul.online',
    'ipurpose.com',
    'www.ipurpose.com',
    'www.ipurposesoul.com',
  ],
};

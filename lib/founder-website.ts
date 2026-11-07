import { emitLaunchEvent } from './launch-metrics/events';

export const FOUNDER_WEBSITE_URL = 'https://mshmltn.com/?utm_source=ipurpose&utm_medium=referral&utm_campaign=founder_profile&utm_content=about_founder_link';

/** Count link activations only after the existing GA loader resolves traffic exclusions. */
export function trackFounderWebsiteClick(): boolean {
  if (typeof window === 'undefined' ||
      (window as Window & { __ipurposeGA4Ready?: boolean }).__ipurposeGA4Ready !== true) return false;

  return emitLaunchEvent('founder_website_click', undefined, {
    link_id: 'about_founder_website',
    link_url: FOUNDER_WEBSITE_URL,
    link_domain: 'mshmltn.com',
    source_page: '/about',
    outbound: true,
    transport_type: 'beacon',
  });
}

'use client';

import { FOUNDER_WEBSITE_URL, trackFounderWebsiteClick } from '@/lib/founder-website';

export default function FounderWebsiteLink() {
  return (
    <a
      href={FOUNDER_WEBSITE_URL}
      onClick={() => { trackFounderWebsiteClick(); }}
      onAuxClick={event => { if (event.button === 1) trackFounderWebsiteClick(); }}
      className="inline-block font-marcellus font-bold text-lavenderViolet underline underline-offset-4 hover:text-warmCharcoal transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lavenderViolet"
      style={{ fontSize: '35px' }}
    >
      Visit MsHmltn.com
    </a>
  );
}

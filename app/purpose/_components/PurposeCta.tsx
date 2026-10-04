'use client';

import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';

// Verified against app/clarity-check/page.tsx and its canonical metadata.
export const CLARITY_CHECK_ROUTE = '/clarity-check';

export default function PurposeCta({ slug, label }: { slug: string; label?: string }) {
  if (!label) return null;

  return (
    <Link
      href={CLARITY_CHECK_ROUTE}
      data-purpose-cta={slug}
      className="purpose:mt-8 purpose:inline-flex purpose:min-h-12 purpose:max-w-full purpose:items-center purpose:justify-center purpose:rounded-full purpose:bg-salmonPeach purpose:px-6 purpose:py-4 purpose:text-center purpose:font-marcellus purpose:text-base purpose:font-semibold purpose:text-indigoDeep purpose:transition-colors purpose:hover:bg-lightMistGray purpose:focus-visible:outline-2 purpose:focus-visible:outline-offset-4 purpose:focus-visible:outline-lightMistGray purpose:sm:px-8"
      onClick={() => trackEvent('purpose_cta_click', {
        page_slug: slug,
        page_path: slug === 'index' ? '/purpose' : `/purpose/${slug}`,
        cta_text: label,
        link_url: CLARITY_CHECK_ROUTE,
        transport_type: 'beacon',
      })}
    >
      {label}
    </Link>
  );
}

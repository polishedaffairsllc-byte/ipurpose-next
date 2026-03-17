'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * /clarity-check-numeric is the legacy URL used in existing Google Ads campaigns.
 * Traffic is client-side redirected to /clarity-check-quiz so the ad destination
 * keeps working while preserving gclid and UTM parameters for conversion tracking.
 */
export default function ClarityCheckNumericRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams.toString();
    const destination = qs ? `/clarity-check-quiz?${qs}` : '/clarity-check-quiz';
    router.replace(destination);
  }, [router, searchParams]);

  return null;
}

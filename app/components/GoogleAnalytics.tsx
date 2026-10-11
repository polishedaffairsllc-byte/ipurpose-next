'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Loads GA4 only for public/product routes and disables collection on /admin.
 *
 * This keeps owner/admin dashboard activity out of future customer-facing GA4
 * traffic while preserving the existing public-site measurement behavior.
 * Owner activity on public routes still requires GA4 internal-traffic rules or
 * a reporting segment; geography alone must never be used as the exclusion.
 */
export default function GoogleAnalytics() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin') ?? false;

  useEffect(() => {
    if (!measurementId) return;
    const gaWindow = window as typeof window & Record<string, unknown>;
    gaWindow[`ga-disable-${measurementId}`] = isAdminRoute;
  }, [isAdminRoute]);

  if (!measurementId || isAdminRoute) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script
        id="ga4-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window['ga-disable-${measurementId}'] = false;
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              'anonymize_ip': true,
              'allow_google_signals': false
            });
          `,
        }}
      />
    </>
  );
}

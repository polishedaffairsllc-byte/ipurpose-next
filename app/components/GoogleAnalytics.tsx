'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const INTERNAL_BROWSER_KEY = 'ipurpose_internal_traffic';

/**
 * Loads GA4 only for public/product routes and excludes known internal browsers.
 *
 * Any browser that visits /admin is marked as internal in localStorage. That
 * same browser then remains excluded from future GA4 collection on public
 * routes as well. This identifies owner/admin devices by observed behavior,
 * not by geography or personally identifying information.
 */
export default function GoogleAnalytics() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin') ?? false;
  const [isInternalBrowser, setIsInternalBrowser] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!measurementId) return;

    let internal = false;
    try {
      if (isAdminRoute) {
        window.localStorage.setItem(INTERNAL_BROWSER_KEY, '1');
        internal = true;
      } else {
        internal = window.localStorage.getItem(INTERNAL_BROWSER_KEY) === '1';
      }
    } catch {
      // If storage is unavailable, /admin is still excluded for this route.
      internal = isAdminRoute;
    }

    setIsInternalBrowser(internal);
    setReady(true);

    const gaWindow = window as typeof window & Record<string, unknown>;
    gaWindow[`ga-disable-${measurementId}`] = isAdminRoute || internal;
  }, [isAdminRoute]);

  if (!measurementId || !ready || isAdminRoute || isInternalBrowser) return null;

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

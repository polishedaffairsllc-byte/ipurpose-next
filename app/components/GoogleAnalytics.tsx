'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const INTERNAL_BROWSER_KEY = 'ipurpose_internal_traffic';
const QA_BROWSER_KEY = 'ipurpose_qa_traffic';

function hasKnownQaSignal() {
  try {
    const params = new URLSearchParams(window.location.search);
    const source = params.get('utm_source')?.toLowerCase();
    return source === 'codex_qa' || params.get('ipurpose_qa') === '1';
  } catch {
    return false;
  }
}

/**
 * Loads GA4 only for public/product routes and excludes known internal/QA browsers.
 *
 * Any browser that visits /admin is marked as internal in localStorage. QA
 * browsers can be marked by the known Codex QA source (utm_source=codex_qa) or
 * the explicit ipurpose_qa=1 switch. Those browsers then remain excluded from
 * future GA4 collection on public routes. This identifies known test behavior
 * without using geography or personally identifying information.
 */
export default function GoogleAnalytics() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin') ?? false;
  const [isExcludedBrowser, setIsExcludedBrowser] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!measurementId) return;

    let excluded = false;
    try {
      if (isAdminRoute) {
        window.localStorage.setItem(INTERNAL_BROWSER_KEY, '1');
      }
      if (hasKnownQaSignal()) {
        window.localStorage.setItem(QA_BROWSER_KEY, '1');
      }

      excluded =
        isAdminRoute ||
        window.localStorage.getItem(INTERNAL_BROWSER_KEY) === '1' ||
        window.localStorage.getItem(QA_BROWSER_KEY) === '1';
    } catch {
      // If storage is unavailable, still exclude the current admin or explicit QA route.
      excluded = isAdminRoute || hasKnownQaSignal();
    }

    setIsExcludedBrowser(excluded);
    setReady(true);

    const gaWindow = window as typeof window & Record<string, unknown>;
    gaWindow[`ga-disable-${measurementId}`] = excluded;
  }, [isAdminRoute, pathname]);

  if (!measurementId || !ready || isExcludedBrowser) return null;

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

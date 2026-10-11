'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { getLaunchMeasurementIds } from '@/lib/launch-metrics/config';

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

function isOwnerOrAdminProfile(profile: any) {
  if (!profile) return false;
  const role = String(profile.role || '').toLowerCase();
  const tier = String(profile.entitlementTier || '').toLowerCase();
  return profile.isFounder === true || role === 'admin' || role === 'founder' || tier === 'founder';
}

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin') ?? false;
  const [isExcludedBrowser, setIsExcludedBrowser] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!measurementId) return;

    let cancelled = false;

    async function resolveExclusion() {
      let excluded = false;
      const explicitQa = hasKnownQaSignal();

      try {
        if (isAdminRoute) window.localStorage.setItem(INTERNAL_BROWSER_KEY, '1');
        if (explicitQa) window.localStorage.setItem(QA_BROWSER_KEY, '1');
        excluded =
          isAdminRoute ||
          window.localStorage.getItem(INTERNAL_BROWSER_KEY) === '1' ||
          window.localStorage.getItem(QA_BROWSER_KEY) === '1';
      } catch {
        excluded = isAdminRoute || explicitQa;
      }

      if (!excluded) {
        try {
          const res = await fetch('/api/auth/me', { credentials: 'include', cache: 'no-store' });
          if (res.ok) {
            const json = await res.json();
            if (isOwnerOrAdminProfile(json?.user)) {
              excluded = true;
              try { window.localStorage.setItem(INTERNAL_BROWSER_KEY, '1'); } catch { /* optional */ }
            }
          }
        } catch {
          // Preserve the explicit browser/route decision if auth lookup fails.
        }
      }

      if (cancelled) return;

      setIsExcludedBrowser(excluded);
      setReady(true);

      const gaWindow = window as typeof window & Record<string, unknown>;
      for (const id of getLaunchMeasurementIds()) gaWindow[`ga-disable-${id}`] = excluded;
    }

    resolveExclusion();
    return () => { cancelled = true; };
  }, [isAdminRoute, pathname]);

  if (!measurementId || !ready || isExcludedBrowser) return null;

  const destinations = getLaunchMeasurementIds();
  const secondaryIds = destinations.filter(id => id !== measurementId);

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script
        id="ga4-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', { 'anonymize_ip': true, 'allow_google_signals': false });
            ${secondaryIds.map(id => `gtag('config', '${id}', { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false });`).join('\n')}
          `,
        }}
      />
    </>
  );
}

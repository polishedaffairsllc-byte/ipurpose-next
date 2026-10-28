'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

export default function GoogleAds() {
  const pathname = usePathname();
  if (pathname === '/foundhers-stage' || pathname.startsWith('/partnerships/sdsn/') || pathname.startsWith('/partnerships/ug/')) return null;

  return <>
    <Script
      async
      src="https://www.googletagmanager.com/gtag/js?id=AW-17993147612"
      strategy="afterInteractive"
    />
    <Script
      id="google-ads-config"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-17993147612', {
                'allow_google_signals': true,
                'allow_ad_personalization_signals': true
              });
            `,
      }}
    />
  </>;
}

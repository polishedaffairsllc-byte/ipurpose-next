'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

export default function PitchAnalytics({ audience }: { audience: string }) {
  useEffect(() => {
    const fireView = () => {
      trackEvent('sdsn_pitch_view', {
        pitch_audience: audience,
        page_path: window.location.pathname,
        utm_content: new URLSearchParams(window.location.search).get('utm_content') || undefined,
        referrer_host: document.referrer ? new URL(document.referrer).hostname : undefined,
      });
    };

    const timer = window.setTimeout(fireView, 500);

    const handleClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-pitch-action]');
      if (!target) return;

      trackEvent('sdsn_pitch_cta_click', {
        pitch_audience: audience,
        action: target.dataset.pitchAction,
        page_path: window.location.pathname,
      });
    };

    document.addEventListener('click', handleClick);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('click', handleClick);
    };
  }, [audience]);

  return null;
}

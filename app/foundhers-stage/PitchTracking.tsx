'use client';

import { useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/analytics';
import { getLaunchMeasurementIds } from '@/lib/launch-metrics/config';
import { foundhersAttribution, FOUNDHERS_CAMPAIGN } from '@/lib/foundhers';
import { createOutreachLogger } from '@/lib/outreach/client';

/** Reuses the root GA loader. Native anchor navigation preserves its page-view behavior. */
export default function PitchTracking({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const viewed = useRef(false);
  const outreach = useRef<ReturnType<typeof createOutreachLogger> | null>(null);
  useEffect(() => {
    const container = root.current;
    if (!container) return;
    const logOutreach = outreach.current ||= createOutreachLogger();
    let stored: string | null = null;
    try { stored = sessionStorage.getItem('ipurpose_utm'); } catch { /* storage is optional */ }
    const attribution = foundhersAttribution(window.location.search, stored);
    if (attribution.size) {
      try { sessionStorage.setItem('ipurpose_utm', JSON.stringify(Object.fromEntries(attribution))); } catch { /* pass via links */ }
      container.querySelectorAll<HTMLAnchorElement>('a[data-cta-id]').forEach(link => {
        const url = new URL(link.getAttribute('href')!, window.location.origin);
        attribution.forEach((value, key) => url.searchParams.set(key, value));
        link.href = `${url.pathname}${url.search}${url.hash}`;
      });
    }
    const excluded = () => {
      const gaWindow = window as typeof window & Record<string, unknown>;
      if (getLaunchMeasurementIds().some(id => gaWindow[`ga-disable-${id}`] === true)) return true;
      const query = new URLSearchParams(window.location.search);
      if (query.get('ipurpose_qa') === '1' || query.get('utm_source') === 'codex_qa') return true;
      try { return localStorage.getItem('ipurpose_internal_traffic') === '1' || localStorage.getItem('ipurpose_qa_traffic') === '1'; } catch { return false; }
    };
    const ready = () => (window as Window & { __ipurposeGA4Ready?: boolean }).__ipurposeGA4Ready === true;
    const view = () => {
      if (viewed.current || !ready() || excluded()) return;
      viewed.current = true;
      logOutreach('foundhers_pitch_view', {});
      trackEvent('foundhers_pitch_view', { source_page: 'foundhers_stage', campaign: FOUNDHERS_CAMPAIGN, send_to: getLaunchMeasurementIds() });
    };
    const click = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[data-cta-id]') : null;
      if (!link || !container.contains(link) || !ready() || excluded()) return;
      logOutreach('foundhers_cta_click', { cta_id: link.dataset.ctaId || '' });
      trackEvent('foundhers_cta_click', {
        cta_id: link.dataset.ctaId, cta_label: link.textContent?.trim(), section: link.dataset.section,
        destination: new URL(link.href).pathname, campaign: FOUNDHERS_CAMPAIGN,
        source_page: 'foundhers_stage', send_to: getLaunchMeasurementIds(), transport_type: 'beacon',
      });
    };
    view();
    window.addEventListener('ipurpose:ga4-ready', view);
    container.addEventListener('click', click);
    return () => { window.removeEventListener('ipurpose:ga4-ready', view); container.removeEventListener('click', click); };
  }, []);
  return <div ref={root} className="foundhers-shell">{children}</div>;
}

'use client';
import { useCallback, useEffect, useRef } from 'react';
import { ArrowUpRight, Download, Mail } from 'lucide-react';
import { trackSDSNEvent } from '@/lib/partnerships/sdsn-analytics';
import { SDSN_LABELS } from '@/lib/partnerships/sdsn';
import { partnershipEventName, type PartnershipConfig } from '@/lib/partnerships/presentation';
import PresentationViewer, { type ViewerEvent } from './PresentationViewer';

type EventParams = Record<string, string | number>;
export default function PartnershipPresentation({ config }: { config: PartnershipConfig }) {
  const prefix = config.analyticsPrefix ?? 'sdsn';
  const visit = useRef<{ internal: boolean; number: number } | null>(null);
  const emit = useCallback((name: string, params: EventParams = {}) => {
    // Queue through the existing event helper even before the GA script is ready.
    window.dataLayer = window.dataLayer || [];
    // Google's gtag queue expects an Arguments object.
    // eslint-disable-next-line prefer-rest-params
    window.gtag = window.gtag || function (..._args: unknown[]) { window.dataLayer.push(arguments); };
    if (!visit.current) {
      let internal = new URLSearchParams(window.location.search).get('preview') === '1';
      let number = 1;
      try {
        if (internal) localStorage.setItem('sdsn_internal_v1', '1');
        internal = internal || localStorage.getItem('sdsn_internal_v1') === '1';
        const key = `${prefix}_visits_v1_${config.slug}`;
        const stored = Number(localStorage.getItem(key));
        number = Number.isFinite(stored) && stored >= 0 ? Math.floor(stored) + 1 : 1;
        localStorage.setItem(key, String(number));
      } catch { /* Storage is optional, including in private browsers. */ }
      visit.current = { internal, number };
      const pageParams = {
        recipient_id: config.slug, deck_variant: config.deckVariant, visit_number: number,
        ...(internal ? { traffic_type: 'internal', debug_mode: true } : {}),
      };
      const pageEvent = partnershipEventName('sdsn_page_view', prefix);
      trackSDSNEvent(pageEvent, pageParams);
      if (internal) console.debug(`[${prefix.toUpperCase()}]`, pageEvent, JSON.stringify(pageParams));
    }
    if (name === 'sdsn_page_view') return;
    const eventParams = {
      ...params, recipient_id: config.slug, deck_variant: config.deckVariant,
      ...(visit.current.internal ? { traffic_type: 'internal', debug_mode: true } : {}),
    };
    const eventName = partnershipEventName(name, prefix);
    trackSDSNEvent(eventName, eventParams);
    if (visit.current.internal) console.debug(`[${prefix.toUpperCase()}]`, eventName, JSON.stringify(eventParams));
  }, [config.slug, config.deckVariant, prefix]);
  useEffect(() => { emit('sdsn_page_view'); }, [emit]);
  const onViewerEvent = useCallback((name: ViewerEvent, params?: EventParams) => emit(name, params), [emit]);
  return <main className={`sdsn-page min-h-screen${prefix === 'ug' ? ' ug-page' : ''}${prefix === 'knust' ? ' knust-page' : ''}`}>
    <a className="sdsn-skip" href="#sdsn-presentation">Skip to presentation</a>
    <header className="sdsn-brand"><div className="sdsn-container">
      <a href="https://ipurposesoul.com" target="_blank" rel="noopener noreferrer" aria-label="Visit iPurpose (opens in a new tab)" onClick={() => emit('sdsn_visit_ipurpose_click')} className="sdsn-wordmark">iPurpose<span aria-hidden="true">.</span></a>
    </div></header>
    <section className="sdsn-intro" aria-labelledby="sdsn-title"><div className="sdsn-container">
      <p className="sdsn-eyebrow">Prepared for {config.recipientName}{config.recipientRole ? ` · ${config.recipientRole}` : ''}</p>
      <h1 id="sdsn-title">{config.h1}</h1>
      <p className="sdsn-subtitle">{config.sub}</p>
      <div className="sdsn-signature"><p>Renita Hamilton, MPS — Founder &amp; CEO, iPurpose</p><p>Strategic Leadership · Social Impact · AI-Enabled Human Development</p></div>
    </div></section>
    <section id="sdsn-presentation" className="sdsn-deck-section sdsn-container" aria-label={config.deckTitle}>
      <PresentationViewer deckTitle={config.deckTitle} slides={config.slides} onEvent={onViewerEvent} />
    </section>
    <section className="sdsn-contact sdsn-container" aria-labelledby="sdsn-contact-title">
      <div className="sdsn-contact-copy"><span className="sdsn-contact-line" aria-hidden="true"/><h2 id="sdsn-contact-title">{SDSN_LABELS.contactHeading}</h2><p>A 30-minute conversation, no long-term commitment.</p></div>
      <div className="sdsn-actions">
        <a className="sdsn-primary" href={`mailto:${config.contactEmail}?subject=${encodeURIComponent(config.mailtoSubject)}`} onClick={() => emit('sdsn_contact_click', { method: 'mailto' })}><Mail size={19} aria-hidden="true"/><span>{SDSN_LABELS.primary}</span></a>
        <div className="sdsn-secondary-actions">
          <a href="https://ipurposesoul.com" target="_blank" rel="noopener noreferrer" onClick={() => emit('sdsn_visit_ipurpose_click')}>{SDSN_LABELS.secondary}<ArrowUpRight size={17} aria-hidden="true"/></a>
          {config.pdfUrl ? <a href={config.pdfUrl} download onClick={() => emit('sdsn_pdf_download')}>{SDSN_LABELS.tertiary}<Download size={17} aria-hidden="true"/></a> : null}
        </div>
        {config.overviewUrl || config.videoUrl ? <div className="sdsn-secondary-actions ug-resources">
          {config.overviewUrl ? <a href={config.overviewUrl} download onClick={() => emit('sdsn_overview_download')}>Download the one-page overview<Download size={17} aria-hidden="true"/></a> : null}
          {config.videoUrl ? <a href={config.videoUrl} target="_blank" rel="noopener noreferrer" onClick={() => emit('sdsn_video_click')}>Watch the 2–3 minute walkthrough<ArrowUpRight size={17} aria-hidden="true"/></a> : null}
        </div> : null}
      </div>
    </section>
    <footer className="sdsn-footer">© 2026 iPurpose. All rights reserved.</footer>
  </main>;
}

'use client';
import { useCallback, useEffect, useRef } from 'react';
import { ArrowUpRight, Download, Mail } from 'lucide-react';
import { trackSDSNEvent } from '@/lib/partnerships/sdsn-analytics';
import { SDSN_LABELS, type SDSNConfig } from '@/lib/partnerships/sdsn';
import PresentationViewer, { type ViewerEvent } from './PresentationViewer';

type EventParams = Record<string, string | number>;
export default function PartnershipPresentation({ config }: { config: SDSNConfig }) {
  const visit = useRef<{ internal: boolean; number: number } | null>(null);
  const emit = useCallback((name: string, params: EventParams = {}) => {
    // Queue through the existing event helper even before the GA script is ready.
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function (..._args: unknown[]) { window.dataLayer.push(arguments); };
    if (!visit.current) {
      let internal = new URLSearchParams(window.location.search).get('preview') === '1';
      let number = 1;
      try {
        if (internal) localStorage.setItem('sdsn_internal_v1', '1');
        internal = internal || localStorage.getItem('sdsn_internal_v1') === '1';
        const key = `sdsn_visits_v1_${config.slug}`;
        const stored = Number(localStorage.getItem(key));
        number = Number.isFinite(stored) && stored >= 0 ? Math.floor(stored) + 1 : 1;
        localStorage.setItem(key, String(number));
      } catch { /* Storage is optional, including in private browsers. */ }
      visit.current = { internal, number };
      const pageParams = {
        recipient_id: config.slug, deck_variant: config.deckVariant, visit_number: number,
        ...(internal ? { traffic_type: 'internal', debug_mode: true } : {}),
      };
      trackSDSNEvent('sdsn_page_view', pageParams);
      if (internal) console.debug('[SDSN]', 'sdsn_page_view', JSON.stringify(pageParams));
    }
    if (name === 'sdsn_page_view') return;
    const eventParams = {
      ...params, recipient_id: config.slug, deck_variant: config.deckVariant,
      ...(visit.current.internal ? { traffic_type: 'internal', debug_mode: true } : {}),
    };
    trackSDSNEvent(name, eventParams);
    if (visit.current.internal) console.debug('[SDSN]', name, JSON.stringify(eventParams));
  }, [config.slug, config.deckVariant]);
  useEffect(() => { emit('sdsn_page_view'); }, [emit]);
  const onViewerEvent = useCallback((name: ViewerEvent, params?: EventParams) => emit(name, params), [emit]);
  return <main className="sdsn-page min-h-screen">
    <a className="sdsn-skip" href="#sdsn-presentation">Skip to presentation</a>
    <header className="sdsn-brand"><div className="sdsn-container">
      <a href="https://ipurposesoul.com" target="_blank" rel="noopener noreferrer" aria-label="Visit iPurpose (opens in a new tab)" onClick={() => emit('sdsn_visit_ipurpose_click')} className="sdsn-wordmark">iPurpose<span aria-hidden="true">.</span></a>
    </div></header>
    <section className="sdsn-intro" aria-labelledby="sdsn-title"><div className="sdsn-container">
      <p className="sdsn-eyebrow">Prepared for {config.recipientName}{config.recipientRole ? ` · ${config.recipientRole}` : ''}</p>
      <h1 id="sdsn-title">{config.h1}</h1>
      <p className="sdsn-subtitle">{config.sub}</p>
      <div className="sdsn-signature"><p>Renita Hamilton, MPS — Founder, iPurpose</p><p>Strategic Leadership · Social Impact · AI-Enabled Human Development</p></div>
    </div></section>
    <section id="sdsn-presentation" className="sdsn-deck-section sdsn-container" aria-label="Partnership presentation">
      <PresentationViewer slides={config.slides} onEvent={onViewerEvent} />
    </section>
    <section className="sdsn-contact sdsn-container" aria-labelledby="sdsn-contact-title">
      <div className="sdsn-contact-copy"><span className="sdsn-contact-line" aria-hidden="true"/><h2 id="sdsn-contact-title">{SDSN_LABELS.contactHeading}</h2><p>A 30-minute conversation, no long-term commitment.</p></div>
      <div className="sdsn-actions">
        <a className="sdsn-primary" href={`mailto:${config.contactEmail}?subject=${encodeURIComponent(config.mailtoSubject)}`} onClick={() => emit('sdsn_contact_click', { method: 'mailto' })}><Mail size={19} aria-hidden="true"/><span>{SDSN_LABELS.primary}</span></a>
        <div className="sdsn-secondary-actions">
          <a href="https://ipurposesoul.com" target="_blank" rel="noopener noreferrer" onClick={() => emit('sdsn_visit_ipurpose_click')}>{SDSN_LABELS.secondary}<ArrowUpRight size={17} aria-hidden="true"/></a>
          {config.pdfUrl ? <a href={config.pdfUrl} download onClick={() => emit('sdsn_pdf_download')}>{SDSN_LABELS.tertiary}<Download size={17} aria-hidden="true"/></a> : null}
        </div>
      </div>
    </section>
    <footer className="sdsn-footer">© 2026 iPurpose. All rights reserved.</footer>
  </main>;
}

'use client';
import { useEffect, useRef } from 'react';
import { createSDSNEventSender } from '@/lib/partnerships/sdsn-analytics';
import type { Institution } from '@/lib/universities/institutions';
export default function UniversityTracker({ institution, token, sessionId, visitNumber, contactId, outreachId }: { institution: Institution; token: string; sessionId: string; visitNumber: number; contactId: string; outreachId: string }) {
  const state = useRef<{ send: ReturnType<typeof createSDSNEventSender>; sequence: number; number: number; interacted: boolean; viewed: Set<string> } | null>(null);
  useEffect(() => {
    const initial = !state.current;
    if (!state.current) {
      let number = visitNumber;
      try { const key = `university_visits_v1_${outreachId}`; const previous = Number(localStorage.getItem(key) || 0); number = Math.max(number, Number.isSafeInteger(previous) && previous < 999999 ? previous + 1 : 1); localStorage.setItem(key, String(number)); } catch { /* Storage optional. */ }
      state.current = { send: createSDSNEventSender(), sequence: 0, number, interacted: false, viewed: new Set() };
    }
    const tracking = state.current; const { send, number, viewed } = tracking;
    const emit = (name: string, params: Record<string, string | number | boolean> = {}) => {
      send(name, { institution_id: institution.institution_id, proposal_id: institution.proposal_id, recipient_id: contactId,
        deck_variant: 'university-brief', session_id: sessionId, visit_number: number, sequence: ++tracking.sequence, outreach_id: outreachId,
        traffic_type: 'internal', debug_mode: true, interaction_qualified: tracking.interacted, ...params });
    };
    if (initial) { emit('proposal_page_view'); if (number > 1) emit('proposal_return_visit'); }
    const observeInput = (event: Event) => { if (event.isTrusted && !document.hidden) tracking.interacted = true; };
    for (const name of ['wheel', 'pointerdown', 'touchstart', 'keydown']) document.addEventListener(name, observeInput, { passive: true });
    const timers = new Map<Element, ReturnType<typeof setTimeout>>();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        clearTimeout(timers.get(entry.target));
        if (entry.isIntersecting && !document.hidden && !viewed.has(entry.target.id)) timers.set(entry.target, setTimeout(() => {
          if (document.hidden || viewed.has(entry.target.id)) return;
          viewed.add(entry.target.id); emit('proposal_section_view', { section_id: entry.target.id });
        }, 700));
      }
    }, { threshold: 0.15 });
    document.querySelectorAll('[data-proposal-section]').forEach(section => observer.observe(section));
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as Element)?.closest<HTMLAnchorElement>('a[data-proposal-destination]');
      if (!anchor) return; observeInput(event);
      const destination = anchor.dataset.proposalDestination!;
      const eventId = crypto.randomUUID();
      if (destination === 'conversation') emit('proposal_cta_click', { cta_id: 'discuss' });
      emit(destination === 'conversation' ? 'proposal_meeting_request_click' : 'proposal_external_link_click', { destination_id: destination, event_id: eventId });
      // Browser beacon + awaited server redirect share an ID, so one click is persisted once.
      anchor.href = `/p/${token}/go/${destination}?event=${eventId}&seq=${tracking.sequence}&visit=${number}&interactive=${tracking.interacted ? '1' : '0'}`;
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => { observer.disconnect(); timers.forEach(clearTimeout); document.removeEventListener('click', onClick, { capture: true }); for (const name of ['wheel', 'pointerdown', 'touchstart', 'keydown']) document.removeEventListener(name, observeInput); };
  }, [institution, token, sessionId, visitNumber, contactId, outreachId]);
  return null;
}

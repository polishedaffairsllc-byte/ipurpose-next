'use client';
import { useCallback, useEffect, useRef } from 'react';
import PresentationViewer, { type ViewerEvent } from '@/app/partnerships/sdsn/[audience]/PresentationViewer';
import { createSDSNEventSender } from '@/lib/partnerships/sdsn-analytics';
import type { Institution } from '@/lib/universities/institutions';
import type { PresentationSlide } from '@/lib/partnerships/sdsn';
import styles from './university.module.css';
import { universityConversation } from '@/lib/universities/conversation';
type Props = { institution: Institution; token: string; sessionId: string; visitNumber: number; contactId: string; outreachId: string; slides: PresentationSlide[]; conversationBox?: [number, number, number, number] };
const placements = [
  { slide: 1, destination: 'ipurpose', label: 'Visit iPurpose (opens in a new tab)', box: [66,40,310,66] },
  { slide: 1, destination: 'founder', label: 'Visit Renita Hamilton (opens in a new tab)', box: [66,628,245,34] },
  { slide: 2, destination: 'ipurpose', label: 'Visit iPurpose (opens in a new tab)', box: [57,40,600,68] },
  { slide: 2, destination: 'founder', label: 'WHO BUILT IT — Renita Hamilton, MPS, Founder & CEO (opens in a new tab)', box: [57,445,1166,204] },
] as const;
export default function UniversityPresentation({ institution, token, sessionId, visitNumber, contactId, outreachId, slides, conversationBox }: Props) {
  const currentSlide = useRef(1);
  const state = useRef<{ send: ReturnType<typeof createSDSNEventSender>; sequence: number; number: number; interacted: boolean; page: boolean } | null>(null);
  const emit = useCallback((name: string, params: Record<string, string | number | boolean> = {}) => {
    if (!state.current) state.current = { send: createSDSNEventSender(), sequence: 0, number: visitNumber, interacted: false, page: false };
    const t = state.current;
    // Viewer effects may report a cached image before the parent's mount effect.
    if (!t.page) {
      t.page = true;
      try { const key=`university_visits_v1_${outreachId}`, previous=Number(localStorage.getItem(key)||0); t.number=Math.max(visitNumber,Number.isSafeInteger(previous)&&previous<999999?previous+1:1); localStorage.setItem(key,String(t.number)); } catch { /* Optional storage. */ }
      const base = { institution_id: institution.institution_id, proposal_id: institution.proposal_id, recipient_id: contactId, deck_variant: 'university-presentation', session_id: sessionId, visit_number: t.number, outreach_id: outreachId, traffic_type: 'internal', debug_mode: true };
      t.send('proposal_page_view', { ...base, sequence: ++t.sequence });
      if (t.number>1) t.send('proposal_return_visit', { ...base, sequence: ++t.sequence });
    }
    if (name === 'proposal_page_view') return;
    t.send(name, { institution_id: institution.institution_id, proposal_id: institution.proposal_id, recipient_id: contactId,
      deck_variant: 'university-presentation', session_id: sessionId, visit_number: t.number, sequence: ++t.sequence, outreach_id: outreachId,
      traffic_type: 'internal', debug_mode: true, interaction_qualified: t.interacted, ...params });
  }, [institution, sessionId, visitNumber, contactId, outreachId]);
  useEffect(() => {
    if (!state.current?.page) emit('proposal_page_view');
    const observeInput=(event: Event)=>{if(event.isTrusted&&!document.hidden&&state.current)state.current.interacted=true;};
    const onClick=(event: MouseEvent)=>{
      const anchor=(event.target as Element)?.closest<HTMLAnchorElement>('a[data-proposal-destination]'); if(!anchor)return;
      observeInput(event); const destination=anchor.dataset.proposalDestination!; const eventId=crypto.randomUUID();
      const slide=Number(anchor.dataset.sourceSlide)||currentSlide.current;
      const name=destination==='pdf'?'proposal_pdf_download':destination==='conversation'?'proposal_meeting_request_click':'proposal_external_link_click';
      emit(name,{event_id:eventId,source_slide_number:slide,source_format:'web',...(destination==='pdf'?{}:{destination_id:destination})});
      // Preserve native mailto handling after the existing beacon/GA click delivery.
      if (destination === 'conversation' && anchor.protocol === 'mailto:') return;
      const t=state.current!; const query=new URLSearchParams({event:eventId,seq:String(t.sequence),visit:String(t.number),interactive:t.interacted?'1':'0',slide:String(slide),format:'web'});
      anchor.href=`/p/${token}/${destination==='pdf'?'download':`go/${destination}`}?${query}`;
    };
    for(const name of ['pointerdown','touchstart','keydown'])document.addEventListener(name,observeInput,{passive:true});
    document.addEventListener('click',onClick,{capture:true});
    return()=>{for(const name of ['pointerdown','touchstart','keydown'])document.removeEventListener(name,observeInput);document.removeEventListener('click',onClick,{capture:true});};
  },[emit,token]);
  const onEvent=useCallback((name: ViewerEvent,params: Record<string,string|number>={})=>{
    if(name==='sdsn_slide_view')currentSlide.current=Number(params.slide_number);
    emit(name.replace(/^sdsn_/,'proposal_'),params);
  },[emit]);
  return <PresentationViewer slides={slides} deckTitle={`iPurpose × ${institution.institution_name} — eight-slide exploratory pilot`} onEvent={onEvent} renderSlideLinks={number=><>{placements.filter(p=>p.slide===number).map(p=><a key={p.destination} className={styles.slideLink} href={`/p/${token}/go/${p.destination}?slide=${number}`} data-proposal-destination={p.destination} data-source-slide={number} target="_blank" rel="noopener noreferrer" aria-label={p.label} style={{left:`${p.box[0]/12.8}%`,top:`${p.box[1]/7.2}%`,width:`${p.box[2]/12.8}%`,height:`${p.box[3]/7.2}%`}}/>)}{number===8&&conversationBox&&<a className={styles.slideLink} href={universityConversation(institution.institution_name).href} data-proposal-destination="conversation" data-source-slide={8} aria-label="Request a Conversation" style={{left:`${conversationBox[0]/12.8}%`,top:`${conversationBox[1]/7.2}%`,width:`${conversationBox[2]/12.8}%`,height:`${conversationBox[3]/7.2}%`}}/>}</>}/>;
}

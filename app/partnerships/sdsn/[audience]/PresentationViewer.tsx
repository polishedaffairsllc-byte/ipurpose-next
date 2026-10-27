'use client';
/* eslint-disable @next/next/no-img-element -- Static srcsets preserve the supplied deck artwork. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, Minimize, Pause, Play, LayoutGrid } from 'lucide-react';
import type { PresentationSlide } from '@/lib/partnerships/sdsn';
export type ViewerEvent = 'sdsn_deck_start' | 'sdsn_slide_view' | 'sdsn_deck_interaction' | 'sdsn_deck_complete';
type EventParams = Record<string, string | number>;
const normalSizes = '(max-width: 640px) calc(100vw - 24px), (max-width: 1376px) calc(100vw - 96px), 1280px';
export default function PresentationViewer({ slides, deckTitle, onEvent }: {
  slides: PresentationSlide[]; deckTitle: string; onEvent: (event: ViewerEvent, params?: EventParams) => void;
}) {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(-1);
  const [previous, setPrevious] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const [thumbnails, setThumbnails] = useState(false);
  const [viewed, setViewed] = useState<number[]>([]);
  const [imageError, setImageError] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const visited = useRef(new Set<number>());
  const started = useRef(false);
  const completed = useRef(false);
  const touch = useRef<{x: number; y: number} | null>(null);
  const slide = slides[index];
  const sizes = fullscreen ? '100vw' : normalSizes;
  const interact = useCallback((interaction_type: string) => {
    setPlaying(false);
    onEvent('sdsn_deck_interaction', { interaction_type });
  }, [onEvent]);
  const go = useCallback((destination: number, interaction_type: string) => {
    interact(interaction_type);
    const next = Math.max(0, Math.min(slides.length - 1, destination));
    if (next !== index) {
      setPrevious(loaded === index ? index : null);
      setImageError(false);
      setIndex(next);
    }
  }, [index, loaded, slides.length, interact]);
  const togglePlay = useCallback(() => {
    const next = !playing;
    onEvent('sdsn_deck_interaction', { interaction_type: next ? 'play' : 'pause' });
    setPlaying(next && !reduced && index < slides.length - 1);
  }, [playing, reduced, index, slides.length, onEvent]);
  const toggleFullscreen = useCallback(async () => {
    interact('fullscreen');
    if (overlay) { setOverlay(false); setFullscreen(false); return; }
    if (document.fullscreenElement) { await document.exitFullscreen(); return; }
    try {
      if (!root.current?.requestFullscreen) throw new Error('Fullscreen unavailable');
      await root.current.requestFullscreen();
    } catch { setOverlay(true); setFullscreen(true); }
  }, [overlay, interact]);

  useEffect(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(motion.matches);
    setPlaying(!motion.matches && matchMedia('(min-width: 768px)').matches && !document.hidden);
    const onMotion = () => { setReduced(motion.matches); if (motion.matches) setPlaying(false); };
    const onVisibility = () => { if (document.hidden) setPlaying(false); };
    motion.addEventListener('change', onMotion);
    document.addEventListener('visibilitychange', onVisibility);
    return () => { motion.removeEventListener('change', onMotion); document.removeEventListener('visibilitychange', onVisibility); };
  }, []);
  useEffect(() => {
    const onChange = () => { setFullscreen(!!document.fullscreenElement); setPlaying(false); };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);
  useEffect(() => {
    if (!overlay) return;
    const before = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    root.current?.focus();
    return () => { document.body.style.overflow = before; };
  }, [overlay]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || (e.target instanceof HTMLElement && e.target.closest('input, textarea, select, [contenteditable="true"]'))) return;
      if (e.key === 'Tab') {
        setPlaying(false);
        if (overlay) {
          const buttons = root.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
          const first = buttons?.[0];
          const last = buttons?.[buttons.length - 1];
          if (e.shiftKey && (document.activeElement === first || document.activeElement === root.current)) { e.preventDefault(); last?.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
        }
      }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1, 'prev'); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1, 'next'); }
      else if (e.code === 'Space') {
        // Focused controls keep their normal Space activation semantics.
        if (e.target instanceof HTMLElement && e.target.closest('button, a')) return;
        e.preventDefault(); togglePlay();
      } else if (e.key.toLowerCase() === 'f') { e.preventDefault(); void toggleFullscreen(); }
      else if (e.key === 'Escape') {
        setPlaying(false);
        if (overlay) { setOverlay(false); setFullscreen(false); root.current?.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [index, go, togglePlay, toggleFullscreen, overlay]);
  useEffect(() => {
    // An already-cached image may have completed before hydration attached onLoad.
    if (imageRef.current?.complete && imageRef.current.naturalWidth) setLoaded(index);
  }, [index]);
  useEffect(() => {
    if (loaded !== index) return;
    if (!started.current) { started.current = true; onEvent('sdsn_deck_start'); }
    if (!visited.current.has(index)) {
      visited.current.add(index);
      setViewed([...visited.current]);
      onEvent('sdsn_slide_view', { slide_number: index + 1, slide_total: slides.length });
    }
    const complete = () => {
      if (!completed.current) {
        completed.current = true;
        onEvent('sdsn_deck_complete', { slides_viewed: visited.current.size });
      }
    };
    if (visited.current.size / slides.length >= 0.8) complete();
    if (index === slides.length - 1) {
      setPlaying(false);
      // Count time actually visible; hiding the tab cancels this timer.
      let timer: ReturnType<typeof setTimeout> | undefined;
      const schedule = () => { clearTimeout(timer); if (!document.hidden) timer = setTimeout(complete, 5000); };
      schedule(); document.addEventListener('visibilitychange', schedule);
      return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', schedule); };
    }
  }, [loaded, index, slides.length, onEvent]);
  useEffect(() => {
    if (!playing || reduced || loaded !== index || index >= slides.length - 1) return;
    const timer = setTimeout(() => {
      setPrevious(index); setImageError(false); setIndex(index + 1);
    }, slide.dwellSeconds * 1000);
    return () => clearTimeout(timer);
  }, [playing, reduced, loaded, index, slide.dwellSeconds, slides.length]);
  useEffect(() => {
    const next = slides[index + 1];
    if (!next) return;
    const image = new Image(); image.decoding = 'async'; image.sizes = sizes; image.srcset = next.srcSet; image.src = next.src;
  }, [index, slides, sizes]);
  useEffect(() => {
    if (loaded !== index || previous === null) return;
    const timer = setTimeout(() => setPrevious(null), reduced ? 0 : 420);
    return () => clearTimeout(timer);
  }, [loaded, index, previous, reduced]);

  return <div ref={root} tabIndex={-1} className={`sdsn-viewer${overlay ? ' sdsn-viewer-overlay' : ''}${fullscreen ? ' sdsn-is-fullscreen' : ''}`} role="region" aria-roledescription="carousel" aria-label={deckTitle}>
    <div className="sdsn-stage" onPointerDown={e => { if (e.pointerType === 'mouse') interact('pause'); }} onTouchStart={e => { touch.current = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }; }} onTouchEnd={e => {
      if (!touch.current) return;
      const dx = e.changedTouches[0].clientX - touch.current.x;
      const dy = e.changedTouches[0].clientY - touch.current.y;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1), dx < 0 ? 'next' : 'prev');
      else interact('tap');
      touch.current = null;
    }}>
      {previous !== null ? <img className="sdsn-slide" src={slides[previous].src} srcSet={slides[previous].srcSet} sizes={sizes} alt="" aria-hidden="true" width={2880} height={1620}/> : null}
      <img ref={imageRef} key={slide.src} className={`sdsn-slide sdsn-current${loaded === index ? ' sdsn-ready' : ''}`} src={slide.src} srcSet={slide.srcSet} sizes={sizes} width={2880} height={1620} alt={slide.alt} fetchPriority={index === 0 ? 'high' : 'auto'} loading="eager" decoding="async" onLoad={() => setLoaded(index)} onError={() => { setImageError(true); setPlaying(false); }}/>
      {imageError ? <div className="sdsn-image-error" role="alert">This slide could not load. Please use the PDF below or try another slide.</div> : null}
    </div>
    <div className="sdsn-controls">
      <div className="sdsn-control-top">
        <div className="sdsn-counter" aria-hidden="true"><strong>{String(index + 1).padStart(2, '0')}</strong><span>/ {slides.length}</span></div>
        <div className="sdsn-transport">
          <button type="button" className="sdsn-icon-button" aria-label="Previous slide" disabled={index === 0} onClick={() => go(index - 1, 'prev')}><ChevronLeft aria-hidden="true" size={23}/></button>
          <button type="button" className="sdsn-play" aria-label={playing ? 'Pause presentation' : 'Play presentation'} disabled={reduced || index === slides.length - 1} title={reduced ? 'Automatic playback is disabled for reduced motion' : undefined} onClick={togglePlay}>{playing ? <Pause size={22} fill="currentColor" aria-hidden="true"/> : <Play size={22} fill="currentColor" aria-hidden="true"/>}</button>
          <button type="button" className="sdsn-icon-button" aria-label="Next slide" disabled={index === slides.length - 1} onClick={() => go(index + 1, 'next')}><ChevronRight aria-hidden="true" size={23}/></button>
        </div>
        <div className="sdsn-view-options">
          <button type="button" className="sdsn-icon-button sdsn-thumbnails-toggle" aria-label={thumbnails ? 'Hide slide thumbnails' : 'Show slide thumbnails'} aria-expanded={thumbnails} aria-controls="sdsn-thumbnails" onClick={() => { interact('thumbnail'); setThumbnails(!thumbnails); }}><LayoutGrid size={20} aria-hidden="true"/></button>
          <button type="button" className="sdsn-icon-button" aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} onClick={() => void toggleFullscreen()}>{fullscreen ? <Minimize size={21} aria-hidden="true"/> : <Expand size={21} aria-hidden="true"/>}</button>
        </div>
      </div>
      <div className="sdsn-segments" role="group" aria-label="Choose a slide">{slides.map((item, i) => <button key={item.src} type="button" className={`sdsn-segment${viewed.includes(i) ? ' sdsn-viewed' : ''}${i === index ? ' sdsn-active' : ''}`} aria-label={`Go to slide ${i + 1}: ${item.title}`} aria-current={i === index ? 'step' : undefined} onClick={() => go(i, 'progress-jump')}><span/></button>)}</div>
    </div>
    {thumbnails ? <div id="sdsn-thumbnails" className="sdsn-thumbnails">{slides.map((item, i) => <button key={item.src} type="button" aria-label={`View slide ${i + 1}: ${item.title}`} aria-current={i === index ? 'step' : undefined} onClick={() => go(i, 'thumbnail')}><img src={item.srcSet.split(' ')[0]} alt="" width={160} height={90} loading="lazy"/><span>{i + 1}</span></button>)}</div> : null}
    <div className="sdsn-viewer-note"><span>{playing ? 'Playing at a reading pace' : 'Explore at your own pace'}</span><span className="sdsn-desktop-hint">← → Navigate <span aria-hidden="true">·</span> Space Play / pause <span aria-hidden="true">·</span> F Fullscreen</span><span className="sdsn-mobile-hint">Tap fullscreen for the best view</span></div>
    <p className="sdsn-sr-only" aria-live={playing ? 'off' : 'polite'} aria-atomic="true">Slide {index + 1} of {slides.length}: {slide.title}</p>
  </div>;
}

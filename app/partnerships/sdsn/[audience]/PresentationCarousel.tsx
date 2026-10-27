'use client';

import { useEffect, useState } from 'react';

export default function PresentationCarousel({ slides, audience }: { slides: string[]; audience: string }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing || slides.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [playing, slides.length]);

  const previous = () => {
    setPlaying(false);
    setIndex((current) => (current - 1 + slides.length) % slides.length);
  };

  const next = () => {
    setPlaying(false);
    setIndex((current) => (current + 1) % slides.length);
  };

  if (!slides.length) return null;

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div
        className="relative overflow-hidden rounded-2xl bg-[#171928] shadow-[0_25px_80px_rgba(20,22,40,0.28)] ring-1 ring-white/10"
        style={{ aspectRatio: '16 / 9' }}
      >
        {slides.map((src, slideIndex) => (
          <img
            key={src}
            src={src}
            alt={`iPurpose partnership presentation slide ${slideIndex + 1}`}
            className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-700 ${slideIndex === index ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            loading={slideIndex < 2 ? 'eager' : 'lazy'}
          />
        ))}

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-4 pb-4 pt-14 sm:px-6">
          <button
            type="button"
            onClick={previous}
            data-pitch-action="presentation_previous"
            className="rounded-full border border-white/35 bg-black/35 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-black/55"
            aria-label="Previous slide"
          >
            ← Previous
          </button>

          <div className="flex items-center gap-3 text-sm font-semibold text-white">
            <span>{index + 1} / {slides.length}</span>
            <button
              type="button"
              onClick={() => setPlaying((value) => !value)}
              data-pitch-action={playing ? 'presentation_pause' : 'presentation_play'}
              className="rounded-full border border-white/35 bg-black/35 px-4 py-2 backdrop-blur hover:bg-black/55"
            >
              {playing ? 'Pause' : 'Play'}
            </button>
          </div>

          <button
            type="button"
            onClick={next}
            data-pitch-action="presentation_next"
            className="rounded-full border border-white/35 bg-black/35 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-black/55"
            aria-label="Next slide"
          >
            Next →
          </button>
        </div>
      </div>

      <div className="mt-5 flex justify-center gap-1.5" aria-label="Presentation progress">
        {slides.map((_, dotIndex) => (
          <button
            key={dotIndex}
            type="button"
            onClick={() => {
              setPlaying(false);
              setIndex(dotIndex);
            }}
            data-pitch-action={`presentation_slide_${dotIndex + 1}`}
            className="h-2.5 rounded-full transition-all"
            style={{
              width: dotIndex === index ? 30 : 10,
              background: dotIndex === index ? '#9C88FF' : '#D7D9E5',
            }}
            aria-label={`Go to slide ${dotIndex + 1}`}
          />
        ))}
      </div>
      <p className="mt-3 text-center text-sm text-[#6f7489]">
        The presentation advances automatically. Use the controls to pause or move through it at your own pace.
      </p>
    </div>
  );
}

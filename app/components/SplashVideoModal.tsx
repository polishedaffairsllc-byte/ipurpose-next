'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

export default function SplashVideoModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const seen = sessionStorage.getItem('splashSeen');
    if (!seen) {
      setIsOpen(true);
    }
  }, []);

  // Try to play with sound first; fall back to muted if browser blocks it
  useEffect(() => {
    if (!isOpen) return;
    const video = videoRef.current;
    if (!video) return;

    // Attempt 1: play with audio
    video.muted = false;
    video.play().then(() => {
      setIsMuted(false);
    }).catch(() => {
      // Browser blocked audio autoplay — fall back to muted
      video.muted = true;
      setIsMuted(true);
      video.play().catch(() => {});
    });
  }, [isOpen]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
    // If they just unmuted, restart so they don't miss the beginning
    if (!video.muted) {
      video.currentTime = 0;
    }
  }, []);

  const dismiss = useCallback(() => {
    setFadeOut(true);
    sessionStorage.setItem('splashSeen', 'true');
    const video = videoRef.current;
    if (video) {
      video.pause();
    }
    setTimeout(() => setIsOpen(false), 700);
  }, []);

  if (!isOpen) return null;

  const modal = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.7s ease',
        pointerEvents: fadeOut ? 'none' as const : 'auto' as const,
      }}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src="/videos/www.ipurposesoul.com.mp4"
        playsInline
        onEnded={dismiss}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          backgroundColor: '#000',
        }}
      />

      {/* Bottom controls row */}
      <div
        style={{
          position: 'absolute',
          bottom: 32,
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          zIndex: 10,
        }}
      >
        {/* Mute/Unmute button */}
        <button
          onClick={toggleMute}
          style={{
            padding: '12px 20px',
            borderRadius: 9999,
            fontSize: 14,
            letterSpacing: '0.05em',
            color: 'rgba(255,255,255,0.85)',
            backgroundColor: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.3)',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s',
          }}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? '🔇 Tap for Sound' : '🔊 Sound On'}
        </button>

        {/* Skip button */}
        <button
          onClick={dismiss}
          style={{
            padding: '12px 24px',
            borderRadius: 9999,
            fontSize: 14,
            letterSpacing: '0.05em',
            color: 'rgba(255,255,255,0.85)',
            backgroundColor: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.3)',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s',
          }}
        >
          Skip →
        </button>
      </div>

      {/* Progress bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          backgroundColor: 'rgba(255,255,255,0.1)',
        }}
      >
        <div
          ref={(el) => {
            if (el && videoRef.current) {
              const setDuration = () => {
                const dur = videoRef.current?.duration;
                if (dur && isFinite(dur)) {
                  el.style.animationDuration = `${dur}s`;
                }
              };
              videoRef.current.addEventListener('loadedmetadata', setDuration);
              setDuration();
            }
          }}
          style={{
            height: '100%',
            backgroundColor: 'rgba(156,136,255,0.6)',
            animation: 'splashProgress linear forwards',
            width: '0%',
          }}
        />
      </div>

      <style>{`
        @keyframes splashProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );

  // Use portal to render directly into document.body — on top of everything
  if (typeof document !== 'undefined') {
    return createPortal(modal, document.body);
  }

  return null;
}

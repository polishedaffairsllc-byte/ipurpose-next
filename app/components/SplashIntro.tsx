'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export default function SplashIntro({ children }: { children: React.ReactNode }) {
  // Default to true so the splash renders immediately on first paint
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Once hydrated, check if the user has already seen the splash this session
  useEffect(() => {
    const seen = sessionStorage.getItem('splashSeen');
    if (seen) {
      setShowSplash(false);
    }
  }, []);

  // Try to unmute automatically once the video starts playing
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const tryUnmute = () => {
      video.muted = false;
      video.play().then(() => {
        setIsMuted(false);
      }).catch(() => {
        // Browser blocked unmuted autoplay — stay muted
        video.muted = true;
        video.play();
      });
    };
    video.addEventListener('playing', tryUnmute, { once: true });
    return () => video.removeEventListener('playing', tryUnmute);
  }, [showSplash]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const dismiss = useCallback(() => {
    setFadeOut(true);
    sessionStorage.setItem('splashSeen', 'true');
    // Wait for fade-out animation to finish, then unmount
    setTimeout(() => setShowSplash(false), 800);
  }, []);

  // If already seen this session, just show the homepage
  if (!showSplash) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Splash overlay */}
      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-700 ${
          fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {/* Video */}
        <video
          ref={videoRef}
          src="/videos/intro-vid-2026.mp4"
          autoPlay
          muted
          playsInline
          onEnded={dismiss}
          className="absolute inset-0 w-full h-full object-contain bg-black"
        />

        {/* Bottom controls row */}
        <div className="absolute bottom-8 left-0 right-0 z-10 flex items-center justify-between px-8">
          {/* Mute/Unmute button */}
          <button
            onClick={toggleMute}
            className="px-5 py-3 rounded-full font-marcellus text-sm tracking-wide backdrop-blur-md border border-white/30 transition-all hover:bg-white/20 hover:scale-105 active:scale-100"
            style={{ color: 'rgba(255,255,255,0.8)', backgroundColor: 'rgba(0,0,0,0.4)' }}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? '🔇 Tap for Sound' : '🔊 Sound On'}
          </button>

          {/* Skip button */}
          <button
            onClick={dismiss}
            className="px-6 py-3 rounded-full font-marcellus text-sm tracking-wide backdrop-blur-md border border-white/30 transition-all hover:bg-white/20 hover:scale-105 active:scale-100"
            style={{ color: 'rgba(255,255,255,0.8)', backgroundColor: 'rgba(0,0,0,0.4)' }}
          >
            Skip →
          </button>
        </div>

        {/* Subtle progress bar at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div
            className="h-full bg-white/40"
            style={{ animation: 'splashProgress linear forwards' }}
            ref={(el) => {
              // Sync progress bar duration with video duration once loaded
              if (el && videoRef.current) {
                const setDuration = () => {
                  const dur = videoRef.current?.duration;
                  if (dur && isFinite(dur)) {
                    el.style.animationDuration = `${dur}s`;
                  }
                };
                videoRef.current.addEventListener('loadedmetadata', setDuration);
                setDuration(); // in case already loaded
              }
            }}
          />
        </div>
      </div>

      {/* Homepage content loads behind the splash so it's ready when video ends */}
      {children}

      <style>{`
        @keyframes splashProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </>
  );
}

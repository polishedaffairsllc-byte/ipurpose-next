'use client';

import { useEffect, useRef, useState } from 'react';

interface BackgroundVideoProps {
  src?: string;
  fallbackColor?: string;
  children?: React.ReactNode;
}

export function BackgroundVideo({
  src = '/videos/hero-background.mp4',
  fallbackColor = 'from-lavenderViolet to-indigoDeep',
  children,
}: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setVideoLoaded(true);
      setVideoError(null);
    };

    const handleError = (error: Event) => {
      console.error('Video failed to load:', error);
      setVideoError('Video failed to load');
      setVideoLoaded(false);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    video.play().catch((err) => {
      console.warn('Autoplay prevented:', err);
    });

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Video Background */}
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          videoLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Gradient Fallback */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${fallbackColor} ${
          videoLoaded ? 'opacity-0' : 'opacity-100'
        } transition-opacity duration-500`}
        aria-hidden="true"
      />

      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex items-center">
        {children}
      </div>

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 z-20 bg-black/80 text-white text-xs p-3 rounded font-mono max-w-xs">
          <div>Video Debug</div>
          <div>Status: {videoLoaded ? 'playing' : videoError ? 'error' : 'loading'}</div>
          <div>Src: {src}</div>
          <div>Error: {videoError || 'none'}</div>
        </div>
      )}
    </div>
  );
}

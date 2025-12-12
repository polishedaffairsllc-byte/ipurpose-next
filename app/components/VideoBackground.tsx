'use client';

import { useEffect, useRef } from 'react';

interface VideoBackgroundProps {
  videoUrl?: string;
  opacity?: number;
  blur?: number;
}

export default function VideoBackground({ 
  videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-heights-in-a-sunset-26070-large.mp4',
  opacity = 0.15,
  blur = 8
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.75; // Slower, more serene
    }
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-3] overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity,
          filter: `blur(${blur}px)`,
          transform: 'scale(1.1)', // Prevent blur edge artifacts
        }}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>
      {/* Gradient overlay to blend with theme */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(250, 245, 255, 0.7) 0%, rgba(255, 249, 245, 0.6) 50%, rgba(255, 251, 240, 0.7) 100%)'
        }}
      />
    </div>
  );
}

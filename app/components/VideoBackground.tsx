"use client";

import React, { useEffect, useRef, useState } from "react";

interface Props {
  src: string;
  poster?: string;
  className?: string;
}

export default function VideoBackground({ src, poster, className = "" }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const vidRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | null = null;
    // If video doesn't fire canplay within 5s, show fallback
    t = setTimeout(() => {
      if (!loaded) setError(true);
    }, 5000);
    return () => t && clearTimeout(t);
  }, [loaded]);

  return (
    <div className={`absolute inset-0 w-full h-full z-0 ${className}`}>
      {!error ? (
        <video
          ref={vidRef}
          autoPlay
          loop
          muted
          playsInline
          onCanPlay={() => setLoaded(true)}
          onError={() => setError(true)}
          className="absolute inset-0 w-full h-full object-cover"
          poster={poster}
        >
          <source src={src} type="video/mp4" />
          {/* fallback text for very old browsers */}
          Your browser does not support the video tag.
        </video>
      ) : (
        // fallback: show poster image if video failed or timed out
        <img
          src={poster || "/images/ipurpose-logo.png"}
          alt="background fallback"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* small dev status badge to help debugging */}
      <div className="pointer-events-none fixed top-4 right-4 z-50 bg-black/50 text-white text-xs px-2 py-1 rounded">{error ? "video: failed" : loaded ? "video: playing" : "video: loading"}</div>
    </div>
  );
}
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

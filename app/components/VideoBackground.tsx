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
  }

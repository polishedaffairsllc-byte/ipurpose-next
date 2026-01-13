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
  const [okToPlay, setOkToPlay] = useState<boolean | null>(null);
  const vidRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // Probe the src to ensure it returns a video content-type and a 2xx status.
    // This avoids embedding a <video> tag that points to an auth page or HTML response.
    let cancelled = false;
    async function probe() {
      try {
        const url = new URL(src, window.location.href).href;
        // Try HEAD first; some hosts may not support HEAD so fallback to a small range GET.
        let resp = await fetch(url, { method: "HEAD", cache: "no-cache" });
        if (!resp.ok) {
          // fallback: try a small range GET
          resp = await fetch(url, { method: "GET", headers: { Range: "bytes=0-0" }, cache: "no-cache" });
        }
        const contentType = resp.headers.get("content-type") || "";
        const ok = resp.ok && (contentType.startsWith("video/") || contentType === "");
        if (!cancelled) setOkToPlay(ok);
        if (!ok) setError(true);
      } catch (e) {
        if (!cancelled) setOkToPlay(true);
      }
    }
    probe();

    let t: ReturnType<typeof setTimeout> | null = null;
    // If video doesn't fire canplay within 20s, show fallback (increased timeout for large files)
    t = setTimeout(() => {
      if (!loaded) setError(true);
    }, 20000);
    return () => {
      cancelled = true;
      if (t) clearTimeout(t);
    };
  }, [loaded, src]);

  return (
    <div className={`absolute inset-0 w-full h-full z-0 ${className}`}>
      {(!error && okToPlay !== false) ? (
        okToPlay ? (
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
          src={poster || "/images/ipurpose-logo-transparent.png"}
          alt="background fallback"
          className="absolute inset-0 w-full h-full object-cover"
        />
        )
      ) : (
        // While probing, show poster so layout is stable
        <img
          src={poster || "/images/ipurpose-logo-transparent.png"}
          alt="background fallback"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

    </div>
  );
}


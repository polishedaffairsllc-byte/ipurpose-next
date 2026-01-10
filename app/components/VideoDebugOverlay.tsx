"use client";

import React, { useEffect, useState } from "react";

function readyStateLabel(n: number) {
  switch (n) {
    case 0:
      return "HAVE_NOTHING";
    case 1:
      return "HAVE_METADATA";
    case 2:
      return "HAVE_CURRENT_DATA";
    case 3:
      return "HAVE_FUTURE_DATA";
    case 4:
      return "HAVE_ENOUGH_DATA";
    default:
      return String(n);
  }
}

export default function VideoDebugOverlay() {
  const [status, setStatus] = useState<string>("no-video");
  const [src, setSrc] = useState<string | null>(null);
  const [paused, setPaused] = useState<boolean | null>(null);
  const [readyState, setReadyState] = useState<number | null>(null);
  const [networkState, setNetworkState] = useState<number | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    let vid: HTMLVideoElement | null = document.querySelector("video");
    if (!vid) {
      setStatus("no-video");
      return;
    }

    setSrc(vid.currentSrc || vid.src || null);
    setPaused(vid.paused);
    setReadyState(vid.readyState);
    setNetworkState(vid.networkState);

    const onEvent = (e: Event) => {
      setPaused(vid?.paused ?? null);
      setReadyState(vid?.readyState ?? null);
      setNetworkState(vid?.networkState ?? null);
      setSrc(vid?.currentSrc || vid?.src || null);
      console.log("[VideoDebug] event:", e.type, { src: vid?.currentSrc, readyState: vid?.readyState, paused: vid?.paused });
      if (e.type === "error") {
        const err = (vid as any)?.error;
        setLastError(err ? `${err.code} ${err.message || ""}` : "unknown");
        setStatus("error");
      }
      if (e.type === "canplay" || e.type === "loadedmetadata") setStatus("canplay");
      if (e.type === "playing" || e.type === "play") setStatus("playing");
      if (e.type === "waiting") setStatus("waiting");
    };

    const events = [
      "loadedmetadata",
      "canplay",
      "play",
      "playing",
      "pause",
      "waiting",
      "stalled",
      "error",
      "abort",
    ];

    events.forEach((ev) => vid!.addEventListener(ev, onEvent));

    if (vid.readyState >= 3) setStatus("canplay");
    else setStatus("loading");

    return () => {
      events.forEach((ev) => vid && vid.removeEventListener(ev, onEvent));
      vid = null;
    };
  }, []);

  return (
    <div className="fixed left-4 bottom-4 z-50 bg-black/60 text-white text-xs rounded-md p-3 max-w-xs">
      <div className="font-semibold mb-1">Video Debug</div>
      <div className="mb-1">Status: <span className="font-mono">{status}</span></div>
      <div className="mb-1">Src: <span className="break-words">{src ?? "—"}</span></div>
      <div className="mb-1">Paused: <span className="font-mono">{paused === null ? "—" : String(paused)}</span></div>
      <div className="mb-1">Ready: <span className="font-mono">{readyState === null ? "—" : readyStateLabel(readyState)}</span></div>
      <div className="mb-1">Network: <span className="font-mono">{networkState === null ? "—" : String(networkState)}</span></div>
      <div className="text-rose-200">Error: {lastError ?? "none"}</div>
    </div>
  );
}

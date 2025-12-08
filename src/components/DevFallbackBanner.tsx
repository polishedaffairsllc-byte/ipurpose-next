"use client";

import { useEffect, useState } from "react";

export default function DevFallbackBanner() {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/_dev/fallback')
      .then((r) => r.json())
      .then((body) => {
        if (mounted) setEnabled(Boolean(body?.devFallback));
      })
      .catch(() => {
        if (mounted) setEnabled(false);
      });
    return () => { mounted = false; };
  }, []);

  if (!enabled) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: '#f59e0b', color: '#081c15', padding: '8px 12px', zIndex: 9999, textAlign: 'center', fontWeight: 600 }}>
      DEV_FALLBACK is enabled — Insecure development-only Firebase Admin fallback is active. Do NOT enable in CI/production.
    </div>
  );
}

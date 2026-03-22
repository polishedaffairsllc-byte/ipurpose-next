'use client';

/**
 * lib/hooks/useUTMParams.ts
 *
 * Captures UTM parameters from the URL on the user's first visit and
 * persists them in sessionStorage so they survive page navigation within
 * the same session.  Returns the stored UTMs for use in form submissions.
 *
 * Usage:
 *   const utmParams = useUTMParams();
 *   // Then include `...utmParams` in any fetch POST body.
 */

import { useEffect, useState } from 'react';

export interface UTMParams {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
}

const SESSION_KEY = 'ipurpose_utm';

export function useUTMParams(): UTMParams {
  const [params, setParams] = useState<UTMParams>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Try to read UTMs already captured this session
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        setParams(JSON.parse(stored));
        return;
      } catch {
        // Corrupted storage — fall through and re-capture
      }
    }

    // Read UTMs from the current URL
    const sp = new URLSearchParams(window.location.search);
    const captured: UTMParams = {
      utm_source: sp.get('utm_source') || null,
      utm_medium: sp.get('utm_medium') || null,
      utm_campaign: sp.get('utm_campaign') || null,
      utm_content: sp.get('utm_content') || null,
      utm_term: sp.get('utm_term') || null,
    };

    // Only persist if at least one UTM is present
    const hasUTM = Object.values(captured).some((v) => v !== null);
    if (hasUTM) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(captured));
      setParams(captured);
    }
  }, []);

  return params;
}

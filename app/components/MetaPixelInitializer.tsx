'use client';

import { useEffect } from 'react';

/**
 * MetaPixelInitializer
 * Initializes Meta Pixel globally on every page
 * Client-side only (useEffect ensures browser execution)
 * No auth required
 */
export default function MetaPixelInitializer() {
  useEffect(() => {
    // Get pixel ID from environment
    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

    if (!pixelId) {
      console.warn('[Meta Pixel] NEXT_PUBLIC_META_PIXEL_ID not configured');
      return;
    }

    // Initialize fbq if not already done
    if (typeof window !== 'undefined' && !window.fbq) {
      // Create fbq function before script loads
      window.fbq = function (...args) {
        // @ts-ignore
        window.fbq.callMethod
          ? // @ts-ignore
            window.fbq.callMethod(...args)
          : // @ts-ignore
            window.fbq.queue.push(args);
      };

      // @ts-ignore
      window.fbq.push = window.fbq;
      // @ts-ignore
      window.fbq.loaded = true;
      // @ts-ignore
      window.fbq.version = '2.0';
      // @ts-ignore
      window.fbq.queue = [];

      // Create and inject script
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(script);

      // Initialize pixel
      window.fbq('init', pixelId);

      // Track initial PageView
      window.fbq('track', 'PageView');

      console.log('[Meta Pixel] Initialized with ID:', pixelId);
    }
  }, []);

  // Non-rendering component
  return null;
}

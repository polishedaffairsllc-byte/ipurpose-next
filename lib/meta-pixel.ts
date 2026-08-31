/**
 * Meta Pixel (Facebook Pixel) Utility
 * Handles tracking of user actions for Meta conversion measurement
 * 
 * To use: Set NEXT_PUBLIC_META_PIXEL_ID in .env.local or Vercel environment variables
 */

// Declare fbq function on window
declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: (...args: any[]) => void;
  }
}

/**
 * Initialize Meta Pixel (must be called once on app load)
 */
export const initMetaPixel = () => {
  // Get pixel ID from environment (read at runtime, not build time)
  const PIXEL_ID = typeof window !== 'undefined' 
    ? process.env.NEXT_PUBLIC_META_PIXEL_ID 
    : null;

  if (!PIXEL_ID) {
    console.warn('[Meta Pixel] NEXT_PUBLIC_META_PIXEL_ID not configured. Pixel not initialized.');
    return;
  }

  if (typeof window === 'undefined') return;

  // Check if pixel already initialized
  if (window.fbq) {
    console.debug('[Meta Pixel] Already initialized');
    return;
  }

  // Initialize fbq function
  window.fbq = function (...args) {
    // @ts-ignore
    window.fbq.callMethod
      ? // @ts-ignore
        window.fbq.callMethod(...args)
      : // @ts-ignore
        window.fbq.queue.push(args);
  };

  // Set initial queue
  // @ts-ignore
  if (!window._fbq) window._fbq = window.fbq;
  // @ts-ignore
  window.fbq.push = window.fbq;
  // @ts-ignore
  window.fbq.loaded = !0;
  // @ts-ignore
  window.fbq.version = '2.0';
  // @ts-ignore
  window.fbq.queue = [];

  // Inject pixel script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://connect.facebook.net/en_US/fbevents.js`;
  document.head.appendChild(script);

  // Initialize pixel
  window.fbq('init', PIXEL_ID);
  window.fbq('track', 'PageView');

  console.log('[Meta Pixel] Initialized with ID:', PIXEL_ID);
};

/**
 * Track ViewContent event (product/offer viewing)
 */
export const trackViewContent = (
  content_name: string,
  content_type: string = 'product',
  value?: number,
  currency?: string
) => {
  const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  
  if (!PIXEL_ID || typeof window === 'undefined' || !window.fbq) {
    console.debug('[Meta Pixel] ViewContent not tracked (pixel not initialized)');
    return;
  }

  const eventData: any = {
    content_name,
    content_type,
  };

  if (value !== undefined) {
    eventData.value = value;
  }
  if (currency) {
    eventData.currency = currency;
  }

  window.fbq('track', 'ViewContent', eventData);
  console.debug('[Meta Pixel] ViewContent tracked:', eventData);
};

/**
 * Track InitiateCheckout event (checkout started)
 */
export const trackInitiateCheckout = (
  content_name: string,
  value: number,
  currency: string = 'USD'
) => {
  const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  
  if (!PIXEL_ID || typeof window === 'undefined' || !window.fbq) {
    console.debug('[Meta Pixel] InitiateCheckout not tracked (pixel not initialized)');
    return;
  }

  const eventData = {
    content_name,
    value,
    currency,
  };

  window.fbq('track', 'InitiateCheckout', eventData);
  console.debug('[Meta Pixel] InitiateCheckout tracked:', eventData);
};

/**
 * Track Purchase event (successful payment)
 */
export const trackPurchase = (
  content_name: string,
  value: number,
  currency: string = 'USD'
) => {
  const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  
  if (!PIXEL_ID || typeof window === 'undefined' || !window.fbq) {
    console.debug('[Meta Pixel] Purchase not tracked (pixel not initialized)');
    return;
  }

  const eventData = {
    content_name,
    value,
    currency,
  };

  window.fbq('track', 'Purchase', eventData);
  console.debug('[Meta Pixel] Purchase tracked:', eventData);
};

/**
 * Track AddToCart event (product added to cart/interest shown)
 */
export const trackAddToCart = (
  content_name: string,
  value: number,
  currency: string = 'USD'
) => {
  const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  
  if (!PIXEL_ID || typeof window === 'undefined' || !window.fbq) {
    console.debug('[Meta Pixel] AddToCart not tracked (pixel not initialized)');
    return;
  }

  const eventData = {
    content_name,
    value,
    currency,
  };

  window.fbq('track', 'AddToCart', eventData);
  console.debug('[Meta Pixel] AddToCart tracked:', eventData);
};

/**
 * Track custom event
 */
export const trackMetaEvent = (eventName: string, eventData?: Record<string, any>) => {
  const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  
  if (!PIXEL_ID || typeof window === 'undefined' || !window.fbq) {
    console.debug(`[Meta Pixel] ${eventName} not tracked (pixel not initialized)`);
    return;
  }

  window.fbq('track', eventName, eventData || {});
  console.debug(`[Meta Pixel] ${eventName} tracked:`, eventData);
};

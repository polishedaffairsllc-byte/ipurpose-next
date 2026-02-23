/**
 * Google Analytics 4 Measurement Protocol
 * 
 * Allows server-side tracking of GA4 events
 * Useful for purchase and other backend-triggered events
 */

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const GA_API_SECRET = process.env.GA_API_SECRET;

interface GA4Event {
  name: string;
  params?: Record<string, any>;
}

interface GA4PageViewEvent extends GA4Event {
  name: 'page_view';
  params?: {
    page_path?: string;
    page_title?: string;
    page_location?: string;
  };
}

interface GA4PurchaseEvent extends GA4Event {
  name: 'purchase';
  params?: {
    transaction_id: string;
    value: number;
    currency: string;
    items?: Array<{
      item_id: string;
      item_name: string;
      item_category?: string;
      price?: number;
      quantity?: number;
    }>;
    coupon?: string;
  };
}

interface GA4SignUpEvent extends GA4Event {
  name: 'sign_up';
  params?: {
    method?: string;
  };
}

/**
 * Send a GA4 event via Measurement Protocol
 * @param event - The GA4 event to send
 * @param userId - (Optional) Firebase User ID for user-level tracking
 * @param clientId - (Optional) Client ID for session tracking
 * @returns Promise<boolean> - Whether the event was sent successfully
 */
export async function sendGA4Event(
  event: GA4Event,
  userId?: string,
  clientId?: string
): Promise<boolean> {
  if (!GA_MEASUREMENT_ID || !GA_API_SECRET) {
    console.warn('[GA4] Measurement Protocol not configured. Missing NEXT_PUBLIC_GA_MEASUREMENT_ID or GA_API_SECRET');
    return false;
  }

  try {
    const url = `https://www.google-analytics.com/mp/collect?api_secret=${GA_API_SECRET}&measurement_id=${GA_MEASUREMENT_ID}`;

    const payload = {
      client_id: clientId || 'server-event-' + Date.now(), // Fallback client ID
      user_id: userId || undefined, // Optional user ID
      events: [event],
      timestamp_micros: String(Date.now() * 1000), // GA4 uses microseconds
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`[GA4] Measurement Protocol error: ${response.status} ${response.statusText}`);
      return false;
    }

    console.log(`[GA4] Event sent: ${event.name}`);
    return true;
  } catch (error) {
    console.error('[GA4] Failed to send event:', error);
    return false;
  }
}

/**
 * Server-side: Track purchase completion
 */
export async function trackServerPurchase(
  transactionId: string,
  value: number,
  productName: string,
  productId: string,
  currency: string = 'USD',
  userId?: string,
  clientId?: string
): Promise<boolean> {
  const event: GA4PurchaseEvent = {
    name: 'purchase',
    params: {
      transaction_id: transactionId,
      value,
      currency,
      items: [
        {
          item_id: productId,
          item_name: productName,
          price: value,
          quantity: 1,
        },
      ],
    },
  };

  return sendGA4Event(event, userId, clientId);
}

/**
 * Server-side: Track sign up
 */
export async function trackServerSignUp(
  method?: string,
  userId?: string,
  clientId?: string
): Promise<boolean> {
  const event: GA4SignUpEvent = {
    name: 'sign_up',
    params: {
      method: method || 'firebase',
    },
  };

  return sendGA4Event(event, userId, clientId);
}

/**
 * Server-side: Track page view
 */
export async function trackServerPageView(
  pagePath: string,
  pageTitle?: string,
  pageLocation?: string,
  clientId?: string
): Promise<boolean> {
  const event: GA4PageViewEvent = {
    name: 'page_view',
    params: {
      page_path: pagePath,
      page_title: pageTitle,
      page_location: pageLocation,
    },
  };

  return sendGA4Event(event, undefined, clientId);
}

/**
 * Server-side: Track generate_lead for form submissions (Clarity Check, etc.)
 */
export async function trackServerGenerateLead(
  leadType: string,
  email?: string,
  value?: number,
  clientId?: string
): Promise<boolean> {
  const event: GA4Event = {
    name: 'generate_lead',
    params: {
      lead_type: leadType,
      value: value || 0,
      currency: 'USD',
    },
  };

  return sendGA4Event(event, undefined, clientId);
}

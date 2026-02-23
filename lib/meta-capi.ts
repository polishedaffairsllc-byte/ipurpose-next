/**
 * Meta Conversions API (CAPI) Integration
 * Server-side event tracking for Stripe purchases
 * Documentation: https://developers.facebook.com/docs/marketing-api/conversions-api
 */

interface MetaCAPIEvent {
  event_name: string;
  event_time: number;
  action_source: 'website';
  user_data: {
    em?: string; // SHA-256 hashed email
    ph?: string; // SHA-256 hashed phone
  };
  custom_data?: {
    value: number;
    currency: string;
    content_name?: string;
    content_type?: string;
    content_id?: string;
    content_ids?: string[];
  };
  event_id?: string;
}

/**
 * Hash a value using SHA-256 for Meta CAPI user data
 */
function hashValue(value: string): string {
  if (!value) return '';
  const crypto = require('crypto');
  const normalized = String(value).trim().toLowerCase();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Send purchase event to Meta Conversions API
 * Called from Stripe webhook after successful payment
 */
export async function sendMetaPurchaseEvent(
  email: string | undefined,
  value: number,
  currency: string = 'USD',
  contentId: string = '',
  contentName: string = ''
): Promise<void> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    console.warn('[Meta CAPI] Pixel ID or access token not configured', {
      hasPixelId: !!pixelId,
      hasAccessToken: !!accessToken,
    });
    return;
  }

  try {
    // Prepare user data
    const userData: any = {};
    if (email) {
      userData.em = hashValue(email);
    }

    // Prepare event payload
    const event: MetaCAPIEvent = {
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      user_data: userData,
      custom_data: {
        value,
        currency,
      },
    };

    // Add content details if available
    if (contentId) {
      event.custom_data!.content_id = contentId;
      event.custom_data!.content_ids = [contentId];
    }
    if (contentName) {
      event.custom_data!.content_name = contentName;
      event.custom_data!.content_type = 'product';
    }

    // Generate unique event ID for deduplication
    const eventId = `stripe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    event.event_id = eventId;

    // Send to Meta Conversions API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pixelId}/events`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: [event],
          access_token: accessToken,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Meta CAPI] Failed to send purchase event', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        eventId,
      });
      return;
    }

    const result = await response.json();
    console.log('[Meta CAPI] Purchase event sent successfully', {
      pixelId,
      value,
      currency,
      contentId,
      eventId,
      result,
    });
  } catch (err) {
    console.error('[Meta CAPI] Error sending purchase event:', err);
    // Don't throw - Meta CAPI failure shouldn't break order processing
  }
}

/**
 * Send ViewContent event to Meta Conversions API
 * Can be used for product page tracking server-side if needed
 */
export async function sendMetaViewContentEvent(
  email: string | undefined,
  contentId: string,
  contentName: string,
  value: number,
  currency: string = 'USD'
): Promise<void> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;

  if (!pixelId || !accessToken) return;

  try {
    const userData: any = {};
    if (email) {
      userData.em = hashValue(email);
    }

    const event: MetaCAPIEvent = {
      event_name: 'ViewContent',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      user_data: userData,
      custom_data: {
        content_id: contentId,
        content_ids: [contentId],
        content_name: contentName,
        content_type: 'product',
        value,
        currency,
      },
    };

    const eventId = `view_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    event.event_id = eventId;

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pixelId}/events`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: [event],
          access_token: accessToken,
        }),
      }
    );

    if (response.ok) {
      console.log('[Meta CAPI] ViewContent event sent', {
        contentId,
        contentName,
        eventId,
      });
    }
  } catch (err) {
    console.error('[Meta CAPI] Error sending ViewContent event:', err);
  }
}

/**
 * Call Asset Conversion Tracking Module
 * 
 * Tracks call-related events for Google Ads Call Assets.
 * Implements event-based conversion tracking replacing deprecated Call-Only ads.
 * 
 * Migration Timeline: Complete by February 2027
 * Conversion ID: AW-17993147612
 */

/**
 * Track when user clicks on a click-to-call button or call asset
 * @param phoneNumber - Optional phone number being called
 * @param source - Where the click originated (e.g., 'header', 'hero', 'footer')
 */
export const trackClickToCall = (phoneNumber?: string, source: string = 'direct'): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'click_to_call', {
      'event_category': 'call_asset',
      'event_label': source,
      'phone_number': phoneNumber,
      'conversion_id': 'AW-17993147612'
    });
  }
};

/**
 * Track when a call is initiated from a Call Asset
 * Used to measure engagement with call assets in Search/Display campaigns
 * @param source - Campaign/ad source (e.g., 'search', 'display', 'pmax')
 */
export const trackCallAssetEngagement = (source: string = 'unknown'): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'call_asset_engagement', {
      'event_category': 'call_asset',
      'event_label': source,
      'conversion_id': 'AW-17993147612'
    });
  }
};

/**
 * Track successful call connection
 * Should be called when user successfully connects to business
 * @param callDurationSeconds - Duration of the call in seconds
 * @param source - Where the call was initiated from
 */
export const trackCallConnected = (callDurationSeconds?: number, source: string = 'unknown'): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    const eventData: Record<string, any> = {
      'event_category': 'call_conversion',
      'event_label': 'call_connected',
      'event_value': callDurationSeconds || 0,
      'conversion_id': 'AW-17993147612'
    };

    // Only add duration if available and greater than 0
    if (callDurationSeconds && callDurationSeconds > 0) {
      eventData['duration_seconds'] = callDurationSeconds;
    }

    window.gtag('event', 'call_conversion', eventData);
  }
};

/**
 * Track call abandonment (user initiated call but didn't connect)
 * Helps optimize call asset performance
 * @param source - Where the call was initiated from
 */
export const trackCallAbandoned = (source: string = 'unknown'): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'call_abandoned', {
      'event_category': 'call_asset',
      'event_label': source,
      'conversion_id': 'AW-17993147612'
    });
  }
};

/**
 * Track high-value call conversion
 * Used for lead quality scoring - call resulted in actual business outcome
 * @param leadValue - Estimated value of the lead (optional)
 * @param leadQuality - Quality tier: 'high' | 'medium' | 'low'
 */
export const trackLeadCallConversion = (
  leadValue?: number,
  leadQuality: 'high' | 'medium' | 'low' = 'medium'
): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    const eventData: Record<string, any> = {
      'event_category': 'conversion',
      'event_label': `call_lead_${leadQuality}`,
      'conversion_id': 'AW-17993147612',
      'lead_quality': leadQuality
    };

    if (leadValue && leadValue > 0) {
      eventData['value'] = leadValue;
      eventData['currency'] = 'USD';
    }

    window.gtag('event', 'call_conversion', eventData);
  }
};

/**
 * Track manual call conversion (for sales team to mark calls as converted)
 * Call this when a call resulted in a sale or qualified lead
 * @param conversionValue - Value of the conversion (optional)
 * @param conversionLabel - Custom conversion label from Google Ads (optional)
 */
export const reportManualCallConversion = (
  conversionValue?: number,
  conversionLabel?: string
): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    const eventData: Record<string, any> = {
      'event_category': 'conversion',
      'event_label': conversionLabel || 'phone_call_conversion',
      'conversion_id': 'AW-17993147612'
    };

    if (conversionValue && conversionValue > 0) {
      eventData['value'] = conversionValue;
      eventData['currency'] = 'USD';
    }

    window.gtag('event', 'conversion', eventData);
  }
};

/**
 * Track call extension impressions
 * Useful for measuring visibility of call assets
 */
export const trackCallExtensionImpression = (campaignName?: string): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', {
      'event_category': 'call_asset',
      'event_label': 'impression',
      'campaign_name': campaignName || 'unknown',
      'conversion_id': 'AW-17993147612'
    });
  }
};

/**
 * Hook for click-to-call button implementation
 * Usage: <button onClick={() => useClickToCall('+1-800-000-0000', 'hero')}>Call Us</button>
 */
export const useClickToCall = (phoneNumber: string, source: string = 'direct'): (() => void) => {
  return () => {
    trackClickToCall(phoneNumber, source);
    // Initiate call
    window.location.href = `tel:${phoneNumber}`;
  };
};

/**
 * Batch report multiple call conversions from server-side
 * For use in API endpoints (e.g., processing bulk CRM data)
 * @param conversions - Array of conversion objects
 */
export const batchReportCallConversions = (
  conversions: Array<{
    value?: number;
    label?: string;
    timestamp?: Date;
  }>
): void => {
  conversions.forEach((conversion) => {
    reportManualCallConversion(conversion.value, conversion.label);
  });
};

/**
 * Type definitions for call tracking events
 */
export type CallTrackingEvent = 
  | 'click_to_call'
  | 'call_asset_engagement'
  | 'call_connected'
  | 'call_abandoned'
  | 'call_conversion'
  | 'conversion';

export interface CallConversionData {
  phoneNumber?: string;
  source?: string;
  duration?: number;
  value?: number;
  currency?: string;
  label?: string;
  leadQuality?: 'high' | 'medium' | 'low';
  timestamp?: Date;
}

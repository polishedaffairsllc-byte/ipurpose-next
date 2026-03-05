/**
 * Google Analytics 4 utility functions
 * Handles event tracking for conversions, user interactions, and funnel metrics
 */

// Ensure gtag is available globally
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

/**
 * Track custom events in GA4
 * @param eventName - Name of the event (e.g., 'sign_up', 'purchase')
 * @param eventData - Event parameters (value, currency, product_id, etc.)
 */
export const trackEvent = (eventName: string, eventData?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventData || {});
  }
};

/**
 * Track page view
 * @param pagePath - Page path (e.g., '/clarity-check')
 * @param pageTitle - Page title
 */
export const trackPageView = (pagePath: string, pageTitle?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle || document.title,
    });
  }
};

/**
 * Track conversion events
 */

// User creates account
export const trackSignUp = (method?: string) => {
  trackEvent('sign_up', {
    method: method || 'email',
  });
};

// User completes purchase
export const trackPurchase = ({
  transactionId,
  value,
  currency = 'USD',
  items,
  coupon,
}: {
  transactionId: string;
  value: number;
  currency?: string;
  items?: Array<{ item_id: string; item_name: string; price: number; quantity: number }>;
  coupon?: string;
}) => {
  trackEvent('purchase', {
    transaction_id: transactionId,
    value,
    currency,
    items: items || [],
    coupon: coupon || undefined,
  });
};

// User begins checkout
export const trackBeginCheckout = ({
  value,
  currency = 'USD',
  items,
}: {
  value: number;
  currency?: string;
  items?: Array<{ item_id: string; item_name: string; price: number; quantity: number }>;
}) => {
  trackEvent('begin_checkout', {
    value,
    currency,
    items: items || [],
  });
};

// User views product/offer
export const trackViewItem = ({
  itemId,
  itemName,
  itemCategory,
  price,
  currency = 'USD',
}: {
  itemId: string;
  itemName: string;
  itemCategory?: string;
  price?: number;
  currency?: string;
}) => {
  trackEvent('view_item', {
    items: [
      {
        item_id: itemId,
        item_name: itemName,
        item_category: itemCategory,
        price,
        currency,
      },
    ],
  });
};

// User adds to cart (or initiates product)
export const trackAddToCart = ({
  itemId,
  itemName,
  price,
  quantity = 1,
  currency = 'USD',
}: {
  itemId: string;
  itemName: string;
  price: number;
  quantity?: number;
  currency?: string;
}) => {
  trackEvent('add_to_cart', {
    items: [
      {
        item_id: itemId,
        item_name: itemName,
        price,
        quantity,
        currency,
      },
    ],
  });
};

// User generates lead (form submission)
export const trackGenerateLead = ({
  leadType,
  value,
  currency = 'USD',
}: {
  leadType: string;
  value?: number;
  currency?: string;
}) => {
  trackEvent('generate_lead', {
    lead_type: leadType,
    value,
    currency,
  });
};

// User engagement (viewing labs, courses, etc.)
export const trackEngagement = ({
  engagementType,
  itemName,
}: {
  engagementType: string;
  itemName?: string;
}) => {
  trackEvent('engagement', {
    engagement_type: engagementType,
    item_name: itemName,
  });
};

// User cohort join
export const trackJoinCohort = ({
  cohortId,
  cohortName,
  cohortStage,
}: {
  cohortId: string;
  cohortName: string;
  cohortStage?: string;
}) => {
  trackEvent('join_group', {
    group_id: cohortId,
    group_name: cohortName,
    group_stage: cohortStage,
  });
};

// Error tracking
export const trackError = ({
  errorType,
  errorMessage,
  source,
}: {
  errorType: string;
  errorMessage?: string;
  source?: string;
}) => {
  trackEvent('error', {
    error_type: errorType,
    error_message: errorMessage,
    source: source || 'client',
  });
};

/**
 * Specific e-commerce events for iPurpose products
 */

// Track Clarity Check lead capture
export const trackClarityCheckLead = (email?: string) => {
  trackGenerateLead({
    leadType: 'clarity_check',
    value: 0,
  });
};

// Track Starter Pack purchase
export const trackStarterPackPurchase = ({
  transactionId,
  amount,
}: {
  transactionId: string;
  amount: number;
}) => {
  trackPurchase({
    transactionId,
    value: amount,
    items: [
      {
        item_id: 'starter_pack',
        item_name: 'Starter Pack',
        price: amount,
        quantity: 1,
      },
    ],
  });
};

// Track AI Blueprint purchase
export const trackAIBlueprintPurchase = ({
  transactionId,
  amount,
}: {
  transactionId: string;
  amount: number;
}) => {
  trackPurchase({
    transactionId,
    value: amount,
    items: [
      {
        item_id: 'ai_blueprint',
        item_name: 'AI Blueprint',
        price: amount,
        quantity: 1,
      },
    ],
  });
};

// Track Accelerator purchase
export const trackAcceleratorPurchase = ({
  transactionId,
  amount,
  cohortId,
  cohortName,
}: {
  transactionId: string;
  amount: number;
  cohortId?: string;
  cohortName?: string;
}) => {
  trackPurchase({
    transactionId,
    value: amount,
    items: [
      {
        item_id: `accelerator_${cohortId || 'unknown'}`,
        item_name: `Accelerator ${cohortName || ''}`,
        price: amount,
        quantity: 1,
      },
    ],
  });

  if (cohortId && cohortName) {
    trackJoinCohort({
      cohortId,
      cohortName,
    });
  }
};

// Track Clarity Check completion (when user views their results)
// Also sends conversion event to Google Ads (AW-17993147612)
export const trackClarityCheckCompleted = (email?: string) => {
  trackEvent('clarity_check_completed', {
    lead_type: 'clarity_check',
    email: email,
  });

  // Send conversion to Google Ads
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      'conversion_id': 'AW-17993147612',
      'conversion_label': 'clarity_check_completed',
      'value': 1,
      'currency': 'USD',
      'email': email,
    });
  }
};

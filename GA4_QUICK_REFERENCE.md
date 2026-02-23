# GA4 Quick Reference - Copy & Paste

## Import
```tsx
import { 
  trackSignUp,
  trackPurchase,
  trackBeginCheckout,
  trackGenerateLead,
  trackClarityCheckLead,
  trackStarterPackPurchase,
  trackAcceleratorPurchase,
} from '@/lib/analytics';
```

## Common Events

### Sign Up (Account Creation)
```tsx
trackSignUp('email');  // After Firebase auth succeeds
```

### Lead Capture (Clarity Check)
```tsx
trackClarityCheckLead();  // After form submitted
```

### Begin Checkout
```tsx
trackBeginCheckout({
  value: 49,
  items: [{
    item_id: 'starter_pack',
    item_name: 'Starter Pack',
    price: 49,
    quantity: 1,
  }]
});
```

### Purchase - Starter Pack
```tsx
trackStarterPackPurchase({
  transactionId: session.id,
  amount: 49,
});
```

### Purchase - AI Blueprint
```tsx
trackAIBlueprintPurchase({
  transactionId: session.id,
  amount: 199,
});
```

### Purchase - Accelerator
```tsx
trackAcceleratorPurchase({
  transactionId: session.id,
  amount: 597,
  cohortId: 'feb-2026',
  cohortName: 'February 2026 Cohort',
});
```

### Join Cohort
```tsx
trackJoinCohort({
  cohortId: 'feb-2026',
  cohortName: 'February 2026',
  cohortStage: 'Foundation',
});
```

### Product View
```tsx
trackViewItem({
  itemId: 'starter_pack',
  itemName: 'Starter Pack',
  itemCategory: 'Course',
  price: 49,
});
```

### Engagement
```tsx
trackEngagement({
  engagementType: 'lab_view',
  itemName: 'Identity Lab',
});
```

### Error
```tsx
trackError({
  errorType: 'stripe_error',
  errorMessage: error.message,
  source: 'checkout',
});
```

## Custom Event
```tsx
import { trackEvent } from '@/lib/analytics';

trackEvent('custom_event_name', {
  custom_param: 'value',
  another_param: 123,
});
```

---

## Where to Add Each Event

| File | Event | Function |
|------|-------|----------|
| `/app/clarity-check/page.tsx` | Lead | `trackClarityCheckLead()` |
| `/app/enroll/create-account/page.tsx` | Sign Up | `trackSignUp('email')` |
| `/app/api/stripe/create-checkout-session/route.ts` | Begin Checkout | `trackBeginCheckout({...})` |
| `/app/api/stripe/webhook/route.ts` | Purchase | `trackStarterPackPurchase(...)` |
| `/app/starter-pack/StarterPackLandingClient.tsx` | View | `trackViewItem(...)` |
| `/app/ai-blueprint/AIBlueprintLandingClient.tsx` | View | `trackViewItem(...)` |

---

## GA4 Dashboard Links
- Real-time: https://analytics.google.com/analytics/web/#/realtime/RT-OVERVIEW
- Conversions: https://analytics.google.com/analytics/web/#/conversions/overview
- Revenue: https://analytics.google.com/analytics/web/#/monetization/overview
- Funnels: https://analytics.google.com/analytics/web/#/analysis/funnel

---

## Test in Browser Console
```js
// Test event firing
gtag('event', 'test_event', { test: 'value' });

// Check if gtag is available
console.log(typeof window.gtag);  // Should be 'function'

// View dataLayer
console.log(window.dataLayer);
```

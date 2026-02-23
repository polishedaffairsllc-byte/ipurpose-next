# Google Analytics 4 Installation & Implementation Guide

**Date:** February 23, 2026  
**Status:** ✅ Installed & Ready to Use  
**Measurement ID:** `G-9D1QBMLNWK` (from Firebase)

---

## What's Been Installed

### 1. **GA4 Script in Root Layout** ✅
- **File:** `/app/layout.tsx`
- **What it does:** Injects GA4 tag globally on every page
- **Configuration:** 
  - Uses `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` env variable (prevents hardcoding)
  - Privacy settings: `anonymize_ip: true`, `allow_google_signals: false`

### 2. **Analytics Utility Library** ✅
- **File:** `/lib/analytics.ts`
- **What it provides:** Pre-built functions for tracking all conversion events

---

## How to Use in Your Code

### Import the Analytics Functions
```tsx
import { 
  trackSignUp, 
  trackPurchase, 
  trackClarityCheckLead,
  trackStarterPackPurchase,
  trackAcceleratorPurchase
} from '@/lib/analytics';
```

### Tracking Sign-Ups
```tsx
// When user successfully creates account
trackSignUp('email');  // or 'google', 'apple', etc.
```

### Tracking Lead Captures
```tsx
// In Clarity Check form submission
import { trackClarityCheckLead } from '@/lib/analytics';

const handleClarityCheckSubmit = async (email: string) => {
  // ... form logic
  trackClarityCheckLead(email);
};
```

### Tracking Purchases
```tsx
// After Stripe payment succeeds
import { trackStarterPackPurchase, trackAcceleratorPurchase } from '@/lib/analytics';

// For Starter Pack
trackStarterPackPurchase({
  transactionId: session.id,
  amount: 49, // or whatever the price is
});

// For Accelerator (with cohort info)
trackAcceleratorPurchase({
  transactionId: session.id,
  amount: 597,
  cohortId: cohort.id,
  cohortName: 'February 2026',
});
```

### Tracking Checkout Initiation
```tsx
import { trackBeginCheckout } from '@/lib/analytics';

// When user clicks "Purchase Now" button
const handlePurchaseClick = () => {
  trackBeginCheckout({
    value: 49,
    items: [
      {
        item_id: 'starter_pack',
        item_name: 'Starter Pack',
        price: 49,
        quantity: 1,
      }
    ]
  });
  // Then redirect to Stripe checkout
};
```

### Tracking Product Views
```tsx
import { trackViewItem } from '@/lib/analytics';

// When user lands on Starter Pack page
trackViewItem({
  itemId: 'starter_pack',
  itemName: 'Starter Pack',
  itemCategory: 'Course',
  price: 49,
});
```

### Tracking Engagement
```tsx
import { trackEngagement } from '@/lib/analytics';

// When user views a lab
trackEngagement({
  engagementType: 'lab_view',
  itemName: 'Identity Lab',
});

// When user completes a session
trackEngagement({
  engagementType: 'session_complete',
  itemName: 'Weekly Session #1',
});
```

---

## Required Implementation Checklist

### 🔴 CRITICAL (Do First)

- [ ] **Clarity Check Form:** Add `trackClarityCheckLead()` on successful form submission
  - File: `/app/clarity-check/page.tsx`
  - Location: After form validation passes

- [ ] **Stripe Webhook:** Add purchase tracking on successful payment
  - File: `/app/api/stripe/webhook/route.ts`
  - Location: In `charge.succeeded` event handler
  - Code:
    ```tsx
    import { trackStarterPackPurchase, trackAcceleratorPurchase } from '@/lib/analytics';
    
    if (event.type === 'charge.succeeded') {
      const product = metadata.product; // 'starter_pack', 'ai_blueprint', 'accelerator'
      const amount = event.data.object.amount / 100; // Convert from cents
      
      if (product === 'starter_pack') {
        trackStarterPackPurchase({ transactionId: event.id, amount });
      } else if (product === 'accelerator') {
        trackAcceleratorPurchase({ 
          transactionId: event.id, 
          amount,
          cohortId: metadata.cohortId,
          cohortName: metadata.cohortName,
        });
      }
    }
    ```

- [ ] **Account Creation:** Add `trackSignUp()` after Firebase auth succeeds
  - File: `/app/enroll/create-account/page.tsx`
  - Location: After `createUserWithEmailAndPassword()` succeeds
  - Code:
    ```tsx
    import { trackSignUp } from '@/lib/analytics';
    
    // After Firebase user created
    trackSignUp('email');
    ```

- [ ] **Checkout Initiation:** Add `trackBeginCheckout()` when Stripe session starts
  - File: `/app/api/stripe/create-checkout-session/route.ts`
  - Location: Before returning checkout URL
  - Code:
    ```tsx
    import { trackBeginCheckout } from '@/lib/analytics';
    
    // After Stripe session created
    trackBeginCheckout({
      value: sessionPrice,
      items: [{ item_id, item_name, price: sessionPrice, quantity: 1 }]
    });
    ```

### 🟡 IMPORTANT (Do Second)

- [ ] **Starter Pack Landing:** Add `trackViewItem()` on page load
  - File: `/app/starter-pack/StarterPackLandingClient.tsx`
  - Location: useEffect on mount

- [ ] **AI Blueprint Landing:** Add `trackViewItem()` on page load
  - File: `/app/ai-blueprint/AIBlueprintLandingClient.tsx`
  - Location: useEffect on mount

- [ ] **Accelerator Join:** Add `trackJoinCohort()` on enrollment
  - File: `/app/accelerator/page.tsx`
  - Location: After user successfully enrolls in cohort

### 🟢 NICE TO HAVE (Optional)

- [ ] **Error Tracking:** Add `trackError()` for debugging
  - Track failed Stripe transactions
  - Track auth failures
  - Track API errors

- [ ] **Engagement Tracking:** Add `trackEngagement()` for product usage
  - Lab completions
  - Session completions
  - Community posts
  - Course module completions

---

## Verification: Is GA4 Working?

### Step 1: Check Installation
1. Go to https://analytics.google.com
2. Navigate to Admin → Account → Property
3. Property ID: **G-9D1QBMLNWK** should be visible

### Step 2: Verify Real-Time Data
1. Go to Reports → Real-time
2. Load your homepage: http://localhost:3000 or production URL
3. You should see your session within 1-2 seconds in the Real-time report

### Step 3: Test Events
1. Open browser DevTools (F12) → Console
2. Type: `gtag('event', 'test_event', { test: 'success' })`
3. Go back to GA4 → Real-time → Events
4. Confirm `test_event` appears

### Step 4: Test Purchase Event
1. Complete a purchase in Stripe test mode
2. Go to GA4 → Real-time → Events
3. Look for `purchase` event with transaction details

---

## Expected Event Flow (Purchase Funnel)

```
User Flow → GA4 Event Tracking
─────────────────────────────────

Homepage               → (automatic page_view)
  ↓
Click "Purchase"      → begin_checkout
  ↓
Stripe Checkout       → (automatic page_view)
  ↓
Complete Payment      → purchase + sign_up (if new user)
  ↓
Welcome Page          → join_group (if accelerator)
  ↓
Dashboard             → (automatic page_view)
```

---

## GA4 Events Now Available

| Event | Trigger | Use Case |
|-------|---------|----------|
| `page_view` | Every page load | Funnel analysis |
| `sign_up` | User creates account | Activation metric |
| `generate_lead` | Form submission | Lead generation |
| `view_item` | Product page load | Interest metric |
| `begin_checkout` | Stripe checkout starts | Drop-off analysis |
| `add_to_cart` | Initiative purchase | Consideration |
| `purchase` | Payment succeeds | Revenue tracking |
| `join_group` | Cohort enrollment | Engagement |
| `engagement` | In-product actions | Product usage |
| `error` | Errors occur | Debugging |

---

## Revenue Reporting in GA4

Once purchase events are firing:

1. **Reports → Monetization → Revenue**
   - Shows total revenue by product
   - Breakdown by date

2. **Reports → User Acquisition**
   - Shows where users come from (UTM tracking)
   - Cost per acquisition

3. **Reports → Funnel**
   - Custom conversion funnel
   - Drop-off analysis by step

4. **Conversions → Overview**
   - Conversion rate by traffic source
   - Conversion path analysis

---

## Privacy & Compliance

✅ **What's Configured:**
- IP anonymization enabled (`anonymize_ip: true`)
- Google Signals disabled (respects user privacy)
- No PII sent to GA (don't track user IDs)
- GDPR compliant if cookies properly disclosed

⚠️ **What You Should Add:**
- Google Analytics disclosure in Privacy Policy
- Cookie consent banner if targeting EU
- Data retention policy (default: 2 months)

---

## Troubleshooting

### GA4 Shows No Data
1. Clear browser cache (Ctrl+Shift+Delete)
2. Check DevTools → Network → gtag request to Google
3. Verify Measurement ID in layout.tsx is correct: `G-9D1QBMLNWK`
4. Check DevTools Console for errors

### Events Not Firing
1. Import function from `/lib/analytics.ts`
2. Ensure `typeof window !== 'undefined'` (client-side only)
3. Check DevTools Console: `window.gtag('event', 'test', {})`
4. Verify event fires before page navigation

### Double-Counted Events
- Don't call `trackSignUp()` multiple times in same session
- Use `trackEvent()` once per action, not repeatedly

---

## Next Steps

1. ✅ Implement the critical checklist items above
2. Test each event in GA4 Real-time dashboard
3. Create GA4 conversions for each event type
4. Set up funnels for each product's conversion path
5. Create daily reports for monitoring CAC & LTV


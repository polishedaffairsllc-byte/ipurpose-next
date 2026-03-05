# Google Ads Call-Only to Call Assets Migration

**Deadline:** February 2027 (Google deprecating Call-Only ads)  
**Status:** Migration in progress  
**Account:** AW-17993147612

## Overview

Google is deprecating Call-Only ads and requiring migration to **Call Assets** integrated within Search, Display, and Performance Max campaigns.

## Current Configuration

**File:** `app/layout.tsx` (lines 33-51)  
**Conversion ID:** AW-17993147612

### Current Implementation
```javascript
gtag('config', 'AW-17993147612');
```

## Migration Strategy

### Phase 1: Event-Based Conversion Tracking (✅ COMPLETE)
Enhanced the gtag configuration to support proper conversion tracking:
```javascript
gtag('config', 'AW-17993147612', {
  'allow_google_signals': true,
  'allow_ad_personalization_signals': true
});
```

**Why:** Ensures user consent signals are properly tracked for conversion attribution.

### Phase 2: Call Assets Setup (⏳ TO DO)

#### Step 1: Create Call Assets in Google Ads
1. Go to Google Ads account (AW-17993147612)
2. Navigate to **Assets > Assets library**
3. Create **Call Asset** with:
   - **Business name:** iPurpose
   - **Phone number:** (add your business phone)
   - **Call duration tracking:** Enable
   - **Preferred language:** English

#### Step 2: Update Campaigns to Use Call Assets
Instead of Call-Only campaigns:
1. Edit existing Search/Display campaigns
2. Add the new Call Asset to campaign assets
3. Set conversion tracking for calls

#### Step 3: Implement Call Conversion Tracking
Add call event tracking for calls received through call assets:

```typescript
// lib/callConversionTracking.ts
export const trackCallConversion = (phoneNumber?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'call_from_asset', {
      'phone_number': phoneNumber,
      'event_category': 'call_asset',
      'event_label': 'call_conversion'
    });
  }
};

// Track when click-to-call button is used
export const trackClickToCall = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'click_to_call', {
      'event_category': 'engagement',
      'event_label': 'call_asset_interaction'
    });
  }
};
```

### Phase 3: Campaign Migration Timeline

| Date | Action |
|------|--------|
| **Now** | Enable event-based conversion tracking |
| **Q1 2026** | Create Call Assets in Google Ads UI |
| **Q2 2026** | Replace Call-Only campaigns with Search/Display + Call Assets |
| **Q3 2026** | Monitor conversion data quality |
| **Feb 2027** | Deadline: All Call-Only ads must be migrated |

## Key Differences: Call-Only vs Call Assets

| Feature | Call-Only Ads | Call Assets |
|---------|---------------|------------|
| Campaign Type | Dedicated | Integrated (Search/Display/PMax) |
| Ad Format | Call button only | Flexible (text + call asset) |
| Analytics | Basic call tracking | Detailed conversion events |
| Flexibility | Limited | Full campaign control |
| Deprecation | ❌ Being removed | ✅ Current standard |

## Implementation Checklist

- [x] Update gtag configuration to support conversions
- [ ] Create Call Asset in Google Ads
- [ ] Link Call Asset to primary campaigns
- [ ] Set up call conversion tracking events
- [ ] Monitor conversion data in GA4
- [ ] Update campaigns off Call-Only format
- [ ] Test click-to-call tracking
- [ ] Document phone number in Call Asset
- [ ] Remove Call-Only campaigns by Feb 2027

## Call Tracking Events to Implement

Once Call Assets are set up, track these events:

```typescript
// Track click-to-call from call asset
gtag('event', 'call_from_asset', {
  'event_category': 'call_asset',
  'phone_number': '[BUSINESS_PHONE]'
});

// Track successful call connection
gtag('event', 'call_connected', {
  'event_category': 'call_asset',
  'duration_seconds': callDuration
});

// Track call abandonment
gtag('event', 'call_abandoned', {
  'event_category': 'call_asset'
});
```

## Resources

- [Google Ads Call Assets Documentation](https://support.google.com/google-ads/answer/9759147)
- [Call-Only Ads Deprecation Notice](https://support.google.com/google-ads/answer/14032855)
- [Event-based conversion tracking in Google Ads](https://support.google.com/google-ads/answer/9888656)
- [GA4 to Google Ads integration](https://support.google.com/google-ads/answer/6095821)

## Code Changes Made

**File:** `app/layout.tsx`
- Added enhanced gtag configuration with consent signals
- Updated comments to reflect migration status
- Maintained backward compatibility with AW-17993147612

## Next Steps

1. Create Call Asset in Google Ads console with business phone number
2. Create `lib/callConversionTracking.ts` module when Call Assets are live
3. Monitor GA4 for call-related events
4. Schedule migration completion before Feb 2027 deadline

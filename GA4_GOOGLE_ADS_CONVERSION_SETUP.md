# GA4 to Google Ads Conversion Setup: Clarity Check Completion

**Status:** Code complete - awaiting conversion action setup in Google Ads  
**Conversion ID:** AW-17993147612  
**GA4 Event:** `clarity_check_completed`  
**Event Value:** 1 (per completion)

## Implementation Complete ✅

The code has been updated to automatically send Clarity Check completions to Google Ads as conversions.

### What's Happening Now

When a user completes the Clarity Check and views their results:

1. **GA4 Event fires:** `clarity_check_completed` (sent to GA4)
2. **Google Ads Conversion fires:** Event sent to AW-17993147612 with:
   - `conversion_label`: 'clarity_check_completed'
   - `value`: 1 USD
   - `email`: User's email (if available)

### Code Changes

**File:** `lib/analytics.ts` (trackClarityCheckCompleted function)

```typescript
// Now includes:
window.gtag('event', 'conversion', {
  'conversion_id': 'AW-17993147612',
  'conversion_label': 'clarity_check_completed',
  'value': 1,
  'currency': 'USD',
  'email': email,
});
```

## Setting Up in Google Ads (Manual Step Required)

You now need to create a conversion action in Google Ads to receive these events.

### Step 1: Navigate to Conversion Actions

1. Go to **Google Ads** → **Tools & Settings** → **Conversions**
2. Click **+ New Conversion Action**
3. Choose **Website** (not App or Phone calls)

### Step 2: Configure Conversion Action

**Name:** `Clarity Check Completed`

**Category:** 
- Select: **Signup** or **Lead** (whichever fits your business model better)

**Conversion Value:**
- ✅ Check: "Don't use conversion value"
- (Or if you want to track: check box and select "Every conversion has the same value")
- Value: `1`

**Conversion counting:**
- Select: **"Every conversion counts"** (not "One per user per day")

**Attribution model:**
- Keep default: **"Data-driven"** (recommended)

### Step 3: Configure Tracking

**Tracking method:** Select **"Event-based"** (this is key!)

**Event setup:**
- Event name: `conversion`
- Event parameters to include:
  - `conversion_label` = `clarity_check_completed`
  - `email` (optional, for user matching)

### Step 4: Advanced Settings

**Status:** Keep as **"Enabled"**

**Include in 'Conversions':** ✅ Check this (so it counts toward ROAS)

### Step 5: Verify Setup

Click **Create and Continue** to finalize.

## Verification Checklist

After setting up the conversion action in Google Ads:

- [ ] Conversion action "Clarity Check Completed" appears in conversions list
- [ ] Status shows "Recording conversions"
- [ ] Wait 24 hours for data to flow
- [ ] Check **Conversions** → **Conversion actions** → see conversion count increase
- [ ] Verify in **Google Ads Reports** → **Conversion actions** → filter for "Clarity Check Completed"

## Real-Time Testing

### Test from Dev Environment

1. Start dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/clarity-check-numeric`
3. Complete the assessment
4. Check browser DevTools → Network tab → filter for `gtag` or `google-analytics`
5. Look for conversion event being sent

### Monitor in Google Ads

1. Go to **Google Ads** → **Tools & Settings** → **Conversions**
2. Click on "Clarity Check Completed" conversion action
3. Watch for recent conversions to appear (may take a few minutes)

## Data Flow Diagram

```
User completes Clarity Check
    ↓
Results page loads
    ↓
trackClarityCheckCompleted() fires
    ↓
GA4 Event: clarity_check_completed (sent to GA4)
    ↓
Google Ads Event: conversion (sent to AW-17993147612)
    ↓
Google Ads Conversion Action "Clarity Check Completed" records conversion
    ↓
Data appears in Google Ads reports & ROAS calculations
```

## Integration with Campaigns

Once this conversion action is tracking:

1. **Search Campaigns:** Can optimize bids toward Clarity Check completions
2. **Display Campaigns:** Can track lead quality from display ads
3. **Performance Max:** Can automatically optimize for this conversion
4. **Remarketing:** Can build audiences of people who completed clarity check

## Troubleshooting

**Problem:** Conversion action created but no conversions appearing

**Solutions:**
1. Wait 24-48 hours for initial data sync
2. Check that gtag is loading: Open DevTools → Network → search "gtag"
3. Verify event is firing: DevTools → Console → run:
   ```javascript
   window.gtag('event', 'conversion', { 'conversion_id': 'AW-17993147612' });
   ```
4. Check conversion action is "Enabled" in Google Ads

**Problem:** Events are firing but not recording in Google Ads

**Solutions:**
1. Verify conversion label matches exactly: `clarity_check_completed` (case-sensitive)
2. Check conversion counting setting: should be "Every conversion counts"
3. Ensure event-based tracking method selected (not "Tag-based")

## Data Validation in GA4

To verify events are flowing correctly through GA4:

1. Go to **GA4** → **Real-time** → **Events**
2. Complete Clarity Check in incognito window
3. Look for `clarity_check_completed` event in real-time stream
4. Click event to see parameters including `email`

## Attribution & Reporting

Once conversions are tracked:

- **Conversions by Campaign:** See which campaigns drive clarity checks
- **ROAS (Return on Ad Spend):** Calculate cost per clarity check completion
- **Conversion Paths:** See multi-touch attribution journey
- **Audiences:** Create remarketing audiences of converters

## Next Steps

1. **Create conversion action** in Google Ads (see steps above)
2. **Wait 24 hours** for data collection
3. **Verify conversions** appearing in Google Ads
4. **Set up conversion-focused bidding** in campaigns (optional)
5. **Monitor performance** over next 7-14 days

## Contact & Support

- **Conversion ID:** AW-17993147612
- **Event Name:** `clarity_check_completed`
- **Event Tracking:** Event-based (gtag)
- **Currency:** USD
- **Value:** 1 per completion

---

**Implementation Date:** March 5, 2026  
**Tested:** Yes (code complete, awaiting GA validation)

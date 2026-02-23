# 🎯 ONE-PAGE QUICK START
**Print This. Execute It. Done in 30 Minutes.**

---

## THE 5 ACTIONS

### ACTION 1: Vercel Environment Variables (5 MIN)
```
Go to: https://vercel.com/renita-hamilton-s-projects/ipurpose-next/settings/environment-variables

ADD:
  NEXT_PUBLIC_META_PIXEL_ID = [your pixel ID]
  META_CAPI_ACCESS_TOKEN = [your access token]

VERIFY:
  NEXT_PUBLIC_GA_MEASUREMENT_ID = G-FX51XM1DVS

THEN: Click Redeploy in Deployments tab
```

### ACTION 2: Redeploy (3 MIN)
```
Go to: https://vercel.com/renita-hamilton-s-projects/ipurpose-next/deployments

Find: Most recent deployment
Click: ... (three dots)
Select: Redeploy
Wait: 2-3 minutes for "Ready" status
```

### ACTION 3: Test GA4 Real-time (10 MIN)
```
Tab 1: https://analytics.google.com/analytics/web/#/realtime/overview/
Keep visible while testing

Tab 2: Test these pages:
  1. https://ipurposesoul.com/ → Should see page_view
  2. https://ipurposesoul.com/starter-pack → Should see page_view
     Click "Purchase" → Should see begin_checkout
  3. https://ipurposesoul.com/ai-blueprint → Should see page_view
  4. https://ipurposesoul.com/program → Should see page_view
     Click "Enroll Now" → Should see begin_checkout

Screenshot: All events appearing in real-time (6 screenshots)
```

### ACTION 4: Test Meta Purchase Event (5 MIN)
```
Tab 1: https://business.facebook.com/events_manager
Click: Test Events tab
Keep visible

Tab 2: Make a purchase
  https://ipurposesoul.com/starter-pack
  Click Purchase
  Complete with test card OR abandon checkout

Check Tab 1: After 30-60 seconds, refresh
Look for: Purchase event with green "Received" status

Screenshot: Purchase event showing value, currency, content_id (1 screenshot)
```

### ACTION 5: Stripe Verification (2 MIN)
```
Go to: https://dashboard.stripe.com/products

Find: "iPurpose Accelerator"
Verify: Price = $1,497 USD
Verify: Price ID = price_1Sr0TY4TjaS7bn689APmPvQW
Verify: Status = Active

Screenshot: Price details page (1 screenshot)
```

---

## SCREENSHOT CHECKLIST

```
☐ Vercel env vars (with values redacted)
☐ Vercel deployment "Ready"
☐ GA4: page_view (homepage)
☐ GA4: page_view + begin_checkout (/starter-pack)
☐ GA4: page_view (/ai-blueprint)
☐ GA4: page_view + begin_checkout (/program)
☐ Meta: Purchase event received (green checkmark)
☐ Stripe: Price $1,497 confirmed

TOTAL: 9 screenshots
```

---

## SUCCESS INDICATORS

### GA4
- ✓ Events appear within 5 seconds of page load
- ✓ Event names match: page_view, begin_checkout
- ✓ Timestamp shows "seconds ago"

### Meta
- ✓ Purchase event shows "Received" (green)
- ✓ Event appears within 60 seconds
- ✓ Value = 27, 47, or 1497 USD

### Vercel
- ✓ Deployment status = "Ready"
- ✓ URL reachable on ipurposesoul.com

---

## IF STUCK

```
GA4 not showing?
  → You're on https://ipurposesoul.com (not localhost)
  → Wait 10 seconds
  → Refresh GA4 page
  → Check G-FX51XM1DVS is correct

Meta Purchase not received?
  → Check access token is valid (not expired)
  → Check Pixel ID matches
  → Wait 60 seconds (Meta is slower)
  → Check Stripe webhook is firing

Deployment failed?
  → Refresh Vercel page
  → Try redeploy again
  → Check env var names are exact
```

---

## WHAT THIS PROVES

```
With these 9 screenshots, you prove:

✅ GA4 captures page views (people landing on site)
✅ GA4 captures product views (people interested)
✅ GA4 captures checkout clicks (purchase intent)
✅ Meta CAPI receives purchases (server-side tracking)
✅ Pricing matches Stripe exactly (no conflicts)

Result: Full funnel tracking for 100+ cold visitors
        Revenue attribution visible in GA4 + Meta
        Ready to scale ads with confidence
```

---

## TIME BREAKDOWN

```
Action 1 (Env vars)     5 min
Action 2 (Redeploy)     3 min
Action 3 (GA4 test)    10 min
Action 4 (Meta test)    5 min
Action 5 (Stripe)       2 min
─────────────────────────────
Total:                 25 min
```

---

## NEXT STEP

**Read: ACTION_PLAN_30MIN.md** (detailed version of this page)

**Then: Execute the 5 actions above**

**Finally: Send me the 9 screenshots**

---

**You're 30 minutes away from production-ready ad tracking.**


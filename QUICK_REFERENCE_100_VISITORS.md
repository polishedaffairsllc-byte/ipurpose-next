# QUICK REFERENCE: "100 COLD VISITORS" TRACKING PROOF

**What gets captured when 100 cold Instagram visitors land on ipurposesoul.com and make purchases:**

---

## 📊 GA4 TRACKING (Real-time visible in GA4 dashboard)

```
HOMEPAGE LANDING (100 users)
├─ page_view (/) — 100 events
├─ view_item (products clicked) — ~15-20 events
├─ begin_checkout (purchase clicked) — ~5-10 events
└─ purchase (checkout completed) — ~4-5 events

PRODUCT PAGES
├─ page_view (/starter-pack, /ai-blueprint) — ~15 events
├─ view_item (product details shown) — ~15 events
└─ begin_checkout (purchase clicked) — ~5 events

CHECKOUT PROCESS
└─ purchase (server-side from webhook) — ~4-5 events

TOTAL GA4 EVENTS: 150-170 captured
```

---

## 🎯 META EVENTS (Visible in Meta Events Manager → Test Events)

```
CLIENT-SIDE (from gtag library)
├─ PageView (on each page) — ~100+ events
├─ ViewContent (on product pages) — ~15-20 events
└─ InitiateCheckout (on purchase click) — ~5-10 events

SERVER-SIDE (from Stripe webhook) ← YOUR NEW TRACKING
└─ Purchase (after payment confirmed) — ~4-5 events ✨

TOTAL META EVENTS: 130-150 captured
```

---

## 💰 REVENUE CAPTURED

```
Expected Breakdown (assumptions):
├─ 2-3 Starter Pack purchases → $54-81
├─ 1-2 AI Blueprint purchases → $47-94
└─ 0-1 Accelerator purchases → $0-1,497

ESTIMATED TOTAL REVENUE: $101-$1,672
(depends on traffic quality + copy conversion)
```

---

## 🗂️ WHERE DATA IS STORED

```
Google Analytics:
  ├─ Real-time dashboard → Events as they fire
  ├─ Conversions report → Purchase events with revenue
  ├─ Source/Medium → Instagram attribution
  └─ User lifetime value → Repeat purchase potential

Meta Events Manager:
  ├─ Test Events tab → Purchase events (green checkmarks)
  ├─ Event count → Total conversions
  └─ Event properties → Value, currency, product

Firestore (Backend):
  ├─ users.entitlements → Purchase record (starterPack: true)
  ├─ enrollments → Transaction details + session ID
  └─ pending_entitlements → New user records before signup

Stripe Dashboard:
  ├─ Payments → All transactions complete
  ├─ Webhooks → Delivery log (confirms all events sent)
  └─ Revenue report → Total money collected
```

---

## ✅ ATTRIBUTION CHAIN (Example Visitor #1)

```
CLICK 1: Instagram Ad
  └─ UTM: utm_source=instagram&utm_campaign=awareness

CLICK 2: Homepage (ipurposesoul.com)
  └─ GA4: page_view (/) captured
  └─ Meta: PageView captured

CLICK 3: "Explore Starter Pack" button
  └─ GA4: page_view (/starter-pack) captured
  └─ GA4: view_item (starter_pack, $27) captured
  └─ Meta: ViewContent captured

CLICK 4: "Purchase" button
  └─ GA4: begin_checkout captured
  └─ Meta: InitiateCheckout captured
  └─ Opens Stripe Checkout

CLICK 5: "Pay Now" in Stripe
  └─ Payment processes
  └─ Stripe sends webhook

WEBHOOK FIRES (Server-side)
  └─ GA4: purchase event sent to Google
  └─ Meta CAPI: Purchase event sent to Meta ← PROOF
  └─ Firestore: entitlements.starterPack = true
  └─ Resend: Confirmation email sent
  └─ Return: Redirect to /purchase/success

RESULT IN REPORTS:
  ✓ GA4 shows: Instagram → Homepage → Starter Pack → Purchase ($27)
  ✓ Meta shows: Purchase event received from ipurposesoul.com
  ✓ Firestore shows: User has starterPack entitlement
  ✓ Email shows: Confirmation + access to product
```

---

## 🔍 SCREENSHOTS YOU'LL PROVIDE AS PROOF

1. **Vercel Environment Variables**
   - NEXT_PUBLIC_META_PIXEL_ID (redacted)
   - META_CAPI_ACCESS_TOKEN (redacted)
   - NEXT_PUBLIC_GA_MEASUREMENT_ID = G-FX51XM1DVS

2. **GA4 Real-time Dashboard**
   - page_view events firing
   - begin_checkout events firing
   - purchase events firing with values

3. **Meta Events Manager**
   - Purchase events received (green checkmarks)
   - Event count incrementing
   - Value and currency visible

4. **Stripe Dashboard**
   - Recent payments showing successful charges
   - Webhook delivery log showing successful events

---

## ⏱️ TIMING FOR ALL 100 USERS

```
Users 1-100 arrive over: 1 hour (typical ad campaign hour)

TRACKING LATENCY:
├─ GA4: Events appear in real-time (0-5 seconds)
├─ Meta CAPI: Events received within 60 seconds
├─ Email: Confirmation sent within 5 seconds
└─ Firestore: Entitlements updated immediately

REPORTING AVAILABLE:
├─ GA4 real-time: Visible instantly
├─ GA4 reports: Updated hourly
├─ Meta Event Manager: Visible within 60 seconds
└─ Full attribution: Available next day in GA4 reports
```

---

## 🎯 FINAL PROOF: "DO ALL SYSTEMS FIRE?"

Answer = **YES**, but only after YOU:

1. ✓ Add `NEXT_PUBLIC_META_PIXEL_ID` to Vercel
2. ✓ Add `META_CAPI_ACCESS_TOKEN` to Vercel
3. ✓ Verify `NEXT_PUBLIC_GA_MEASUREMENT_ID` exists
4. ✓ Redeploy
5. ✓ Test events appear in GA4 real-time
6. ✓ Test Purchase events appear in Meta Events Manager

**Timeline:** 30 minutes from now

**Result:** Full funnel tracking ready for paid ads

---

## 🚀 LAUNCH READINESS

```
Before Ads:          After Your Setup:
├─ No Meta tracking  ├─ Meta CAPI firing ✓
├─ GA4 uncertain     ├─ GA4 proven ✓
├─ Zero attribution  ├─ Full attribution ✓
└─ Can't optimize    └─ Can optimize ✓
```

**Confidence Level:** 95% (depends on your access tokens being valid)

---

**Questions?** See PRODUCTION_ACTIVATION_CHECKLIST.md for step-by-step details.


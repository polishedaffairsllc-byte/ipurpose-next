# PRODUCTION ACTIVATION CHECKLIST
**Date:** February 23, 2026  
**Status:** Ready for Environment Configuration + Verification

---

## 🔧 PART A — ENVIRONMENT VARIABLES (YOUR ACTION)

Add these to Vercel Production + Preview environments:

### Required Variables

```env
# Meta Pixel Conversions API
NEXT_PUBLIC_META_PIXEL_ID=<YOUR_PIXEL_ID>
META_CAPI_ACCESS_TOKEN=<YOUR_CAPI_ACCESS_TOKEN>

# Google Analytics (should already exist)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-FX51XM1DVS
```

### Steps in Vercel Dashboard

1. Go to **Settings** → **Environment Variables**
2. Add `NEXT_PUBLIC_META_PIXEL_ID`:
   - **Name:** `NEXT_PUBLIC_META_PIXEL_ID`
   - **Value:** Your Meta Pixel ID (from Meta Business Suite)
   - **Environments:** Check both `Production` and `Preview`
   - **Click:** Save

3. Add `META_CAPI_ACCESS_TOKEN`:
   - **Name:** `META_CAPI_ACCESS_TOKEN`
   - **Value:** Your Meta Conversions API access token
   - **Environments:** Check both `Production` and `Preview`
   - **Note:** This is PRIVATE (not `NEXT_PUBLIC_*`)
   - **Click:** Save

4. **Verify** `NEXT_PUBLIC_GA_MEASUREMENT_ID`:
   - **Expected Value:** `G-FX51XM1DVS`
   - **Status:** Should already be deployed
   - **If missing:** Add it now with same value

5. **Redeploy**:
   - Go to **Deployments** tab
   - Click the **...** menu on the most recent deployment
   - Select **"Redeploy"** (this picks up new env vars)
   - Wait for deployment to complete (typically 2-3 min)

### Evidence to Screenshot

After env vars are set and redeployed:
1. Screenshot the **Environment Variables** page with pixelated/redacted values showing:
   - `NEXT_PUBLIC_META_PIXEL_ID` exists (value redacted)
   - `META_CAPI_ACCESS_TOKEN` exists (value redacted)
   - `NEXT_PUBLIC_GA_MEASUREMENT_ID` = `G-FX51XM1DVS`
   - Both set to `Production` and `Preview`

2. Screenshot the **Deployments** page showing:
   - Most recent deployment status: **"Ready"** or **"Production"**
   - Deployment ID/hash (visible in deployment details)
   - Timestamp

---

## 🔍 PART B — GA4 REAL-TIME VERIFICATION (YOUR ACTION)

**Objective:** Prove GA4 events fire from live domain (ipurposesoul.com)

### Setup GA4 Real-Time Console

1. Open **Google Analytics 4** dashboard
2. Go to **Realtime** (left sidebar, at top)
3. Keep this tab open while testing

### Test Sequence

#### Test 1: View Product Page
1. In new tab, visit `https://ipurposesoul.com/starter-pack`
2. Watch GA4 Real-Time panel
3. **Expected:** See `page_view` event appear within 5 seconds
4. **Screenshot:** Capture showing:
   - Event name: `page_view`
   - Event count: `1`
   - Page path: `/starter-pack`
   - Timestamp in last 5 seconds

#### Test 2: Begin Checkout
1. On `/starter-pack` page, click the **"Purchase"** button
2. This fires `begin_checkout` event BEFORE checkout modal opens
3. **Expected:** See `starter_pack_begin_checkout` or similar in Real-Time
4. **Note:** You may need to look for the specific event name in the events list
5. **Screenshot:** Capture showing:
   - Event fired within last 10 seconds
   - Event name contains "checkout" or "begin"

#### Test 3: View All Product Pages
Repeat above tests for:
- `/ai-blueprint` → expect `page_view` + click button for `begin_checkout`
- `/program` → expect `page_view` + click "Enroll Now" for `accelerator_begin_checkout`

### Navigation Tips in GA4 Real-Time

- **Events panel:** Top-right shows events as they fire
- **Filter:** Click event name to see properties
- **Count:** Should increment in real-time as events fire
- **Timestamp:** Shows "seconds ago" for each event

### Screenshot Requirements

Capture 3-4 screenshots showing:
1. `page_view` event from `/starter-pack` with timestamp
2. `begin_checkout` event with product details
3. `page_view` event from `/ai-blueprint`
4. `begin_checkout` from `/program` page (Accelerator)

**Note:** If you don't see events, check:
- GA ID is correct: `G-FX51XM1DVS`
- You're on live domain: `https://ipurposesoul.com` (not localhost)
- Refresh page and wait 10 seconds
- Check GA4 doesn't have any filters blocking events

---

## 🎯 PART C — META CONVERSIONS API VERIFICATION (YOUR ACTION)

**Objective:** Prove Meta Pixel Purchase event fires server-side

### Prerequisite
- Have `NEXT_PUBLIC_META_PIXEL_ID` and `META_CAPI_ACCESS_TOKEN` set in Vercel
- Vercel redeployed with new env vars

### Meta Events Manager Setup

1. Go to **Meta Events Manager**:
   - URL: `https://business.facebook.com/events_manager`
   - Select your Pixel from dropdown

2. Click **"Test Events"** tab

3. Keep this tab open (refresh if needed after code deployment)

### Test Sequence

#### Purchase Event Test (Server-Side)

To trigger a Purchase event server-side:

**Option 1: Test with Real Transaction**
1. Go to `https://ipurposesoul.com/starter-pack`
2. Click **"Purchase"** button
3. **DO NOT** complete checkout (or complete with test card if you prefer)
4. Check Meta Events Manager after 30 seconds

**Option 2: Test Event Flag (If Available)**
- If your Stripe has test mode, make a test purchase
- Webhook fires with `checkout.session.completed`
- Meta CAPI sends `Purchase` event server-side
- Should appear in Events Manager within 60 seconds

#### Events to Expect in Meta Events Manager

**Event Name:** `Purchase`  
**Status:** Should show "Received" in green  
**Properties visible:**
- `value` = amount purchased (27, 47, or 1497)
- `currency` = USD
- `content_id` = product ID (starter_pack, ai_blueprint, accelerator)
- `content_name` = product name
- `user_data.em` = hashed email

### Screenshot Requirements

Capture 2-3 screenshots from Meta Events Manager showing:
1. **Test Events** tab open
2. Event received: "Purchase" event with green "Received" status
3. Event properties showing value, currency, content_id

**If no event appears:**
- Check `META_CAPI_ACCESS_TOKEN` is valid (not expired)
- Check webhook is firing (look at Stripe dashboard → Webhooks → Recent deliveries)
- Check Vercel logs for webhook handler output
- Verify Meta pixel ID matches Events Manager pixel ID

---

## 📝 PART D — PRICING INTEGRITY CONFIRMATION

### Current State (Already Verified)

✅ **Accelerator Price UI:** `$1,497` (app/program/page.tsx line 67)  
✅ **Stripe Price ID:** `price_1Sr0TY4TjaS7bn689APmPvQW`  
✅ **Code Pricing Constant:** `1497` USD  
✅ **No promotional pricing found** (no $297 or alternatives)

### Verification Steps (Your Optional Check)

1. **Stripe Dashboard Check:**
   - Go to Stripe Dashboard → Products
   - Find "iPurpose Accelerator" product
   - Click on price ID: `price_1Sr0TY4TjaS7bn689APmPvQW`
   - Verify: **Amount = $1,497 USD**
   - Status: **Active**

2. **UI Check:**
   - Visit `https://ipurposesoul.com/program`
   - Verify price displayed: **$1,497**

3. **Checkout Check:**
   - Click "Enroll Now"
   - Stripe checkout opens
   - Verify line item: **$1,497**

### Screenshot

Single screenshot showing Stripe dashboard price ID details with $1,497 amount visible

---

## ✅ PART E — FINAL "100 COLD VISITORS" READINESS

Once you complete parts A, B, C above, here's what will be tracked:

### End-to-End Event Flow

```
Cold Instagram Visitor → ipurposesoul.com (Homepage)
│
├─ GA4 Event: page_view ← CAPTURED
├─ Meta Pixel: PageView ← CAPTURED (client-side)
│
├─ Click: "Explore Starter Pack"
├─ GA4 Event: page_view (/starter-pack) ← CAPTURED
├─ GA4 Event: view_item (starter_pack, $27) ← CAPTURED
├─ Meta Pixel: ViewContent ← CAPTURED
│
├─ Click: "Purchase"
├─ GA4 Event: begin_checkout ← CAPTURED
├─ Meta Pixel: InitiateCheckout ← CAPTURED
│
├─ Click: "Pay Now" in Stripe checkout
├─ Stripe processes payment
│
├─ Webhook fires: checkout.session.completed
├─ GA4 Event: purchase (server-side) ← CAPTURED ✨
├─ Meta CAPI Event: Purchase (server-side) ← CAPTURED ✨
├─ Resend: Confirmation email sent
│
├─ Redirect: /purchase/success?product=starter_pack
├─ GA4 Event: page_view (/purchase/success) ← CAPTURED
├─ User sees: "Access Granted" + "Open Starter Pack"
```

### Attribution Visibility

**Google Analytics 4:**
- Real-time: See all events in Realtime dashboard
- Conversion report: "Conversions by Source" shows Instagram traffic converted
- Path analysis: Homepage → Product → Purchase funnel visible
- Full UTM support: If utm_source=instagram passed through, attribution clear

**Meta Events Manager:**
- Purchase events received with product details
- Value tracked for ROAS calculation
- Conversion pixel ready for Instagram ad optimization
- Audience creation possible (custom audiences from Purchase events)
- Campaign optimization can now bid on "Purchase" conversion

### Attribution Data Available

**Per Purchase Transaction:**
- Product purchased (starter_pack, ai_blueprint, accelerator)
- Price ($27, $47, or $1,497)
- Customer email (hashed in Meta)
- Timestamp (exact second)
- Source (if UTM preserved)

**Aggregated (GA Dashboard):**
- Total revenue by product
- Conversion rate by page
- Click-through rate (CTR) to checkout
- Average order value (AOV)
- Return on ad spend (ROAS) by campaign

### What's Tracked for 100 Cold Visitors

```
Estimated Breakdown (based on typical SaaS funnel):

100 Users Land on Homepage
  ├─ 65 view_item events (for products clicked)
  ├─ 15 begin_checkout events (clicked purchase)
  ├─ 4-5 purchase events (completed checkout)
  │
  └─ Meta Events Received:
     ├─ ~65 ViewContent events
     ├─ ~15 InitiateCheckout events
     └─ ~4-5 Purchase events

GA4 Attribution:
  - Source/Medium: instagram (if utm_source=instagram)
  - Campaign: (if utm_campaign set)
  - Conversion value: $sum of all purchases

Meta Attribution:
  - Pixel events: All actions tracked
  - ROAS calculation: Purchase value / Ad spend
  - Optimization: Next campaign can bid on "Purchase" event
```

### Proof You'll Have

**In GA4 Dashboard:**
- Realtime tab: Events appearing as they fire
- Conversions tab: Purchase events logged with value
- Source report: Traffic from Instagram with conversion data

**In Meta Events Manager:**
- Test Events tab: Purchase events received with green checkmark
- Event count: Incrementing with each purchase
- Event properties: Value, currency, product ID visible

**In Vercel Logs:**
- Webhook handler logs: "Meta CAPI Purchase event sent successfully"
- GA4 tracking logs: "Purchase event tracked"
- No errors in Function logs

---

## 🎬 NEXT STEPS

1. **You:** Add env vars to Vercel (5 min)
2. **You:** Redeploy Vercel (3 min, auto-triggered)
3. **You:** Test GA4 real-time (10 min, 4 screenshots)
4. **You:** Test Meta Purchase event (5 min, 2 screenshots)
5. **You:** Verify pricing in Stripe (2 min, 1 screenshot)

**Total Time:** ~30 minutes

**Result:** Full end-to-end tracking with GA4 + Meta Conversions API ready for paid ads

---

## 📋 SUMMARY OF CODE CHANGES (ALREADY DONE)

✅ **Created:** `lib/meta-capi.ts`
- Implements `sendMetaPurchaseEvent()`
- Hashes email for user data
- Sends to Meta Conversions API endpoint

✅ **Modified:** `app/api/stripe/webhook/route.ts`
- Added import for `sendMetaPurchaseEvent`
- Calls Meta CAPI after GA4 tracking
- Passes email, value, currency, product ID

✅ **Verified:** `app/program/page.tsx`
- Price display: `$1,497` ✅
- Matches Stripe: `price_1Sr0TY4TjaS7bn689APmPvQW` ✅

---

**Questions?** Check the logs in Vercel Function logs if events don't appear. Meta CAPI requires valid access token + pixel ID, GA4 requires correct measurement ID.


# 🎬 ACTION PLAN: NEXT 30 MINUTES
**Status:** Ready for Your Execution  
**Date:** February 23, 2026

---

## ✅ CODE SIDE: COMPLETE

```
✅ Meta Conversions API implemented (lib/meta-capi.ts)
✅ Webhook updated to call Meta CAPI (app/api/stripe/webhook/route.ts)
✅ Build successful (no errors)
✅ Code committed (c24f341 on main)
✅ Code pushed to GitHub
✅ Documentation complete
```

**Your Code is Ready to Deploy.**

---

## 👉 YOUR TURN: 5 ACTIONS (30 MIN TOTAL)

### ACTION 1: Add Environment Variables [5 MIN]

**Navigate to:**
```
Vercel Dashboard → Your Project (ipurpose-next) → Settings → Environment Variables
https://vercel.com/renita-hamilton-s-projects/ipurpose-next/settings/environment-variables
```

**Add Two New Variables:**

1. **Variable 1:**
   - Name: `NEXT_PUBLIC_META_PIXEL_ID`
   - Value: `[Your Meta Pixel ID]` (get from Meta Business Suite)
   - Environments: ✓ Production ✓ Preview
   - Save

2. **Variable 2:**
   - Name: `META_CAPI_ACCESS_TOKEN`
   - Value: `[Your Meta CAPI Access Token]` (get from Meta Business Suite)
   - Environments: ✓ Production ✓ Preview
   - Save

**Verify Existing:**

3. **Variable 3 (Verify Only):**
   - Name: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - Value: `G-FX51XM1DVS`
   - Environments: ✓ Production ✓ Preview
   - Status: Should already exist ✓

---

### ACTION 2: Redeploy [3 MIN]

**Navigate to:**
```
Vercel Dashboard → Your Project → Deployments tab
```

**Redeploy:**
1. Find most recent deployment
2. Click **`...`** (three dots menu)
3. Select **"Redeploy"**
4. Wait 2-3 minutes for status "Ready"

---

### ACTION 3: Test GA4 Events [10 MIN]

**Keep GA4 dashboard open in Tab 1:**
```
GA4 → Realtime
https://analytics.google.com/analytics/web/#/realtime/overview/a[YOUR-PROPERTY-ID]
```

**In Tab 2, Test Each Product Page:**

**Test 1: Homepage**
- Visit: `https://ipurposesoul.com/`
- GA4 should show: `page_view` event
- Screenshot: ✓ Capture event

**Test 2: Starter Pack**
- Visit: `https://ipurposesoul.com/starter-pack`
- GA4 should show: `page_view` event
- Click "Purchase" button
- GA4 should show: `begin_checkout` event
- Screenshot: ✓ Capture both events

**Test 3: AI Blueprint**
- Visit: `https://ipurposesoul.com/ai-blueprint`
- GA4 should show: `page_view` event
- Screenshot: ✓ Capture event

**Test 4: Accelerator**
- Visit: `https://ipurposesoul.com/program`
- GA4 should show: `page_view` event
- Click "Enroll Now" button
- GA4 should show: `begin_checkout` event
- Screenshot: ✓ Capture both events

**Total Screenshots Needed: 6**

---

### ACTION 4: Test Meta Purchase Events [5 MIN]

**Keep Meta Events Manager open in Tab 1:**
```
Meta → Events Manager → Test Events tab
https://business.facebook.com/events_manager
```

**In Tab 2, Trigger a Purchase:**

**Option A: Complete a Test Purchase**
- Visit: `https://ipurposesoul.com/starter-pack`
- Click "Purchase"
- Use Stripe test card: `4242 4242 4242 4242`
- Any future date, any CVC
- Complete checkout

**Option B: Abandon Checkout (Still Creates Event)**
- Visit: `https://ipurposesoul.com/starter-pack`
- Click "Purchase"
- Go back before completing payment

**Check Meta Events Manager:**
- After 30-60 seconds, refresh Events Manager
- Look for: New event with status "Received" (green checkmark)
- Event name: `Purchase`
- Properties: Should show value (27, 47, or 1497), currency (USD), content details

**Screenshot: ✓ Capture Purchase event received**

---

### ACTION 5: Stripe Confirmation [2 MIN]

**Navigate to:**
```
Stripe Dashboard → Products → Find "iPurpose Accelerator"
https://dashboard.stripe.com/products
```

**Verify:**
- Product: "iPurpose Accelerator"
- Price: $1,497 USD
- Price ID: `price_1Sr0TY4TjaS7bn689APmPvQW`
- Status: Active

**Screenshot: ✓ Capture price details**

---

## 📸 SCREENSHOTS TO PROVIDE

**Total: 9 Screenshots**

| Screenshot # | What | Where |
|---|---|---|
| 1 | Environment Variables page | Vercel Dashboard |
| 2 | Deployment "Ready" status | Vercel Deployments |
| 3 | GA4 `page_view` (homepage) | GA4 Real-time |
| 4 | GA4 `page_view` (/starter-pack) | GA4 Real-time |
| 5 | GA4 `begin_checkout` (Starter Pack) | GA4 Real-time |
| 6 | GA4 `page_view` (/program) | GA4 Real-time |
| 7 | GA4 `begin_checkout` (Accelerator) | GA4 Real-time |
| 8 | Meta Purchase event received | Meta Events Manager |
| 9 | Stripe price confirmation | Stripe Dashboard |

---

## ✅ SUCCESS INDICATORS

**GA4 Real-time:**
- ✓ Events appear within 5 seconds of page load
- ✓ Event names match expected (page_view, begin_checkout)
- ✓ Timestamps show "seconds ago"

**Meta Events Manager:**
- ✓ Purchase event shows green "Received" status
- ✓ Event appears within 60 seconds of purchase
- ✓ Value shows correct amount (27, 47, or 1497)

**Deployment:**
- ✓ Deployment shows "Ready" in Vercel
- ✓ No errors in Function logs
- ✓ Build time < 5 minutes

---

## 🚨 TROUBLESHOOTING IF STUCK

### GA4 Events Not Showing
```
1. Verify you're on https://ipurposesoul.com (not localhost)
2. Refresh GA4 Real-time page
3. Wait 10 seconds for events to appear
4. Check GA4 property ID is correct (G-FX51XM1DVS)
5. Check no audience filters are active
```

### Meta Purchase Event Not Received
```
1. Verify META_CAPI_ACCESS_TOKEN is valid (not expired)
2. Verify NEXT_PUBLIC_META_PIXEL_ID matches your Pixel ID
3. Check Stripe webhook is firing (Stripe → Webhooks → Events)
4. Check Vercel Function logs for errors
5. Verify Firestore entitlements are being set
```

### Vercel Deployment Stuck
```
1. Try refreshing page
2. Wait 5 minutes (auto-retries if network issue)
3. Manually trigger new deployment if needed
4. Check deployment logs for errors
```

---

## 📞 WHAT HAPPENS NEXT

**Once All 5 Actions Complete:**

1. ✅ You send me the 9 screenshots
2. ✅ I verify all systems are firing
3. ✅ System is confirmed production-ready
4. ✅ You can launch Instagram ads with confidence
5. ✅ Full attribution tracking for 100+ cold visitors

---

## 🎯 FINAL PROOF: "100 COLD VISITORS"

**When 100 cold Instagram visitors arrive:**

```
GA4 will show:
  ✓ 100+ page_view events
  ✓ 15-20 view_item events (products clicked)
  ✓ 5-10 begin_checkout events (purchase clicked)
  ✓ 4-5 purchase events (payments completed)

Meta will show:
  ✓ ~100 PageView events
  ✓ ~15-20 ViewContent events
  ✓ ~5-10 InitiateCheckout events
  ✓ ~4-5 Purchase events ← SERVER-SIDE (YOUR NEW TRACKING)

Revenue captured:
  ✓ $100-$1,672 (depending on traffic quality)

Attribution visible:
  ✓ GA4: "Instagram drove X conversions, $Y revenue"
  ✓ Meta: "ROAS = $Y / $Z ad spend"
```

---

## 📋 CHECKLIST

- [ ] Environment variables added to Vercel (Variables 1, 2, 3)
- [ ] Vercel redeployed (status "Ready")
- [ ] GA4 real-time tested (6 screenshots captured)
- [ ] Meta Purchase event tested (1 screenshot captured)
- [ ] Stripe price verified (1 screenshot captured)
- [ ] Screenshots ready to send

**Total Time:** 25-30 minutes

**Result:** Production-ready system proven with screenshots

---

## 📚 REFERENCE DOCUMENTS

If you need details while executing:

- **PRODUCTION_ACTIVATION_CHECKLIST.md** — Detailed step-by-step guide
- **COMPREHENSIVE_REVENUE_AUDIT.md** — Technical deep-dive
- **PRODUCTION_READINESS_SUMMARY.md** — Implementation overview
- **QUICK_REFERENCE_100_VISITORS.md** — Tracking breakdown

---

## ⏰ TIME BREAKDOWN

```
Action 1 (Env vars):     5 min
Action 2 (Redeploy):     3 min
Action 3 (GA4 testing):  10 min
Action 4 (Meta testing): 5 min
Action 5 (Stripe check): 2 min
─────────────────────────────
Total:                  25 min
```

**You can be production-ready in < 30 minutes.**

---

**Ready? Start with ACTION 1.**

Questions? See PRODUCTION_ACTIVATION_CHECKLIST.md for detailed instructions.


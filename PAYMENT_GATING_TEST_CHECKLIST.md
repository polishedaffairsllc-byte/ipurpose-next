# iPurpose Payment Gating - End-to-End Test Checklist

## Pre-Test Requirements
- [ ] Environment variables configured in `.env.local`:
  - `STRIPE_SECRET_KEY` (sk_test_... or sk_live_...)
  - `STRIPE_WEBHOOK_SECRET` (whsec_...)
  - `STRIPE_PRICE_ID_6WEEK` (price_...)
  - `NEXT_PUBLIC_APP_URL` (http://localhost:3000 for dev)
- [ ] Dev server running: `npm run dev`
- [ ] Browser dev tools open to check console and network

---

## Test 1: Public Navigation (No Sign Up Available)
**Goal:** Verify public signup path is completely removed

- [ ] Visit homepage `/`
- [ ] Check header navigation - NO "Get Started" or "Sign Up" link present
- [ ] Check footer - NO "Sign Up" link in Account column
- [ ] Click "Sign In" button works and navigates to `/login`
- [ ] Manually navigate to `/signup` - renders "Enrollment Required" message
- [ ] `/signup` shows 4 CTAs: "View Program", "Take Clarity Check", "Sign In"
- [ ] No signup form is accessible anywhere

**Expected Result:** ✅ Public signup completely removed

---

## Test 2: Checkout Flow (Stripe Redirect)
**Goal:** Verify Program page CTA triggers Stripe checkout

- [ ] Visit `/program` page
- [ ] Page loads normally with full Program content (SEO-friendly)
- [ ] Scroll to "Enroll Now" button at bottom
- [ ] Click "Enroll Now" button
- [ ] Button shows "Starting Enrollment..." loading state
- [ ] Browser redirects to `https://checkout.stripe.com/...` (Stripe Checkout)
- [ ] Stripe checkout page loads with:
  - [ ] 6-Week Program product details
  - [ ] Correct price from `STRIPE_PRICE_ID_6WEEK`
  - [ ] Email field
  - [ ] Test card option

**Expected Result:** ✅ Checkout session created and redirect to Stripe works

---

## Test 3: Test Payment (Stripe Test Card)
**Goal:** Complete test payment and verify success redirect

- [ ] On Stripe Checkout page, enter:
  - [ ] Email: test+[timestamp]@example.com (unique per test)
  - [ ] Card: `4242 4242 4242 4242`
  - [ ] Exp: Any future date (e.g., 12/26)
  - [ ] CVC: Any 3 digits (e.g., 123)
  - [ ] Name: "Test User"
- [ ] Click "Pay" button
- [ ] Payment processes (may take 2-3 seconds)
- [ ] Browser redirects to `/enroll/create-account?session_id=cs_test_...`
- [ ] Page shows "Verifying enrollment..." briefly
- [ ] After verification, form appears with:
  - [ ] Email pre-filled with test email
  - [ ] Password field
  - [ ] "Complete Your Account" heading

**Expected Result:** ✅ Payment successful, session verified, form displayed

---

## Test 4: Account Creation (Post-Payment)
**Goal:** Verify account creation after payment verification

- [ ] On `/enroll/create-account` form:
  - [ ] Email is pre-filled with payment email
  - [ ] Enter password (e.g., TestPassword123!)
  - [ ] Click "Create Account" button
- [ ] Button shows loading state "Creating account..."
- [ ] Background processing:
  - [ ] Firebase account created with email/password
  - [ ] Session cookie established
  - [ ] User entitlement record written to Firestore at `users/{uid}` with:
    - `entitlement.status: "active"`
    - `entitlement.product: "6-week"`
    - `entitlement.cohort: "2026-03"`
    - `entitlement.checkoutSessionId: {session_id}`
    - `entitlement.stripeCustomerId: {customer_id}`
- [ ] Browser redirects to `/dashboard`
- [ ] Dashboard loads successfully with user greeting

**Expected Result:** ✅ Account created, entitlement active, user signed in

---

## Test 5: Protected Route Access (Entitled User)
**Goal:** Verify entitled user can access all protected routes

After completing Test 4, user should have active entitlement:

- [ ] Navigate to `/ai` - page loads successfully with Mentor interface
- [ ] Navigate to `/soul` - page loads successfully
- [ ] Navigate to `/systems` - page loads successfully
- [ ] Navigate to `/insights` - page loads successfully
- [ ] Navigate to `/dashboard` - page loads successfully
- [ ] Navigate to `/settings` - page loads successfully
- [ ] Navigate to `/profile` - page loads successfully
- [ ] All protected routes respond with content (no redirects)

**Expected Result:** ✅ All protected routes accessible with active entitlement

---

## Test 6: Protected Route Blocking (Non-Entitled User)
**Goal:** Verify non-entitled users are redirected from protected routes

**Setup:** Open new private/incognito window (unauthenticated)

- [ ] Try to access `/dashboard` directly
- [ ] Browser redirects to `/login` (not authenticated)
- [ ] Sign in with existing account that has NO entitlement:
  - [ ] If you don't have one, create via Firebase Console: `users/{uid}` with NO `entitlement` field
  - [ ] Or use test credentials without payment history
- [ ] After signing in, try to access `/ai`
- [ ] Browser immediately redirects to `/enrollment-required`
- [ ] `/enrollment-required` page shows:
  - [ ] "Access to this page requires active enrollment in our program"
  - [ ] CTAs: "View Program", "Schedule Info Session", "Take Clarity Check", "Sign In"
- [ ] Repeat for other protected routes:
  - [ ] `/dashboard` → `/enrollment-required`
  - [ ] `/soul` → `/enrollment-required`
  - [ ] `/systems` → `/enrollment-required`
  - [ ] `/insights` → `/enrollment-required`
  - [ ] `/settings` → `/enrollment-required`
  - [ ] `/profile` → `/enrollment-required` (or ProtectedRoute component)

**Expected Result:** ✅ Non-entitled users blocked from all protected routes

---

## Test 7: Webhook Enrollment Recording (Optional - Advanced)
**Goal:** Verify Stripe webhook writes enrollment records to Firestore

**Setup:** Install Stripe CLI and configure webhook listener

```bash
# Install Stripe CLI (one-time)
brew install stripe/stripe-cli/stripe

# Start webhook listener
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy the webhook signing secret (starts with whsec_)
# Add to .env.local as STRIPE_WEBHOOK_SECRET
```

**Test:**
- [ ] Start dev server: `npm run dev`
- [ ] In another terminal, trigger test webhook event:
  ```bash
  stripe trigger checkout.session.completed
  ```
- [ ] Check Firestore `enrollments` collection for new document:
  - [ ] Document ID: matches `session.id`
  - [ ] Fields present:
    - [ ] `checkoutSessionId`
    - [ ] `stripeCustomerId`
    - [ ] `email`
    - [ ] `product: "6-week"`
    - [ ] `cohort: "2026-03"`
    - [ ] `status: "paid"`
    - [ ] `createdAt` (server timestamp)

**Expected Result:** ✅ Webhook processes and records enrollment

---

## Test 8: Session Verification Edge Cases
**Goal:** Verify error handling in edge cases

- [ ] Manually navigate to `/enroll/create-account?session_id=invalid`
- [ ] Page shows "Verification Required" with error message
- [ ] Try `/enroll/create-account` (no session_id param)
- [ ] Page shows "Verification Required" with "Missing session ID" error
- [ ] Try `/enroll/create-account?session_id=cs_test_expired` (old session)
- [ ] Page shows verification failure message
- [ ] Verify all CTAs in error state work correctly

**Expected Result:** ✅ Error handling graceful and informative

---

## Test 9: Login / Logout Entitlement Persistence
**Goal:** Verify entitlement persists across sessions

After completing Test 4:

- [ ] On dashboard, note user is logged in
- [ ] Log out (click Logout button)
- [ ] Browser clears session cookie
- [ ] Redirected to `/login`
- [ ] Sign back in with same email/password from Test 4
- [ ] Browser redirects to `/dashboard`
- [ ] User is logged in again
- [ ] Access `/ai` - page loads (still has active entitlement)
- [ ] Verify entitlement is still active in Firestore

**Expected Result:** ✅ Entitlement persists across login/logout cycles

---

## Test 10: Payment Cancellation
**Goal:** Verify cancel flow returns to Program page

- [ ] Go to `/program`
- [ ] Click "Enroll Now"
- [ ] Redirected to Stripe Checkout
- [ ] Click browser back button or "Back to iPurpose" link
- [ ] Browser navigates back to `/program`
- [ ] Program page still loads normally

**Expected Result:** ✅ Cancel flow returns gracefully

---

## Checklist Completion Summary

| Test | Status | Notes |
|------|--------|-------|
| 1. Public Navigation | [ ] Pass [ ] Fail | |
| 2. Checkout Flow | [ ] Pass [ ] Fail | |
| 3. Test Payment | [ ] Pass [ ] Fail | |
| 4. Account Creation | [ ] Pass [ ] Fail | |
| 5. Protected Routes (Entitled) | [ ] Pass [ ] Fail | |
| 6. Protected Routes (Non-Entitled) | [ ] Pass [ ] Fail | |
| 7. Webhook Recording | [ ] Pass [ ] Fail | |
| 8. Session Verification | [ ] Pass [ ] Fail | |
| 9. Login/Logout Persistence | [ ] Pass [ ] Fail | |
| 10. Payment Cancellation | [ ] Pass [ ] Fail | |

**Overall Status:** [ ] 🟢 All Tests Pass [ ] 🟡 Some Tests Fail [ ] 🔴 Blocker Issues

---

## Debugging Notes

### Common Issues & Solutions

**Issue: "STRIPE_WEBHOOK_SECRET not configured"**
- Solution: Add `STRIPE_WEBHOOK_SECRET` to `.env.local` (get from Stripe Dashboard → Webhooks)

**Issue: "STRIPE_SECRET_KEY not configured"**
- Solution: Add `STRIPE_SECRET_KEY` to `.env.local` (get from Stripe Dashboard → API Keys)

**Issue: Checkout redirects but payment doesn't create entitlement**
- Check webhook listener is running: `stripe listen`
- Check Firestore `enrollments` collection for records
- Check user account creation in Firebase Console

**Issue: Entitled user gets redirected to /enrollment-required**
- Check Firestore `users/{uid}.entitlement.status === "active"`
- Verify user has session cookie: check browser cookies for `FirebaseSession`

**Issue: "Enrollment Required" shows but session_id param is valid**
- Check verify-session endpoint response in Network tab
- Verify `payment_status === "paid"` on Stripe session

**Issue: Stripe CLI webhook not triggering**
- Ensure dev server is running on `http://localhost:3000`
- Check webhook listener output for errors
- Verify STRIPE_WEBHOOK_SECRET matches listener secret

---

## Environment Variables Reference

```
# Required for Stripe checkout
STRIPE_SECRET_KEY=sk_test_... (from Stripe Dashboard → API Keys → Secret key)
STRIPE_PRICE_ID_6WEEK=price_... (from Stripe Dashboard → Products → 6-Week → Pricing)
STRIPE_WEBHOOK_SECRET=whsec_... (from Stripe Dashboard → Webhooks → Endpoint details)

# For success redirect
NEXT_PUBLIC_APP_URL=http://localhost:3000 (dev) or https://yourdomain.com (prod)

# Optional Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
FIREBASE_ADMIN_SDK_KEY=... (for server-side Firebase)
```

---

## Next Steps After All Tests Pass

1. Deploy to staging environment
2. Run full E2E tests with live Stripe test environment
3. Configure webhook endpoint on Stripe Dashboard (not localhost)
4. Switch to live Stripe keys and test with real payment
5. Monitor production logs and Firestore for enrollment records

# Stripe Dashboard Setup - Non-Technical Checklist

**Time to complete:** ~15 minutes  
**Prerequisites:** Stripe account (free tier is fine for testing)

---

## Part 1: Create or Confirm 6-Week Program Product

### Step 1: Log into Stripe Dashboard
- [ ] Go to https://dashboard.stripe.com
- [ ] Sign in with your account
- [ ] You should see "Test Mode" toggle in top right (make sure it's ON for now)

### Step 2: Navigate to Products
- [ ] In left sidebar, click **Products** (or go to https://dashboard.stripe.com/products)
- [ ] Look for existing product called "6-Week Program" or similar
- [ ] **If it exists, go to Part 2. If not, continue below.**

### Step 3: Create New Product (if needed)
- [ ] Click **+ Add Product** button (top right)
- [ ] Fill in form:
  - **Name:** `6-Week Program` (exact name)
  - **Description:** `A cohort-based 6-week journey to clarify purpose, build aligned systems, and expand through AI`
  - **Type:** Standard
- [ ] Click **+ Add Pricing**

### Step 4: Add Price to Product
- [ ] **Billing period:** One-time
- [ ] **Currency:** USD (or your currency)
- [ ] **Amount:** Enter price (e.g., 997.00 for $997)
- [ ] Click **Create price** button
- [ ] You'll see something like: `price_1Abc123XyZ456` - **COPY THIS** (you'll need it later)

### Step 5: Confirm Product is Live
- [ ] Product should show "6-Week Program" in Products list
- [ ] Click on it to open details
- [ ] You should see one price listed with the ID you just copied

**✅ Result:** You now have `STRIPE_PRICE_ID_6WEEK=price_1Abc123XyZ456`

---

## Part 2: Get Your API Keys (Secret Key)

### Step 1: Navigate to Developers → API Keys
- [ ] In left sidebar, click **Developers** → **API Keys** (or go to https://dashboard.stripe.com/apikeys)
- [ ] Make sure **Test Mode** is ON (toggle in top right)

### Step 2: Copy Test Secret Key
- [ ] Under "Standard keys" section, look for **Secret key**
- [ ] Click **Reveal** (or **Show test key**)
- [ ] You'll see something like: `sk_test_51Abc123XyZ456...`
- [ ] Click **Copy** button
- [ ] **SAVE THIS** - you'll need it for `.env.local`

### Step 3: Note Your Test Public Key (Optional)
- [ ] Under "Standard keys", also see **Publishable key** (starts with `pk_test_`)
- [ ] This is shown on the website frontend, it's safe to see publicly
- [ ] Keep it handy but you don't need to add it to env (Next.js handles it internally)

**✅ Result:** You now have `STRIPE_SECRET_KEY=sk_test_51Abc123XyZ456...`

---

## Part 3: Create Webhook Endpoint

### Step 1: Navigate to Webhooks
- [ ] In left sidebar, click **Developers** → **Webhooks** (or go to https://dashboard.stripe.com/webhooks)
- [ ] Make sure **Test Mode** is ON

### Step 2: Create New Endpoint
- [ ] Click **+ Add an Endpoint** button (right side)
- [ ] URL field: Enter your app URL
  - **For local testing:** `http://localhost:3000/api/stripe/webhook`
  - **For staging:** `https://yourstaging.domain.com/api/stripe/webhook`
  - **For production:** `https://yourdomain.com/api/stripe/webhook`
- [ ] Click **Select events** to choose which events to listen for

### Step 3: Select Required Event
- [ ] Check: **checkout.session.completed** (this is the only event we need)
- [ ] Click **Add events** button
- [ ] Click **Create endpoint** button

### Step 4: Copy Webhook Signing Secret
- [ ] You'll be taken to the endpoint details page
- [ ] Look for **Signing secret** field
- [ ] Click **Reveal** to show the secret
- [ ] You'll see something like: `whsec_1Abc123XyZ456...`
- [ ] Click **Copy** button
- [ ] **SAVE THIS** - you'll need it for `.env.local`

**✅ Result:** You now have `STRIPE_WEBHOOK_SECRET=whsec_1Abc123XyZ456...`

---

## Part 4: Test Mode vs. Live Mode

### Understanding Test Mode
- [ ] **Test Mode** (toggle ON in top right)
  - Use test card numbers (like `4242 4242 4242 4242`)
  - No real money charged
  - Perfect for development and testing
  - Keys start with `sk_test_`

### Understanding Live Mode
- [ ] **Live Mode** (toggle OFF in top right)
  - Uses real credit cards
  - REAL money is charged
  - Only turn this on when you're ready to accept actual payments
  - Keys start with `sk_live_`

### For Now (Development)
- [ ] **Keep Test Mode ON** while developing
- [ ] Use the `sk_test_` secret key you copied
- [ ] Use the `whsec_` signing secret you copied
- [ ] You'll switch to Live Mode later when deploying

---

## Summary: What You've Collected

By now, you should have these 4 values:

```
STRIPE_SECRET_KEY=sk_test_[your_test_secret_key]
STRIPE_WEBHOOK_SECRET=whsec_[your_webhook_secret]
STRIPE_PRICE_ID_6WEEK=price_[your_price_id]
NEXT_PUBLIC_APP_URL=http://localhost:3000  (for local dev)
```

---

## What's Next

1. **Create `.env.local` file** in your project root
2. **Add the 4 values** from above
3. **Restart dev server** (`npm run dev`)
4. **Test the payment flow** (see PAYMENT_GATING_TEST_CHECKLIST.md)

---

## Common Questions

**Q: Can I use test cards forever?**  
A: Yes, test mode never charges real money. Use it as long as you need before going live.

**Q: What card should I use for testing?**  
A: `4242 4242 4242 4242` (always works in test mode). Expiry and CVC can be anything.

**Q: What if I lose the webhook signing secret?**  
A: No problem, just go back to Webhooks → click the endpoint → Reveal and copy again. It doesn't change.

**Q: When should I switch to Live Mode?**  
A: Only after all testing is complete and you're ready to accept real payments in production.

**Q: Do I need to change the webhook URL?**  
A: Yes. For production, you'll need to:
1. Create a NEW webhook endpoint (keep test one for dev)
2. Use your production domain: `https://yourdomain.com/api/stripe/webhook`
3. Get a NEW signing secret (it's different for each endpoint)
4. Use the new secret in production environment

---

## Double-Check Checklist Before Moving Forward

- [ ] Product "6-Week Program" exists in Stripe
- [ ] Product has one price (you know the price ID)
- [ ] You're in Test Mode (not Live Mode)
- [ ] You have Test Secret Key (`sk_test_...`)
- [ ] You have Webhook Signing Secret (`whsec_...`)
- [ ] Webhook endpoint is created for `localhost:3000/api/stripe/webhook`
- [ ] You've collected all 4 environment variable values

**Ready to proceed?** → Go to ENV_CONFIGURATION.md and set up `.env.local`

# Stripe Production Readiness — Verification Checklist for Claude

Paste this checklist to Claude for a direct audit. Each item is phrased as a verification question. Claude should answer yes/no and provide evidence for each.

---

## 1) Environment Configuration (Production Only)
- Are the following environment variables present in Vercel Production (not just local/dev)?
  - STRIPE_SECRET_KEY (starts with sk_live_)
  - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (starts with pk_live_)
  - STRIPE_WEBHOOK_SECRET (starts with whsec_)
  - NEXT_PUBLIC_SITE_URL (set to the real production domain, https)
- Is the production deployment definitely using live keys, not sk_test or pk_test?
- Can you confirm which Stripe mode production is currently using (live vs test) based on the loaded env vars?

## 2) Price IDs & Products
- Are all Stripe price IDs stored in environment variables (not hardcoded in code)?
- Are the price IDs used in production LIVE price IDs, not test ones?
- Do these price IDs correctly map to the platform tiers?
  - Starter Pack
  - AI Blueprint
  - Deepen (subscription?)
  - Accelerator (one-time?)
- Does the checkout session always use the correct price ID based on the selected product/tier?

## 3) Checkout Session Creation
- Is /api/stripe/create-checkout-session working in production?
- Does it return a valid Checkout Session ID when called?
- Are success_url and cancel_url built using:
  - NEXT_PUBLIC_SITE_URL
  - https (not localhost)
- Are there any hardcoded references to:
  - localhost
  - 127.0.0.1
  - test URLs
  inside the checkout logic?

## 4) Metadata & User Linking
- When a Checkout Session is created, does it include one of the following:
  - userId
  - email
  - tier/product name
  in metadata?
- After payment completes, can the system reliably identify which user made the purchase?

## 5) Webhook Configuration (Critical)
- Is there a production webhook endpoint deployed at:
  - /api/stripe/webhook ?
- Is that endpoint registered in the Stripe LIVE Dashboard?
- Is the webhook using the correct live secret (whsec_...) from env vars?
- Are these events handled:
  - checkout.session.completed
  - invoice.payment_succeeded (if subscriptions exist)
  - customer.subscription.updated (if subscriptions exist)
  - customer.subscription.deleted (if subscriptions exist)

## 6) Entitlement Update Logic
- When checkout.session.completed fires:
  - Does the webhook update the user’s tier in Firestore?
- After payment, does the user gain access immediately to:
  - gated pages
  - dashboard features
  - integration content
- Is the x-user-tier header updated correctly after purchase?

## 7) Real End-to-End Flow Test
- From a brand new user:
  - Can they sign up?
  - Click upgrade?
  - Reach Stripe checkout?
  - Complete payment?
  - Return to the site?
- After returning from Stripe:
  - Is the user upgraded automatically?
  - Do they see the correct content unlocked?

## 8) Failure Safety
- If the webhook fails temporarily:
  - Is there any retry logic?
  - Will Stripe resend events?
- Are webhook errors visible in:
  - Vercel logs?
  - Stripe webhook logs?

## 9) Observability
- Can we confirm in Stripe dashboard:
  - Checkout sessions are being created
  - Payments appear
  - Webhooks are marked “Delivered”

## 10) Final Risk Check
- Is there anything in the current Stripe implementation that could:
  - Prevent checkout from opening?
  - Prevent payments from completing?
  - Prevent tier upgrades after payment?
- If yes, list them clearly.

---

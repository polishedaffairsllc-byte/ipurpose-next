# Stripe Payment Gating Implementation

## Environment Variables Required

Add these to `.env.local`:

```
# Stripe Configuration (CRITICAL - Payment gating won't work without these)
STRIPE_SECRET_KEY=sk_live_xxxxx_or_sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRICE_ID_6WEEK=price_xxxxx

# App URL for Stripe redirect
NEXT_PUBLIC_APP_URL=https://yourdomain.com
# For local dev: http://localhost:3000
```

## How It Works

### Public User Flow
1. User browses `/program` (public)
2. User clicks "Enroll" button
3. `/api/stripe/create-checkout-session` is called
4. Redirects to Stripe Checkout
5. After payment: Redirects to `/enroll/create-account?session_id={SESSION_ID}`
6. Session is verified server-side
7. User creates account with entitlement

### Platform Access
1. User must be authenticated (Firebase)
2. User must have `users/{uid}.entitlement.status === "active"`
3. All protected routes check both conditions
4. Non-entitled users redirected to `/enrollment-required`

## Key Files

- `/app/api/stripe/create-checkout-session/route.ts` - Creates Stripe checkout
- `/app/api/stripe/webhook/verify-session/route.ts` - Verifies paid session
- `/app/api/stripe/webhook/route.ts` - Webhook handler for checkout.session.completed
- `/app/api/auth/create-user-with-entitlement/route.ts` - Creates user + entitlement
- `/app/enroll/create-account/page.tsx` - Post-payment signup page
- `/app/signup/page.tsx` - Now shows "enrollment required" (no public signup)
- `/app/enrollment-required/page.tsx` - Fallback for non-entitled users
- `/lib/entitlementCheck.ts` - Utility to verify entitlements

## Testing

### Local Testing with Stripe Test Keys
1. Set `STRIPE_SECRET_KEY=sk_test_...`
2. Set `STRIPE_WEBHOOK_SECRET=whsec_test_...`
3. Set `STRIPE_PRICE_ID_6WEEK=price_...` (from Stripe dashboard)
4. Use Stripe test card: 4242 4242 4242 4242

### Webhook Testing (Local)
Use Stripe CLI to forward webhook events:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Important Notes

- No public signup form is accessible
- All account creation requires prior payment verification
- Entitlement is source of truth for platform access
- Webhook is required to write enrollment records
- Session verification happens server-side only
- Never trust client for payment status

# Environment Configuration for Stripe Payment Gating

## File Locations

### Development Environment
**File:** `.env.local` (in project root)
- **Location:** `/Users/renita.hamilton/Desktop/ipurpose-next/.env.local`
- **Visibility:** LOCAL ONLY - Never commit to git
- **Used by:** `npm run dev` (local development)

### Production Environment
**File:** `.env.production` (in project root)
- **Location:** `/Users/renita.hamilton/Desktop/ipurpose-next/.env.production`
- **Visibility:** PRODUCTION ONLY - Set via deployment platform (Vercel/deployment tool)
- **Used by:** Production build and runtime

---

## Required Environment Variables

### 1. STRIPE_SECRET_KEY
**Purpose:** Server-side authentication for Stripe API calls  
**Type:** Secret (never expose in client code)  
**Value Format:** Starts with `sk_test_` (development) or `sk_live_` (production)  
**Where to get:** Stripe Dashboard → Developers → API Keys → Secret key  

**Configuration:**
```env
# .env.local (test mode)
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_SECRET_KEY_HERE

# .env.production (live mode)
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE
```

**Used by:** All Stripe API route handlers
- `app/api/stripe/create-checkout-session/route.ts` - Line 4
- `app/api/stripe/webhook/verify-session/route.ts` - Line 4
- `app/api/stripe/webhook/route.ts` - Line 5

**Validation:** Code checks `if (!process.env.STRIPE_SECRET_KEY)` and returns error if missing

---

### 2. STRIPE_WEBHOOK_SECRET
**Purpose:** Server-side webhook signature verification  
**Type:** Secret (never expose in client code)  
**Value Format:** Starts with `whsec_`  
**Where to get:** Stripe Dashboard → Developers → Webhooks → Click endpoint → Signing secret  

**Configuration:**
```env
# .env.local (test webhook)
STRIPE_WEBHOOK_SECRET=whsec_YOUR_TEST_WEBHOOK_SECRET_HERE

# .env.production (live webhook)
STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET_HERE
```

**Used by:** Webhook signature verification
- `app/api/stripe/webhook/route.ts` - Line 24

**Validation:** Code rejects requests with invalid signatures (400 status)

---

### 3. STRIPE_PRICE_ID_6WEEK
**Purpose:** Product price identifier for 6-Week Program checkout  
**Type:** Semi-public (safe to log for debugging)  
**Value Format:** Starts with `price_`  
**Where to get:** Stripe Dashboard → Products → 6-Week Program → Pricing → Click price to copy ID  

**Configuration:**
```env
# .env.local (test price)
STRIPE_PRICE_ID_6WEEK=price_YOUR_TEST_PRICE_ID_HERE

# .env.production (live price)
STRIPE_PRICE_ID_6WEEK=price_YOUR_LIVE_PRICE_ID_HERE
```

**Used by:**
- `app/api/stripe/create-checkout-session/route.ts` - Lines 15, 31 (checkout line item)
- `app/api/stripe/webhook/verify-session/route.ts` - Lines 47, 49 (line item validation)

**Validation:** Code checks `if (!process.env.STRIPE_PRICE_ID_6WEEK)` and returns error if missing during checkout

---

### 4. NEXT_PUBLIC_APP_URL
**Purpose:** Application base URL for Stripe redirect URLs  
**Type:** Public (can be in client code, prefixed with `NEXT_PUBLIC_`)  
**Value Format:** Full URL with protocol (http/https)  
**Where to get:** Your deployment domain  

**Configuration:**
```env
# .env.local (local development)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# .env.production (production domain)
NEXT_PUBLIC_APP_URL=https://ipurpose.com
```

**Used by:**
- `app/api/stripe/create-checkout-session/route.ts` - Line 25 (Stripe redirect URLs)
  - Success: `${appUrl}/enroll/create-account?session_id=...`
  - Cancel: `${appUrl}/program`

**Validation:** Code defaults to `http://localhost:3000` if not set (safe for dev)

---

## Configuration Checklist

### Development Setup (.env.local)
```bash
# Step 1: Create .env.local file in project root
touch /Users/renita.hamilton/Desktop/ipurpose-next/.env.local

# Step 2: Add all 4 variables (get values from Stripe Dashboard)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_6WEEK=price_...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Step 3: Verify .env.local is in .gitignore (it is)
grep ".env.local" /Users/renita.hamilton/Desktop/ipurpose-next/.gitignore

# Step 4: Start dev server
npm run dev

# Step 5: Test by visiting http://localhost:3000/program and clicking Enroll
```

### Production Setup (.env.production)
```bash
# Option A: Using Vercel (recommended for Next.js)
# 1. Go to Vercel Dashboard → Project → Settings → Environment Variables
# 2. Add 4 variables (use LIVE Stripe keys)
# 3. Redeploy project
# 4. Verify production instance works

# Option B: Using manual deployment
# 1. SSH to production server
# 2. Create .env.production with LIVE Stripe keys
# 3. Restart application server
# 4. Verify production instance works
```

---

## Security Rules

### DO ✅
- [ ] Use `process.env.VARIABLE_NAME` for all Stripe config
- [ ] Prefix public variables with `NEXT_PUBLIC_` 
- [ ] Keep secret keys in `.env.local` (development)
- [ ] Keep secret keys in deployment platform (production)
- [ ] Rotate webhook secrets regularly
- [ ] Use test keys first, then live keys

### DO NOT ❌
- [ ] Never hardcode `sk_test_`, `sk_live_`, or `whsec_` values
- [ ] Never commit `.env.local` to git
- [ ] Never expose `STRIPE_SECRET_KEY` or `STRIPE_WEBHOOK_SECRET` in logs
- [ ] Never share credentials via Slack/email
- [ ] Never use same keys across environments
- [ ] Never commit production keys anywhere

---

## Verification Commands

### Verify env vars are loaded
```bash
# Start dev server
npm run dev

# In another terminal, check if env is loaded (look for no errors)
curl http://localhost:3000/api/stripe/create-checkout-session \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{}' 2>&1 | grep -i "error"

# Expected: Should NOT show "not configured" error
```

### Verify no hardcoded keys in code
```bash
# Search for hardcoded test keys (should find NONE)
grep -r "sk_test_" /Users/renita.hamilton/Desktop/ipurpose-next/app --include="*.ts" --include="*.tsx"
grep -r "sk_live_" /Users/renita.hamilton/Desktop/ipurpose-next/app --include="*.ts" --include="*.tsx"
grep -r "whsec_" /Users/renita.hamilton/Desktop/ipurpose-next/app --include="*.ts" --include="*.tsx"
grep -r "price_" /Users/renita.hamilton/Desktop/ipurpose-next/app --include="*.ts" --include="*.tsx" | grep -v process.env

# All results should be empty (no hardcoded values)
```

### Verify .env.local is ignored
```bash
# Check .gitignore
cat /Users/renita.hamilton/Desktop/ipurpose-next/.gitignore | grep -E "\.env|env.local"

# Should output: .env.local
```

---

## Troubleshooting

### "STRIPE_SECRET_KEY not configured"
**Cause:** Environment variable not set in `.env.local`  
**Solution:**
1. Create/edit `.env.local`
2. Add: `STRIPE_SECRET_KEY=sk_test_YOUR_KEY`
3. Restart dev server: `npm run dev`
4. Verify Stripe Dashboard has this key

### "STRIPE_WEBHOOK_SECRET not configured"
**Cause:** Environment variable not set in `.env.local`  
**Solution:**
1. Create/edit `.env.local`
2. Add: `STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET`
3. Restart dev server
4. Verify Stripe Dashboard webhook endpoint matches

### "STRIPE_PRICE_ID_6WEEK not configured"
**Cause:** Environment variable not set in `.env.local`  
**Solution:**
1. Create/edit `.env.local`
2. Add: `STRIPE_PRICE_ID_6WEEK=price_YOUR_PRICE`
3. Restart dev server
4. Verify price exists in Stripe Dashboard

### Checkout redirects to wrong URL
**Cause:** `NEXT_PUBLIC_APP_URL` not set or incorrect  
**Solution:**
1. Edit `.env.local`
2. Verify: `NEXT_PUBLIC_APP_URL=http://localhost:3000` (dev) or your domain (prod)
3. Restart dev server
4. Test checkout flow again

---

## Reference: Where Variables Are Used

| Variable | File | Line | Purpose |
|----------|------|------|---------|
| `STRIPE_SECRET_KEY` | `create-checkout-session/route.ts` | 4 | Initialize Stripe client |
| `STRIPE_SECRET_KEY` | `create-checkout-session/route.ts` | 8 | Validation check |
| `STRIPE_SECRET_KEY` | `webhook/verify-session/route.ts` | 4 | Initialize Stripe client |
| `STRIPE_SECRET_KEY` | `webhook/verify-session/route.ts` | 18 | Validation check |
| `STRIPE_SECRET_KEY` | `webhook/route.ts` | 5 | Initialize Stripe client |
| `STRIPE_WEBHOOK_SECRET` | `webhook/route.ts` | 11 | Validation check |
| `STRIPE_WEBHOOK_SECRET` | `webhook/route.ts` | 24 | Signature verification |
| `STRIPE_PRICE_ID_6WEEK` | `create-checkout-session/route.ts` | 15 | Validation check |
| `STRIPE_PRICE_ID_6WEEK` | `create-checkout-session/route.ts` | 31 | Add to checkout line items |
| `STRIPE_PRICE_ID_6WEEK` | `webhook/verify-session/route.ts` | 47 | Validation check |
| `STRIPE_PRICE_ID_6WEEK` | `webhook/verify-session/route.ts` | 49 | Verify line items |
| `NEXT_PUBLIC_APP_URL` | `create-checkout-session/route.ts` | 25 | Build redirect URLs |

---

## Next Steps

1. **Get credentials from Stripe Dashboard** (5 min)
2. **Create `.env.local` with all 4 variables** (2 min)
3. **Restart dev server** (1 min)
4. **Test checkout flow** (5 min)
5. **Proceed to Stripe Dashboard setup checklist** (see next doc)

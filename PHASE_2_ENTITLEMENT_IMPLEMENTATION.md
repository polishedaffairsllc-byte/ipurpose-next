# Phase 2: Entitlement Gating Implementation Guide

**Date:** January 28, 2026  
**Status:** ✅ FOUNDATION COMPLETE (Phase 2A)  
**Scope:** Tier-based access control for all gated routes & APIs

---

## 🔐 Entitlement Tiers

Three tiers enforced throughout middleware, UI, and APIs:

```
FREE
├─ Labs (Identity, Meaning, Agency)  ✅
├─ Orientation                        ✅
└─ Public pages                        ✅

BASIC_PAID ($19/month)
├─ Everything in FREE                 ✅
├─ Integration & Embodiment            ✅
├─ AI Tools & APIs                    ✅
├─ Community (read-only initially)    ✅
└─ Advanced Tools                      ❌ (Deepening only)

DEEPENING ($99/month)
└─ Everything                          ✅
   ├─ Soul Reflection Wing
   ├─ Systems, Insights, Creation, Interpretation
   └─ All premium features
```

---

## 📍 Locked Decisions (Phase 2)

### Decision #7: Community – PAID-ONLY ✅
- **Routes Gated:** `/community`, `/community/post/[id]`
- **APIs Gated:** `/api/community/*`
- **Tier Required:** `BASIC_PAID`
- **Public Fallback:** `/ethics` (values & preview)

### Decision #8: Soul – DEEPENING TIER ✅
- **Routes Gated:** `/soul`, `/soul/chat`
- **APIs Gated:** `/api/soul/*`
- **Tier Required:** `DEEPENING`
- **Redirect:** `/enrollment-required`

### Decision #9: Advanced Tools – DEEPENING TIER ✅
- **Routes Gated:** `/systems`, `/systems/chat`, `/insights`, `/insights/chat`, `/creation`, `/interpretation`
- **Tier Required:** `DEEPENING`
- **Classification:** "Advanced Tools – Deepening Tier Continuity Layer"

### Decision #10: AI Tools – ALL PAID TIERS ✅
- **Routes Gated:** `/ai-tools`, `/ai-tools/chat`
- **APIs Gated:** `/api/ai/*`, `/api/ai/stream`
- **Tier Required:** `BASIC_PAID`
- **Classification:** "Core Paid Intelligence Layer"

### Decision #11: Labs – FREE (No Gating) ✅
- **Routes:** `/labs`, `/labs/identity`, `/labs/meaning`, `/labs/agency`
- **Tier Required:** None (FREE tier)
- **Auth Required:** YES
- **Classification:** "Core Journey Layer – Free Access"

### Decision #12: Integration – MONETIZATION BRIDGE ✅
- **Routes Gated:** `/integration`
- **APIs Gated:** `/api/integration/*`
- **Tier Required:** `BASIC_PAID`
- **Conversion Logic:** Labs (free) → Integration (paid) forces upgrade decision
- **Classification:** "Monetization Bridge Layer"

---

## 🛠️ Implementation Components

### 1. Entitlement Utility (`app/lib/auth/entitlements.ts`)

Shared helpers for route/API gating:

```typescript
import { 
  getRequiredTier,    // Get required tier for a route
  canAccessRoute,     // Check if user can access route
  canAccessAPI,       // Check if user can access API
  canAccessTier,      // Tier hierarchy check
  getTierFromUser     // Extract tier from user object
} from '@/app/lib/auth/entitlements';

// Usage:
const required = getRequiredTier('/community');  // 'BASIC_PAID'
const allowed = canAccessTier('BASIC_PAID', 'BASIC_PAID');  // true
```

### 2. Middleware Gating (`middleware.ts`)

Enforces tier gating at request level:

```typescript
// Gated routes in middleware:
const GATED_ROUTES = {
  '/community': 'BASIC_PAID',
  '/soul': 'DEEPENING',
  '/systems': 'DEEPENING',
  '/ai-tools': 'BASIC_PAID',
  '/integration': 'BASIC_PAID',
  // ...
};

// Redirects:
// - No session → /login
// - Session but tier insufficient → /enrollment-required
// - Authorized → NextResponse.next()
```

### 3. API Entitlement Helper (`lib/apiEntitlementHelper.ts`)

Wrapper functions for API route protection:

```typescript
import { 
  requireBasicPaid,
  requireDeepening,
  requirePaidTier
} from '@/lib/apiEntitlementHelper';

// Usage in API routes:
export async function POST(request: Request) {
  const tierCheck = await requireBasicPaid();
  if (tierCheck.error) return tierCheck.error;  // 403 Forbidden
  
  const { uid, tier } = tierCheck;
  // Proceed with request
}
```

### 4. Entitlement Check (`lib/entitlementCheck.ts`)

Low-level tier fetching from Firestore:

```typescript
import { 
  checkEntitlement,
  canAccessTier,
  type EntitlementTier
} from '@/lib/entitlementCheck';

const { uid, tier, isEntitled } = await checkEntitlement();
```

### 5. Enrollment Required Page (`app/enrollment-required/page.tsx`)

Tier comparison & upgrade page:

- Shows which tier is required
- Displays all three tiers (Free, Pro, Premium)
- Links to `/program` for upgrade
- Auto-detects intended route from referrer

---

## 📋 Implementation Checklist (Phase 2A Complete)

### ✅ Infrastructure
- [x] Create `EntitlementTier` type
- [x] Create `entitlements.ts` utility module
- [x] Create `entitlementCheck.ts` with Firestore queries
- [x] Create `apiEntitlementHelper.ts` with API wrappers
- [x] Update `middleware.ts` with gating logic
- [x] Update `enrollment-required/page.tsx` with tier info

### ✅ Documentation
- [x] Lock Decisions #7-12 in `SYSTEM_INVENTORY.md`
- [x] Create this implementation guide

### ⏳ Phase 2B (Routes & APIs)
- [ ] Gate community API routes (`/api/community/*`)
  - [x] `/api/community/posts` (GET/POST)
  - [ ] `/api/community/posts/[id]/*`
  - [ ] `/api/community/spaces/*`
- [ ] Gate AI API routes (`/api/ai/*`)
- [ ] Gate integration API routes (`/api/integration/*`)
- [ ] Test all gating with curl/Postman

### ⏳ Phase 2C (User Tier Assignment)
- [ ] Add `entitlementTier` field to Firestore user schema
- [ ] Create auth flow to set tier after Stripe purchase
- [ ] Update user profile UI to show tier
- [ ] Create admin tool to assign/revoke tiers

---

## 🧪 Testing Tier Gating

### Manual Test: Free User
```bash
# Free user can access labs
curl -i http://localhost:3000/labs

# Free user CANNOT access community
curl -i -H "Cookie: FirebaseSession=<free_session>" \
  http://localhost:3000/community
# Expected: 302 redirect to /enrollment-required
```

### Manual Test: BASIC_PAID User
```bash
# BASIC_PAID can access community
curl -i -H "Cookie: FirebaseSession=<paid_session>" \
  http://localhost:3000/community
# Expected: 200 OK

# BASIC_PAID CANNOT access soul (requires DEEPENING)
curl -i -H "Cookie: FirebaseSession=<paid_session>" \
  http://localhost:3000/soul
# Expected: 302 redirect to /enrollment-required
```

### Manual Test: API Gating
```bash
# Free user cannot POST to community
curl -X POST http://localhost:3000/api/community/posts \
  -H "Cookie: FirebaseSession=<free_session>" \
  -H "Content-Type: application/json" \
  -d '{"body": "test"}'
# Expected: 403 Forbidden (not enough tier)

# BASIC_PAID user CAN POST
curl -X POST http://localhost:3000/api/community/posts \
  -H "Cookie: FirebaseSession=<paid_session>" \
  -H "Content-Type: application/json" \
  -d '{"body": "test"}'
# Expected: 201 Created
```

---

## 🔄 User Tier Assignment Workflow

**Current Status:** Placeholder implementation  
**TODO:** Integrate with Stripe after purchase

### Step 1: Purchase Completes (Stripe Webhook)
```typescript
// app/api/auth/stripe-webhook/route.ts (Phase 2C)
if (event.type === 'checkout.session.completed') {
  const uid = metadata.userId;
  const tier = metadata.tier;  // 'BASIC_PAID' or 'DEEPENING'
  
  // Update user in Firestore
  await firebaseAdmin
    .firestore()
    .collection('users')
    .doc(uid)
    .set({
      entitlementTier: tier,
      entitlement: {
        status: 'active',
        purchasedAt: new Date(),
        tier: tier
      }
    }, { merge: true });
}
```

### Step 2: User Visits /enrollment-required
```typescript
// app/enrollment-required/page.tsx (already implemented)
// Shows tier comparison and links to /program for upgrade
// After user pays, they redirect back with new tier
```

### Step 3: Middleware Checks New Tier
```typescript
// middleware.ts checks user's entitlementTier
// Next visit to /community works now that user has BASIC_PAID
```

---

## 📝 Firestore Schema Update (Phase 2C)

Add to user document:

```json
{
  "uid": "user123",
  "email": "user@example.com",
  "entitlementTier": "BASIC_PAID",  // NEW: FREE | BASIC_PAID | DEEPENING
  "entitlement": {                   // Existing, enhanced
    "status": "active",              // active | expired | canceled
    "purchasedAt": "2026-01-28T...",
    "expiresAt": "2026-02-28T...",
    "tier": "BASIC_PAID",            // Redundant with entitlementTier
    "stripeSubscriptionId": "sub_..."
  }
}
```

---

## 🚀 Next Steps (Phase 2B)

1. **Gate remaining API routes** (community, AI, integration)
2. **Test all tier redirects** against local dev server
3. **Test production crawlers** with tier-aware session
4. **Integrate with Stripe** for tier assignment on purchase
5. **Add tier display** to user profile/settings
6. **Create admin panel** for tier management

---

## 📊 Gating Summary

| Route/API | Free | Basic_Paid | Deepening |
|-----------|------|-----------|-----------|
| `/labs` | ✅ | ✅ | ✅ |
| `/integration` | ❌ | ✅ | ✅ |
| `/community` | ❌ | ✅ | ✅ |
| `/ai-tools` | ❌ | ✅ | ✅ |
| `/soul` | ❌ | ❌ | ✅ |
| `/systems`, `/insights`, `/creation`, `/interpretation` | ❌ | ❌ | ✅ |
| `/api/community/*` | ❌ | ✅ | ✅ |
| `/api/ai/*` | ❌ | ✅ | ✅ |
| `/api/integration/*` | ❌ | ✅ | ✅ |

---

**Status:** Phase 2A foundation complete ✅  
**Next Phase:** Phase 2B (API route gating)  
**Timeline:** 2 weeks to completion

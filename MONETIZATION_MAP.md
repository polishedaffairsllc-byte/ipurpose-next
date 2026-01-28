# Monetization Map — iPurpose Ecosystem Value Tiers

**Generated:** January 28, 2026  
**Focus:** Define which features are available at each economic tier  
**Scope:** No implementation (planning document only)  
**Pricing Decision Status:** FUTURE (outlined but not finalized)

---

## Overview

This document maps the iPurpose ecosystem into **economic tiers** based on value delivery:
- **Free Tier** — Awareness + assessment tools
- **Accelerator (Paid Entry)** — Core transformation labs + community
- **Post-Accelerator Layers** — Advanced tools, certification paths
- **Founder/Governance Tier** — Leadership roles (future)

**Critical Note:** This is a **blueprint for future monetization**. No paywall implementation has been coded. All features listed are currently accessible (no gating by tier).

---

## CURRENT STATE (Jan 2026)

**Status:** Freemium model (all features accessible post-signup)

**Current Access:**
- All public entry pages are free
- All labs, community, tools are gated only by login (not tier)
- No pricing tier enforcement in code
- Stripe integration built but not actively enforcing paywalls

**Next Step:** This document describes how to map features to tiers for future implementation.

---

## PROPOSED TIER STRUCTURE

### TIER 1: FREE / AWARENESS TIER

**Goal:** Convert prospects to signed-up users

**Cost:** $0

**What's Included:**

#### Public Entry (No signup required)
- `/` — Homepage
- `/discover` — Discovery hub
- `/about` — Mission/trust
- `/program` — Program overview
- `/ai-blueprint` — AI philosophy
- `/ethics` — Community principles
- `/clarity-check` — Lead capture quiz
- `/starter-pack` — Free downloadable resource (PDF, affirmations)
- `/info-session` — Webinar signup
- `/contact` — Contact form

**Total Value:** Education + Assessment + Lead magnet

**Conversion Point:** "Ready to transform?" → `/signup`

---

### TIER 2: ACCELERATOR (Paid, 6-week focused)

**Goal:** Core transformation (Identity → Meaning → Agency → Integration)

**Cost:** $297–$597 (to be determined by product)

**Duration:** 6 weeks (typical), self-paced (flexible)

**What's Included:**

#### Core Journey (gated by auth + tier)
- `/onboarding` — Personalized setup
- `/orientation` — System intro + journey map
- `/labs/identity` — Lab 1: Self-discovery
- `/labs/meaning` — Lab 2: Impact clarity
- `/labs/agency` — Lab 3: Action planning
- `/labs` — Hub + progress tracking
- `/integration` — Consolidation step
- `/dashboard` — Personal progress hub

**Value:** Structured transformation program

#### Community Access (gated by auth + tier)
- `/community` — Post feed + peer reflection
- `/community/post/[id]` — Thread discussions
- Moderated by iPurpose team
- Community guidelines enforced
- Rate limiting (prevent spam)

**Value:** Peer connection + accountability

#### Basic Tools (gated by auth + tier)
- `/ai-tools/chat` — AI coaching (basic mode, limited queries)
- `/affirmation/today` — Daily affirmation

**Value:** AI-assisted reflection

#### Account Features
- `/profile` — Personal profile (visible in community)
- `/settings` — Preferences
- `/api/preferences` — Store learning style, interests

**Value:** Personalization + identity in community

#### Support
- Community guidelines + moderation
- FAQ + help documentation
- Email support (basic tier)

**Stripe Integration Points:**
- Signup → `/enroll/create-account` triggers checkout
- Checkout → Stripe session creation (`/api/stripe/create-checkout-session`)
- Webhook → Firestore entitlement record (`/api/stripe/webhook`)
- Session verification → Enforce access to gated routes

**Completion Certificate:** Optional (not yet implemented)

**Total Value:** Complete transformation program + peer community + AI coaching

---

### TIER 3: POST-ACCELERATOR DEEPENING (Optional, ongoing)

**Goal:** Continued development beyond core program

**Cost:** $49–$149/month (subscription model, optional)

**What's Included (on top of Accelerator or standalone):**

#### Advanced Tools Suite
- `/soul` + `/soul/chat` — Archetypal reflection + chatbot
- `/systems` + `/systems/chat` — Systems thinking tool
- `/insights` + `/insights/chat` — Personalized analytics
- `/creation` — Guided creative expression
- `/interpretation` — Deep meaning-making

**Value:** Specialized exploration

#### AI Enhancement
- `/ai-tools/chat` — **Unlimited** queries (vs. limited in Accelerator)
- Streaming responses (`/api/gpt/stream`)
- Context-aware coaching
- API: `/api/gpt`, `/api/ai`

**Value:** Deeper AI partnership

#### Community Enhancement
- Accelerated community participation
- Early access to community features
- Option to become community guide/moderator
- Exclusive reflection prompts

**Value:** Deepened social fabric

#### Continued Support
- 1:1 coaching option (not in MVP)
- Priority email support
- Monthly group calls (future)

**Stripe Implementation:**
- Separate `/api/stripe/create-checkout-session` for recurring billing
- Subscription management (`/api/stripe/webhook` handles recurring charges)
- Tier upgrade path: Accelerator → Deepening (prorated)

**Total Value:** Unlimited tools + deepened AI + community leadership

---

### TIER 4: CERTIFICATION PATH (Advanced, future)

**Goal:** Professional recognition + practitioner credentials

**Cost:** $1,997–$2,997 (one-time or installment)

**Requirements:**
- Complete Accelerator
- 3 months post-Accelerator engagement
- Written reflection assignments
- Peer review participation
- Ethics agreement

**What's Included:**
- Certification curriculum (new content, not yet created)
- 1:1 mentor pairing (future)
- Certification exam
- Digital credential (badge + PDF)
- Alumni network access
- Position on iPurpose practitioner directory

**Use Case:** Life coaches, therapists, educators wanting to integrate iPurpose framework into their practice

**Stripe Implementation:**
- Separate product in Stripe
- Milestone-based billing (onboarding → curriculum → exam)
- Conditional gating in app: requires Accelerator completion status

---

### TIER 5: FOUNDER / GOVERNANCE LAYER (Visionary, far future)

**Goal:** Leadership + co-creation in iPurpose evolution

**Cost:** Negotiable (equity, revenue share, or $XXXX)

**What's Included:**
- All previous tier features
- Board/advisory participation
- Input on feature roadmap
- Revenue sharing (possible)
- Co-ownership structure (future vision)

**Use Case:** Co-founders, strategic partners, deep community leaders

**Stripe Implementation:** Likely custom contracts, not standard tier

**Note:** This tier is visionary and not part of MVP monetization. Included for complete picture.

---

## FEATURE MAPPING BY TIER

### Comprehensive Feature Table

| Feature | Free | Accelerator | Deepening | Certification | Founder |
|---------|------|-------------|-----------|---------------|---------|
| **Public Entry** | ✅ | ✅ | ✅ | ✅ | ✅ |
| Clarity Check | ✅ | ✅ | ✅ | ✅ | ✅ |
| Starter Pack | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Labs (Core)** | ❌ | ✅ | ✅ | ✅ | ✅ |
| Identity Lab | ❌ | ✅ | ✅ | ✅ | ✅ |
| Meaning Lab | ❌ | ✅ | ✅ | ✅ | ✅ |
| Agency Lab | ❌ | ✅ | ✅ | ✅ | ✅ |
| Integration | ❌ | ✅ | ✅ | ✅ | ✅ |
| Dashboard | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Community** | ❌ | ✅ | ✅ | ✅ | ✅ |
| Post Feed | ❌ | ✅ | ✅ | ✅ | ✅ |
| Create Posts | ❌ | ✅ | ✅ | ✅ | ✅ |
| Comments | ❌ | ✅ | ✅ | ✅ | ✅ |
| Community Guide Role | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Tools** | — | — | — | — | — |
| AI Chat (basic, limited) | ❌ | ✅ | — | — | — |
| AI Chat (unlimited) | ❌ | ❌ | ✅ | ✅ | ✅ |
| Soul Tool | ❌ | ❌ | ✅ | ✅ | ✅ |
| Systems Tool | ❌ | ❌ | ✅ | ✅ | ✅ |
| Insights Tool | ❌ | ❌ | ✅ | ✅ | ✅ |
| Creation Tool | ❌ | ❌ | ✅ | ✅ | ✅ |
| Interpretation Tool | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Affirmations** | ❌ | ✅ | ✅ | ✅ | ✅ |
| Daily Affirmation | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Support** | ❌ | ✅ | ✅ | ✅ | ✅ |
| Community Help | ❌ | ✅ | ✅ | ✅ | ✅ |
| Email Support (basic) | ❌ | ✅ | ✅ | ✅ | ✅ |
| Email Support (priority) | ❌ | ❌ | ✅ | ✅ | ✅ |
| 1:1 Coaching | ❌ | ❌ | ⏳ | ✅ | ✅ |
| **Certification** | — | — | — | — | — |
| Certification Curriculum | ❌ | ❌ | ❌ | ✅ | ✅ |
| Certification Exam | ❌ | ❌ | ❌ | ✅ | ✅ |
| Digital Credential | ❌ | ❌ | ❌ | ✅ | ✅ |
| Practitioner Directory | ❌ | ❌ | ❌ | ✅ | ✅ |
| Alumni Network | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Governance** | — | — | — | — | — |
| Board Participation | ❌ | ❌ | ❌ | ❌ | ✅ |
| Roadmap Input | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## IMPLEMENTATION ROADMAP

### MVP (Q2 2026): Accelerator Tier Only
- Free public entry works as-is
- Accelerator pricing + Stripe integration
- All labs + community + basic AI
- No tier enforcement (all authenticated users see everything)
- Goal: Prove SaaS model with single paid tier

### Phase 2 (Q3 2026): Tier Gating
- Implement feature flags by entitlement tier
- Free users see only public pages
- Deepening tier available as upgrade
- API endpoints check tier before returning data

### Phase 3 (Q4 2026): Deepening Tools
- Advanced tools (soul, systems, insights) behind Deepening tier
- Unlimited AI queries behind Deepening
- Community leadership roles behind Deepening

### Phase 4 (2027): Certification
- Certification pathway
- Custom curriculum + exam
- Credential management

### Phase 5+ (2027+): Founder Tier
- Governance structure (visionary)

---

## STRIPE INTEGRATION POINTS

### Current Stripe Setup (exists but unused)

**Routes:**
- `POST /api/stripe/create-checkout-session` — Create checkout
- `POST /api/stripe/webhook` — Handle Stripe events
- `POST /api/stripe/webhook/verify-session` — Verify payment
- `GET /api/stripe/check-config` — Health check

**Entitlement Creation:**
- `POST /api/auth/create-user-with-entitlement` — Create user + assign tier after payment

**Webhook Handler Flow:**
```
1. User initiates payment
2. Stripe creates session → /api/stripe/create-checkout-session
3. User completes payment in Stripe Checkout
4. Stripe sends webhook → /api/stripe/webhook
5. Webhook creates entitlement record in Firestore
6. /api/stripe/webhook/verify-session confirms
7. User redirected to app, sees new tier unlocked
```

### Implementation for Phase 2: Tier Gating

**New Code Needed:**
- Middleware check: `GET /api/entitlements/{userId}` → returns current tier
- Route guards: Check tier before rendering gated pages
- API guards: Check tier before returning data
- Feature flags: Hide UI elements based on tier

**Existing Code to Leverage:**
- `lib/firebaseAdmin.ts` — admin SDK (check entitlements)
- `lib/entitlementCheck.ts` — existing entitlement validation
- Firestore schema (already has `user_tiers` or similar)

---

## REVENUE MODEL PROJECTION (Illustrative)

### Pricing Strategy (Hypothetical)

```
Free Tier:
  Cost: $0/month
  Goal: Lead magnet, awareness

Accelerator Tier:
  Cost: $297 one-time
  Estimated duration: 6 weeks
  Annual revenue per user: ~$250 (if 2 cohorts/year repeat)

Deepening Tier:
  Cost: $99/month (or $999/year)
  Estimated adoption: 30% of Accelerator completers
  Annual revenue per user: ~$1,200

Certification:
  Cost: $2,497 one-time
  Estimated adoption: 5% of Accelerator completers
  Annual revenue per user: ~$125

Blended ARPU (Annual Revenue Per User):
  ~$350–$500 depending on tier mix
  (assumes freemium → 30% convert to paid, 30% of paid upgrade to deepening)
```

**Note:** Pricing not finalized; model for illustration only.

---

## CUSTOMER JOURNEY BY TIER

### Free → Accelerator Journey
```
Visit homepage
  ↓
Take clarity check
  ↓
Download starter pack (email capture)
  ↓
Sales email: "Ready to go deeper?"
  ↓
Click → /signup → /enroll/create-account
  ↓
Payment in Stripe Checkout
  ↓
Entitlement created
  ↓
Dashboard shows: "Welcome to Accelerator! Start with Orientation."
  ↓
Begin labs → 6-week journey
```

### Accelerator → Deepening Journey
```
Complete integration step
  ↓
Dashboard shows: "Ready to go deeper? Unlock unlimited tools."
  ↓
CTA: "Upgrade to Deepening" → /api/stripe/create-checkout-session (upgrade)
  ↓
Pay $99/month
  ↓
Entitlement updated
  ↓
New tools appear in sidebar: Soul, Systems, Insights
  ↓
Unlimited AI queries enabled
```

### Accelerator → Certification Journey
```
Complete Accelerator + 3 months post-engagement
  ↓
Email: "You're ready for Certification"
  ↓
Click → /certification/apply
  ↓
Apply + pay $2,497
  ↓
Curriculum access granted
  ↓
Complete assignments + exam
  ↓
Credential issued (badge + certificate)
  ↓
Listed in Practitioner Directory
```

---

## CONSIDERATIONS & CONSTRAINTS

### 1. **Community Moderation**
- Free users in community might increase moderation burden
- **Decision:** Keep community gated to paid tiers (Accelerator+)

### 2. **Support Cost Scaling**
- More tiers = more support complexity
- **Decision:** Implement basic → priority email tiers; 1:1 only in Certification+

### 3. **Feature Duplication**
- Some users may subscribe to Deepening without completing Accelerator
- **Decision:** Require Accelerator completion for Deepening tier
- **Implementation:** API checks `entitlements.completedAccelerator` before access

### 4. **Churn Management**
- Monthly Deepening tier may see churn
- **Mitigation:** Engaging tools, community, daily affirmations to drive engagement
- **Future:** Milestone notifications, "welcome back" campaigns

### 5. **Refunds & Chargebacks**
- Refund policy needed for Accelerator tier
- **Policy:** 7-day money-back guarantee (standard SaaS)
- **Implementation:** Stripe refund handling + entitlement revocation

### 6. **International Pricing**
- $297 USD may be too expensive in developing economies
- **Future:** Regional pricing, payment plans (Stripe Billing)

### 7. **Accessibility**
- Low-income users priced out of core journey
- **Mitigation:** Scholarship program (5% of slots free per cohort)

---

## FIRESTORE SCHEMA CHANGES

### Current
```
users/{userId}
  - email
  - role (admin, user)
  - onboardingStep
  - createdAt
```

### With Tiers (Phase 2+)
```
users/{userId}
  - email
  - role
  - onboardingStep
  - createdAt
  - tier: "accelerator" | "deepening" | "certification" | "founder"
  - tierStartDate: timestamp
  - tierEndDate: timestamp (for subscription tiers)
  - completedAccelerator: boolean
  - completedCertification: boolean

entitlements/{entitlementId}
  - userId
  - tier
  - stripeCustomerId
  - stripeSubscriptionId (for recurring)
  - createdAt
  - startsAt
  - expiresAt (null for one-time)
  - status: "active" | "paused" | "canceled"

stripe_events/{eventId}
  - stripeEventId
  - type (customer.subscription.created, invoice.payment_succeeded, etc.)
  - processedAt
```

---

## QUESTIONS FOR PRODUCT REVIEW

1. **Tier 1 Pricing:** Is $297 competitive for a 6-week program? Should it be $197? $397?
2. **Tier 2 Pricing:** Should Deepening be $99/month or $999/year?
3. **Community Gating:** Should community be free-tier accessible or only paid?
4. **AI Limits:** Should Accelerator have query limits on AI? (e.g., 10/day)
5. **Support:** Should free tier get email support or community-only?
6. **Certification Cost:** $2,497 reasonable for certification path?
7. **Founder Tier:** Is founder tier realistic or pure vision?
8. **Trial Period:** 7-day free trial before paid tier to boost conversion?
9. **Bundle Pricing:** Accelerator + Deepening bundle discount?
10. **Refund Policy:** Money-back guarantee? Partial refunds if drop midway?

---

## NEXT STEPS

### Before MVP Launch (Q2 2026)
- [ ] Product decides final pricing
- [ ] Stripe setup finalized + tested
- [ ] Entitlement schema finalized
- [ ] Checkout flow tested end-to-end
- [ ] Refund/support policy documented

### Before Phase 2 (Q3 2026)
- [ ] Feature flags implemented
- [ ] Tier gating in API endpoints
- [ ] Tier gating in UI navigation
- [ ] Upgrade paths wired (Accelerator → Deepening)

### Before Certification (Q4 2026)
- [ ] Certification curriculum created
- [ ] Exam/assessment built
- [ ] Credential system implemented
- [ ] Practitioner directory designed

---

## DOCUMENT METADATA

- **Created:** 2026-01-28
- **Scope:** Monetization strategy blueprint (no implementation)
- **Status:** Requires product + business review
- **Dependencies:** USER_JOURNEY_SEQUENCE.md, VISIBILITY_MODEL.md
- **Next:** Implementation roadmap (after product approves pricing)
- **Pricing Decisions:** PENDING
- **Estimated Implementation:** Q2 2026 (MVP with Accelerator tier only)

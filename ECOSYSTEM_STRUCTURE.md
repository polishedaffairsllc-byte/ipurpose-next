# Ecosystem Structure — iPurpose Coherence Blueprint

**Generated:** January 28, 2026  
**Phase:** 1–6 Complete (Structure Phase)  
**Status:** Framework locked, ready for design + implementation review

---

## Document Suite Overview

This suite provides a complete structural inventory and design for the iPurpose ecosystem. Each document serves a specific purpose:

| Document | Purpose | Audience |
|----------|---------|----------|
| **SYSTEM_INVENTORY.md** | Complete audit of all routes, pages, APIs | Engineering + Product |
| **USER_JOURNEY_SEQUENCE.md** | Human-first sequencing (10-step journey) | Product + Design |
| **PRUNING_PLAN.md** | Consolidation + deprecation roadmap | Engineering + Product |
| **VISIBILITY_MODEL.md** | Navigation + feature unlock architecture | Design + Engineering |
| **MONETIZATION_MAP.md** | Economic tiers + pricing structure | Business + Product |
| **ECOSYSTEM_STRUCTURE.md** (this doc) | Master coherence blueprint | All stakeholders |

---

## THE IPURPOSE ECOSYSTEM AT A GLANCE

### 10-Step User Journey

```
STEP 1: ENTRY                      STEP 2: ASSESSMENT             STEP 3: ETHICS
Landing (/) → Discover → Program   Clarity Check → Lead Capture   Ethics Charter
(Public, 2–5 min)                  (Public, 3–7 min)              (Public, 3–5 min)
       ↓                                  ↓                              ↓
STEP 4: SIGNUP                     STEP 5: ONBOARDING             STEP 6: LABS
Create account                     System setup + preferences      Identity → Meaning → Agency
(2–3 min)                          (5–10 min)                     (60–90 min)
       ↓                                  ↓                              ↓
STEP 7: INTEGRATION                STEP 8: COMMUNITY              STEP 9: TOOLS
Consolidate insights               Peer reflection + connection    AI + Soul + Systems + Insights
(10–20 min)                        (Ongoing)                       (Optional deepening)
       ↓                                  ↓
STEP 10: CONTINUATION              MILESTONE RECOGNITION
Lifetime practice loop             Certification + governance
(Ongoing)                          (Future)
```

**Total Transformation Time:** 2–3 hours (Steps 1–7)  
**Engagement Loop:** Daily + ongoing (Steps 8–10, indefinite)

---

## ARCHITECTURE: 5 LAYERS

### Layer 1: PUBLIC ENTRY (No Auth)
**Purpose:** Awareness + lead capture  
**Pages:** 14 routes (home, about, program, clarity-check, etc.)  
**Users:** Prospects, unawareness → consideration  
**Duration:** 2–10 minutes  
**Conversion:** → Signup

**Key Routes:**
```
/ home
/discover
/about, /program, /ai-blueprint
/clarity-check, /clarity-check-numeric
/starter-pack (lead magnet)
/info-session (webinar signup)
/ethics (trust building)
/privacy, /terms, /contact, /google-review
```

**Value Delivered:** Education + self-assessment + lead magnet

---

### Layer 2: ONBOARDING & ORIENTATION (Gated by Auth)
**Purpose:** System intro + journey mapping  
**Pages:** 3 routes (onboarding, orientation, orientation/map)  
**Users:** New accounts, just logged in  
**Duration:** 10–15 minutes  
**Outcome:** User understands full journey, ready to start labs

**Key Routes:**
```
/onboarding (post-signup setup)
/orientation (journey overview)
/orientation/map (visual guide)
```

**APIs:**
```
POST /api/onboarding/accept (confirm preferences)
GET /api/learning-path/orientation (roadmap)
GET /api/learning-path/orientation/progress (track)
```

**Value Delivered:** System clarity + psychological safety

---

### Layer 3: CORE JOURNEY — LABS (Gated by Auth + Onboarding)
**Purpose:** Transformation through guided self-inquiry  
**Pages:** 7 routes (labs hub + 3 labs + dashboard)  
**Users:** Active learners  
**Duration:** 60–90 minutes (spread over 1–3 weeks)  
**Outcome:** Identity, Meaning, Agency statements + integration plan

**Key Routes:**
```
/dashboard (progress hub)
/labs (lab selector)
/labs/identity (lab 1)
/labs/meaning (lab 2)
/labs/agency (lab 3)
/integration (consolidation)
```

**APIs:**
```
GET/PATCH /api/labs/{lab}/route (get active state)
POST /api/labs/{lab}/save (persist answers)
POST /api/labs/{lab}/active (set current state)
POST /api/labs/{lab}/complete (mark complete)
```

**Progress Tracking:**
- Each lab saves answers in Firestore
- Dashboard aggregates completion status
- User can resume labs anytime

**Value Delivered:** Self-knowledge + clarity + action plan

---

### Layer 4: COMMUNITY & CONNECTION (Gated by Auth + Labs Complete)
**Purpose:** Peer reflection + accountability + belonging  
**Pages:** 2 routes (feed + thread view)  
**Users:** Transformation-in-progress  
**Duration:** Ongoing  
**Features:** Multi-space (general, reflections), rate limiting, soft delete, pagination

**Key Routes:**
```
/community (feed)
/community/post/[id] (thread)
```

**APIs:**
```
POST /api/community/posts (create)
GET /api/community/posts (list with cursor)
GET/PATCH /api/community/posts/[id] (detail + edit)
GET/POST /api/community/posts/[id]/comments (comments)
```

**Moderation:**
- Community guidelines on feed
- Rate limiting: 20s between posts, 10s between comments
- Post owner can soft delete
- Future: admin moderation

**Value Delivered:** Belonging + peer wisdom + accountability

---

### Layer 5: ADVANCED TOOLS & CONTINUATION (Gated by Auth, Unlocked Post-Integration)
**Purpose:** Deepened exploration + lifetime practice  
**Pages:** 12+ routes (AI, Soul, Systems, Insights, Creation, Interpretation)  
**Users:** Committed practitioners  
**Duration:** Optional, ongoing  
**Features:** Streaming responses, specialized inquiry, analytics

**Key Routes:**
```
/ai-tools, /ai-tools/chat (main AI interface)
/soul, /soul/chat (archetypal reflection)
/systems, /systems/chat (systems thinking)
/insights, /insights/chat (personalized analytics)
/creation (guided writing)
/interpretation (meaning-making deepening)
/affirmation/today (daily ritual)
```

**APIs:**
```
POST /api/gpt (single request)
POST /api/gpt/stream (streaming)
POST /api/ai, /api/ai/stream (aliases?)
GET/POST /api/soul/* (archetype, checkin, practice)
GET /api/affirmation/today (daily)
```

**Value Delivered:** Deepened insights + AI partnership + specialized tools + ongoing practice

---

## ACCOUNT & SYSTEM LAYER (Throughout)

**User Management:**
```
/profile (public identity in community)
/settings (preferences, notifications)
/onboarding (post-signup setup)
```

**APIs:**
```
GET /api/me (current user)
GET /api/me/profile (user data)
POST /api/me/state (save state)
GET/PUT /api/preferences (user preferences)
POST /api/auth/login (login + session)
POST /api/auth/logout (session invalidation)
```

---

## NAVIGATION MODEL BY USER STATE

### State 1: Anonymous (Prospect)
**Navbar shows:** Learn, Explore, Join sections  
**CTAs:** Clarity Check, Learn More, Sign Up  
**Can access:** All public pages  
**Cannot access:** Labs, community, dashboard

### State 2: New Account (Onboarding)
**Navbar simplified:** Onboarding focus  
**CTA:** Complete onboarding → Start labs  
**Auto-forward:** /onboarding if not done

### State 3: In Labs (Active Learning)
**Navbar shows:** Dashboard, Current lab, Orientation, Account  
**CTA:** Continue [current lab]  
**Locked:** Community (unlock after labs)  
**Visible:** Dashboard with progress

### State 4: Labs Complete (Transformation)
**Navbar shows:** Dashboard, Community, Integration, Tools, Account  
**CTA:** Complete integration → Community  
**Newly visible:** Community, AI tools

### State 5: Mature User (Practitioner)
**Navbar shows:** Dashboard, Community, Full Tool Suite, Account  
**CTA:** Daily affirmation, Community, Choose tool  
**All features visible:** Every advanced tool accessible

---

## UNLOCK GATES & PROGRESS GATING

### Gate 1: Authentication
- Blocks: All gated routes
- Enforced by: Middleware (FirebaseSession check)
- If missing: Redirect to /login

### Gate 2: Onboarding Completion
- Blocks: /orientation, /labs, /integration, /community
- Enforced by: AuthContext (user.onboardingStep check)
- If missing: Auto-forward to /onboarding

### Gate 3: Lab Progress
- Blocks: /community, /integration before labs complete
- Enforced by: Dashboard API checks Firestore for completion status
- If missing: Show lock with "Complete all labs first"

### Gate 4: Tier-Based (Monetization, Phase 2+)
- Blocks: Advanced tools by tier
- Enforced by: Entitlement check in API + navigation
- If missing: "Upgrade to unlock" CTA

---

## THE 4 CRITICAL OVERLAPS (Candidates for Pruning)

### Overlap 1: Clarity Checks
- `/clarity-check` (primary)
- `/clarity-check-numeric` (variant, unclear)
- **Decision:** Consolidate or document difference

### Overlap 2: Signup Flow
- `/signup` (standard)
- `/enroll/create-account` (with entitlement)
- **Decision:** Unify or clarify branching

### Overlap 3: Learning Path
- `/learning-path` (wrapper?)
- `/labs` (direct labs access)
- `/orientation` (entry overview)
- **Decision:** Clarify relationship or deprecate /learning-path

### Overlap 4: AI Endpoints
- `/api/gpt*` (primary)
- `/api/ai*` (aliases or different?)
- **Decision:** Consolidate to single namespace

---

## ECONOMIC TIERS (Monetization Blueprint)

### Tier 1: Free (Public Entry)
**Cost:** $0  
**Includes:** Public pages, clarity check, starter pack  
**Goal:** Lead magnet + awareness

### Tier 2: Accelerator (Core Program)
**Cost:** $297 (estimated)  
**Includes:** Labs, community, dashboard, basic AI  
**Duration:** 6 weeks typical  
**Goal:** Transformation program

### Tier 3: Deepening (Advanced Tools)
**Cost:** $99/month (estimated)  
**Includes:** Unlimited AI, Soul, Systems, Insights, Community leadership  
**Target:** 30% of Accelerator completers  
**Goal:** Ongoing development

### Tier 4: Certification (Professional Credential)
**Cost:** $2,497 (estimated)  
**Includes:** Curriculum, exam, credential, practitioner directory  
**Target:** 5% of Accelerator completers  
**Goal:** Professional recognition

### Tier 5: Founder (Co-Creation)
**Cost:** Negotiated  
**Includes:** Governance, revenue share, board participation  
**Target:** Strategic partners  
**Goal:** Long-term sustainability

---

## IMPLEMENTATION ROADMAP

### MVP (Q2 2026): Community + Public Routes
- ✅ **Done:** Community MVP (posts, comments, pagination, rate limits)
- ✅ **Done:** Public routes accessible (/orientation, /ethics)
- ✅ **Done:** API handler fixes (Next.js 15+ compliance)
- ⏳ **Next:** Merge fix/api-params-and-public-routes → main

### Phase 2 (Q3 2026): Monetization MVP
- Implement Accelerator tier pricing
- Stripe checkout integration
- Entitlement gating in API
- Feature tier visibility

### Phase 3 (Q4 2026): Advanced Tools + Tier Gating
- Release Soul, Systems, Insights tools
- Implement Deepening tier ($99/mo)
- Tier-based navigation (visibility model)
- Monthly subscription management

### Phase 4 (2027): Certification Path
- Certification curriculum
- Exam + grading system
- Digital credentials
- Practitioner directory

### Phase 5+ (2027+): Founder Tier + Governance
- Advisory board structure
- Co-ownership framework
- Governance participation

---

## SUCCESS METRICS

### Awareness Layer (Public Entry)
- [ ] Page views ↑
- [ ] Clarity check submissions ↑
- [ ] Starter pack downloads ↑
- [ ] Signup conversion rate ≥ 5%

### Transformation Layer (Labs)
- [ ] Lab completion rate ≥ 80%
- [ ] Time-to-completion: avg 10–14 days
- [ ] User satisfaction: ≥ 4.5/5

### Community Layer
- [ ] Monthly active users ≥ 50% of paid users
- [ ] Posts per user: ≥ 2/month
- [ ] Comment rate: ≥ 3 comments per post

### Monetization Layer
- [ ] Accelerator conversion: ≥ 8% of signups
- [ ] Deepening upgrade rate: ≥ 30% of Accelerator completers
- [ ] Certification enrollment: ≥ 5% of Accelerator completers
- [ ] Churn (Deepening): ≤ 5% MoM

### Engagement Layer
- [ ] Daily active users: ≥ 30% of paid
- [ ] Tool usage: ≥ 60% of users access advanced tools
- [ ] Community contribution: ≥ 50% post at least once

---

## CRITICAL DECISIONS PENDING

### Product
- [ ] Clarify/consolidate duplicate routes (clarity check, signup, learning path)
- [ ] Define AI query limits for Accelerator tier
- [ ] Decide on community moderation policy (free vs. paid access)
- [ ] Define "Certification ready" criteria

### Business
- [ ] Finalize Accelerator pricing ($197/$297/$397?)
- [ ] Finalize Deepening pricing ($49/$99/$149/mo?)
- [ ] Finalize Certification pricing ($1,997/$2,497/$3,497?)
- [ ] Decide on payment terms (one-time vs. installment)
- [ ] Scholarship policy (% of free slots per cohort)

### Design
- [ ] Design tier unlock messaging (when/how to show upgrades)
- [ ] Design milestone recognition (badges, certificates)
- [ ] Design navigation transitions (smooth tier transitions)

### Engineering
- [ ] Build feature flags system
- [ ] Implement Stripe tier gating
- [ ] Database schema for entitlements
- [ ] Migration path for free → paid users

---

## ECOSYSTEM HEALTH INDICATORS

### Structural Health
- ✅ Clear journey from awareness → transformation
- ✅ No orphaned routes (every page serves purpose)
- ✅ Coherent value delivery at each stage
- ⚠️ Pending: Consolidate overlapping routes

### Navigation Health
- ✅ Intuitive progression through layers
- ✅ Clear unlock gates (auth, onboarding, progress)
- ✅ Visible CTAs at each stage
- ⚠️ Pending: Test navigation with real users

### Community Health
- ✅ Moderated, rate-limited
- ✅ Multiple spaces (general, reflections)
- ✅ Ownership + edit/delete for creators
- ⏳ Pending: Monitoring for harmful content

### Monetization Health
- ⚠️ Not yet live (Accelerator pricing TBD)
- ⏳ Pending: Pricing decision
- ⏳ Pending: Stripe integration testing

### Engagement Health
- ✅ Multiple touchpoints (labs, community, tools, affirmations)
- ✅ Daily practice loop (dashboard + affirmation)
- ✅ Milestone recognition (labs complete → community unlock)
- ⏳ Pending: Analytics on engagement patterns

---

## KNOWN ISSUES & RISKS

### Issues
1. **Duplicate Routes:** /clarity-check vs. /clarity-check-numeric
2. **Unclear Endpoints:** /api/ai* vs. /api/gpt*, /learning-path unclear
3. **Legacy Placeholders:** /legacy, /test, /development need cleanup
4. **Orphaned Pages:** /google-review (redirect-only)

### Risks
1. **Feature Bloat:** Too many tools (soul, systems, insights, creation) may confuse users
   - **Mitigation:** Progressive reveal based on journey stage
2. **Monetization Shock:** Users may resist tier gating (currently free)
   - **Mitigation:** Clear value diff per tier, free trial, scholarship program
3. **Community Moderation:** Unmoderated posts could damage brand
   - **Mitigation:** Guidelines, rate limits, admin oversight, future: AI moderation
4. **Support Scaling:** 3+ tiers means more support complexity
   - **Mitigation:** Self-service docs, community help, tiered support

---

## NEXT STEPS (FOR YOU)

### Immediate (Today)
- [ ] Review all 6 documents (SYSTEM_INVENTORY through MONETIZATION_MAP)
- [ ] Highlight any errors or outdated information
- [ ] Flag decisions that need stakeholder input

### This Week
- [ ] Product review: Pricing decisions, duplicate route consolidation
- [ ] Design review: Visibility model, navigation transitions
- [ ] Engineering review: Feasibility of tier gating, cleanup roadmap

### This Month
- [ ] Finalize pruning decisions (what to consolidate/remove)
- [ ] Decide on Accelerator pricing → greenlight Stripe integration
- [ ] Plan Phase 2 implementation (tier gating architecture)

### Next Quarter (Q2 2026)
- [ ] Implement Accelerator tier (MVP monetization)
- [ ] Deploy to production after merge + testing
- [ ] Launch marketing for paid tier

---

## APPENDIX: Quick Reference

### All Routes by Layer
**Public Entry:** /, /discover, /about, /program, /ai-blueprint, /clarity-check, /clarity-check-numeric, /starter-pack, /info-session, /ethics, /privacy, /terms, /contact, /google-review

**Onboarding:** /onboarding, /orientation, /orientation/map

**Labs:** /labs, /labs/identity, /labs/meaning, /labs/agency, /dashboard, /integration

**Community:** /community, /community/post/[id]

**Tools:** /ai-tools, /ai-tools/chat, /soul, /soul/chat, /systems, /systems/chat, /insights, /insights/chat, /creation, /interpretation

**Account:** /profile, /settings

**Auth:** /login, /signup, /enroll/create-account

**Legacy/Unclear:** /legacy, /test, /development, /ipurpose-6-week, /learning-path, /ai

**Admin:** /api/admin/*, /api/_admin/*, /api/_dev/fallback

---

## DOCUMENT METADATA

- **Created:** 2026-01-28
- **Author:** GitHub Copilot (Structural Audit)
- **Status:** Framework complete, ready for stakeholder review
- **Next:** Implementation roadmap after decisions finalized
- **Related Documents:**
  - SYSTEM_INVENTORY.md (routes audit)
  - USER_JOURNEY_SEQUENCE.md (10-step journey)
  - PRUNING_PLAN.md (consolidation roadmap)
  - VISIBILITY_MODEL.md (navigation + unlock architecture)
  - MONETIZATION_MAP.md (economic tiers)
- **Review Checklist:**
  - [ ] Product: Approves journey sequencing + pricing
  - [ ] Design: Approves visibility model + unlock messaging
  - [ ] Engineering: Approves technical feasibility + roadmap
  - [ ] Business: Approves monetization strategy + pricing
  - [ ] Legal: Approves terms + privacy for tiers
  - [ ] Executive: Approves strategic direction + investment

---

**This completes the Structural Audit Phase.** All 6 documents are locked and ready for review by stakeholders. Implementation can proceed once decisions are finalized.

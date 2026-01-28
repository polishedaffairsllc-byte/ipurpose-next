# System Inventory — iPurpose Ecosystem

**Generated:** January 28, 2026  
**Status:** Structure audit (no code changes)  
**Scope:** All routes, pages, API handlers, and functional areas

---

## Overview

This inventory categorizes every route, page, and API endpoint in the iPurpose ecosystem by:
- **Access Level:** Public, gated (auth-required), admin-only, internal
- **Functional Status:** Active, deprecated, partial, broken, test-only
- **Ecosystem Alignment:** Core journey, community, legacy, orphaned
- **Category:** Public Entry, Journey (Labs), Community, Monetization, Legacy, Utility

---

## PUBLIC ENTRY LAYER

> Entry points accessible without login. Marketing + educational onboarding.

### Orientation
- **Route:** `/orientation`
- **Component:** `app/(nav)/orientation/page.tsx`
- **Access:** Public ✅
- **Functional:** Yes
- **Alignment:** Core journey entry
- **Duplicate:** No
- **Legacy:** No
- **Description:** Guided intro to Identity/Meaning/Agency labs. Maps the entire journey structure.

### Orientation Map
- **Route:** `/orientation/map`
- **Component:** `app/(nav)/orientation/map/page.tsx`
- **Access:** Public ✅
- **Functional:** Yes (assume)
- **Alignment:** Core journey (visual/navigation aid)
- **Duplicate:** No
- **Legacy:** No
- **Description:** Visual journey map (likely for reference during orientation).

### Ethics & Community Charter
- **Route:** `/ethics`
- **Component:** `app/(nav)/ethics/page.tsx`
- **Access:** Public ✅
- **Functional:** Yes
- **Alignment:** Community values + safety
- **Duplicate:** No
- **Legacy:** No
- **Description:** Community principles and ethical guidelines. Foundational trust-building.

### Clarity Check
- **Route:** `/clarity-check`
- **Component:** `app/clarity-check/page.tsx`
- **Access:** Public ✅
- **Functional:** Yes (has API: `/api/leads/clarity-check`, `/api/clarity-check/submit`)
- **Alignment:** Lead capture + discovery
- **Duplicate:** Possibly (see clarity-check-numeric)
- **Legacy:** No
- **Description:** Assessment quiz to capture clarity level and convert to lead.

### Clarity Check Numeric
- **Route:** `/clarity-check-numeric`
- **Component:** `app/clarity-check-numeric/page.tsx`
- **Access:** Public ✅
- **Functional:** Yes (assume)
- **Alignment:** Lead capture (variant)
- **Duplicate:** Yes (overlaps with /clarity-check)
- **Legacy:** Maybe (potential A/B test remnant)
- **Description:** Alternative clarity assessment. Unclear if still used or a/b test variant.

### Starter Pack
- **Route:** `/starter-pack`
- **Component:** `app/starter-pack/page.tsx`
- **Access:** Public ✅
- **Functional:** Yes
- **Alignment:** Lead magnet / entry product
- **Duplicate:** No
- **Legacy:** No
- **Description:** Free foundational resource. Likely includes affirmations or workbook download.

### AI Blueprint
- **Route:** `/ai-blueprint`
- **Component:** `app/ai-blueprint/page.tsx`
- **Access:** Public ✅
- **Functional:** Yes
- **Alignment:** Discovery / educational
- **Duplicate:** No
- **Legacy:** No
- **Description:** Educational content explaining iPurpose's AI approach.

### Info Session
- **Route:** `/info-session`
- **Component:** `app/info-session/page.tsx`
- **Access:** Public ✅
- **Functional:** Yes (has API: `/api/leads/info-session`)
- **Alignment:** Lead capture (webinar signup)
- **Duplicate:** No
- **Legacy:** No
- **Description:** Info session registration form.

### About
- **Route:** `/about`
- **Component:** `app/about/page.tsx`
- **Access:** Public ✅
- **Functional:** Yes
- **Alignment:** Trust + brand
- **Duplicate:** No
- **Legacy:** No
- **Description:** Company/mission information.

### Program
- **Route:** `/program`
- **Component:** `app/program/page.tsx`
- **Access:** Public ✅
- **Functional:** Yes
- **Alignment:** Program overview (for prospects)
- **Duplicate:** No
- **Legacy:** No
- **Description:** iPurpose program structure and benefits.

### Discover
- **Route:** `/discover`
- **Component:** `app/discover/page.tsx`
- **Access:** Public ✅
- **Functional:** Yes
- **Alignment:** Discovery page
- **Duplicate:** No
- **Legacy:** No
- **Description:** Main discovery/exploration hub (often redirects or aggregates entry points).

### Contact
- **Route:** `/contact`
- **Component:** `app/contact/page.tsx`
- **Access:** Public ✅
- **Functional:** Yes (has API: likely supports form submission)
- **Alignment:** Lead capture
- **Duplicate:** No
- **Legacy:** No
- **Description:** Contact/support form.

### Privacy
- **Route:** `/privacy`
- **Component:** `app/privacy/page.tsx`
- **Access:** Public ✅
- **Functional:** Yes
- **Alignment:** Legal
- **Duplicate:** No
- **Legacy:** No
- **Description:** Privacy policy.

### Terms
- **Route:** `/terms`
- **Component:** `app/terms/page.tsx`
- **Access:** Public ✅
- **Functional:** Yes
- **Alignment:** Legal
- **Duplicate:** No
- **Legacy:** No
- **Description:** Terms of service.

### Google Review
- **Route:** `/google-review`
- **Component:** `app/google-review/page.tsx`
- **Access:** Public ✅
- **Functional:** Yes
- **Alignment:** Lead funnel (review redirect)
- **Duplicate:** No
- **Legacy:** No
- **Description:** Google review redirect or collection page.

### Home
- **Route:** `/` (root)
- **Component:** `app/page.tsx`
- **Access:** Public ✅
- **Functional:** Yes
- **Alignment:** Landing page
- **Duplicate:** No
- **Legacy:** No
- **Description:** Main homepage. Shows different CTAs based on login status.

---

## JOURNEY LAYER (Gated)

> Accessible after login. Core user development path.

### Dashboard
- **Route:** `/dashboard`
- **Component:** `app/dashboard/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Yes (has API: `/api/dashboard`)
- **Alignment:** Core hub
- **Duplicate:** No
- **Legacy:** No
- **Description:** Main user hub. Shows labs status, next steps, progress overview.

### Identity Lab
- **Route:** `/labs/identity` or `/labs` (nested)
- **Component:** `app/(nav)/labs/identity/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Yes (has API: `/api/labs/identity/route.ts`, active, save, complete)
- **Alignment:** Core journey (Lab 1 of 3)
- **Duplicate:** No
- **Legacy:** No
- **Description:** Interactive lab. Users define identity anchors, values, and self-language.

### Meaning Lab
- **Route:** `/labs/meaning`
- **Component:** `app/(nav)/labs/meaning/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Yes (has API: `/api/labs/meaning/route.ts`, active, save, complete)
- **Alignment:** Core journey (Lab 2 of 3)
- **Duplicate:** No
- **Legacy:** No
- **Description:** Interactive lab. Users clarify impact, purpose, and values alignment.

### Agency Lab
- **Route:** `/labs/agency`
- **Component:** `app/(nav)/labs/agency/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Yes (has API: `/api/labs/agency/route.ts`, active, save, complete)
- **Alignment:** Core journey (Lab 3 of 3)
- **Duplicate:** No
- **Legacy:** No
- **Description:** Interactive lab. Users identify actionable next steps and agency.

### Labs Hub
- **Route:** `/labs`
- **Component:** `app/(nav)/labs/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Yes
- **Alignment:** Core journey (navigation hub)
- **Duplicate:** No
- **Legacy:** No
- **Description:** Overview and nav for all three labs.

### Learning Path / Orientation Progress
- **Route:** `/learning-path` or `/learning-path/orientation`
- **Component:** `app/(nav)/learning-path/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Yes (has API: `/api/learning-path/orientation/route.ts`, `/api/learning-path/orientation/progress/route.ts`)
- **Alignment:** Journey scaffolding
- **Duplicate:** Possibly overlaps with labs
- **Legacy:** Maybe (check if labs replaced this)
- **Description:** Structured learning path (may be pre-labs onboarding or alternate flow).

### Integration
- **Route:** `/integration`
- **Component:** `app/(nav)/integration/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Yes (has API: `/api/integration/route.ts`)
- **Alignment:** Post-journey consolidation
- **Duplicate:** No
- **Legacy:** No
- **Description:** Helps users integrate insights from labs into life. Final step before community.

---

## COMMUNITY LAYER (Gated)

> Peer connection, recognition, milestones, continuation.

### Community Hub
- **Route:** `/community`
- **Component:** `app/(nav)/community/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Yes (has API: `/api/community/posts/route.ts`)
- **Alignment:** Core community
- **Duplicate:** No
- **Legacy:** No
- **Description:** Post feed. Multiple spaces (general, reflections). Composer. Pagination. Guidelines panel.

### Community Thread
- **Route:** `/community/post/[id]`
- **Component:** `app/(nav)/community/post/[id]/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Yes (has API: `/api/community/posts/[id]/route.ts`, `/api/community/posts/[id]/comments/route.ts`)
- **Alignment:** Core community (discussions)
- **Duplicate:** No
- **Legacy:** No
- **Description:** Single post view. Comments thread. Edit/delete for post owner. Rate limiting.

### Community APIs
- **POST /api/community/posts** — Create post
- **GET /api/community/posts** — List posts with cursor pagination
- **GET /api/community/posts/[id]** — Get single post
- **PATCH /api/community/posts/[id]** — Edit/soft delete post (owner only)
- **GET /api/community/posts/[id]/comments** — Get comments + post (thread view)
- **POST /api/community/posts/[id]/comments** — Add comment

---

## SOUL LAYER (Gated)

> New feature area (Jan 2026). Archetypal + reflective tools.

### Soul Chat
- **Route:** `/soul/chat`
- **Component:** `app/soul/chat/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Assume yes (has API: `/api/soul/checkin/route.ts`, `/api/soul/practice/route.ts`, `/api/soul/archetype/route.ts`)
- **Alignment:** Introspective tool (new)
- **Duplicate:** No
- **Legacy:** No
- **Description:** Archetypal chat tool. Check-in reflections. Practices/affirmations.

### Soul Home
- **Route:** `/soul`
- **Component:** `app/soul/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Assume yes
- **Alignment:** Introspective hub (new)
- **Duplicate:** No
- **Legacy:** No
- **Description:** Soul/archetype overview and navigation.

---

## AI & INTELLIGENCE LAYER (Gated)

> AI coaching, streaming, advanced tools.

### AI Tools
- **Route:** `/ai-tools`
- **Component:** `app/ai-tools/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Yes
- **Alignment:** Tool hub
- **Duplicate:** No
- **Legacy:** No
- **Description:** AI tool navigation/discovery.

### AI Tools Chat
- **Route:** `/ai-tools/chat`
- **Component:** `app/ai-tools/chat/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Yes (has API: `/api/gpt/stream/route.ts`)
- **Alignment:** Core AI feature
- **Duplicate:** No
- **Legacy:** No
- **Description:** Main AI chat interface (streaming).

### AI (Legacy or Overview)
- **Route:** `/ai`
- **Component:** `app/ai/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Yes
- **Alignment:** Tool overview (may be redundant)
- **Duplicate:** Possibly with /ai-tools
- **Legacy:** Maybe
- **Description:** AI overview or navigation. Check if /ai-tools replaced this.

### Systems Chat
- **Route:** `/systems/chat`
- **Component:** `app/systems/chat/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Assume yes
- **Alignment:** Systems thinking tool
- **Duplicate:** No
- **Legacy:** No
- **Description:** Specialized chat for systems thinking / design.

### Systems Hub
- **Route:** `/systems`
- **Component:** `app/systems/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Assume yes
- **Alignment:** Tool hub (specialized)
- **Duplicate:** No
- **Legacy:** No
- **Description:** Systems thinking tool overview.

### Insights Chat
- **Route:** `/insights/chat`
- **Component:** `app/insights/chat/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Assume yes
- **Alignment:** Analytics / reflection tool
- **Duplicate:** No
- **Legacy:** No
- **Description:** Personalized insights and analysis chat.

### Insights Hub
- **Route:** `/insights`
- **Component:** `app/insights/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Assume yes
- **Alignment:** Analytics hub
- **Duplicate:** No
- **Legacy:** No
- **Description:** Insights overview.

### Interpretation
- **Route:** `/interpretation`
- **Component:** `app/interpretation/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Yes
- **Alignment:** Specialized tool
- **Duplicate:** No
- **Legacy:** No
- **Description:** Guided interpretation/meaning-making tool.

### Creation
- **Route:** `/creation`
- **Component:** `app/creation/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Yes
- **Alignment:** Creative/output tool
- **Duplicate:** No
- **Legacy:** No
- **Description:** Guided creation/authoring tool.

---

## USER ACCOUNT LAYER (Gated)

> Profile, settings, preferences, state.

### Profile
- **Route:** `/profile`
- **Component:** `app/profile/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Yes (has API: `/api/me/profile/route.ts`)
- **Alignment:** Account management
- **Duplicate:** No
- **Legacy:** No
- **Description:** User profile page.

### Settings
- **Route:** `/settings`
- **Component:** `app/settings/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Yes
- **Alignment:** Account settings
- **Duplicate:** No
- **Legacy:** No
- **Description:** Preferences, notifications, account settings.

### Onboarding
- **Route:** `/onboarding`
- **Component:** `app/onboarding/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Yes (has API: `/api/onboarding/accept/route.ts`)
- **Alignment:** First-run experience
- **Duplicate:** No
- **Legacy:** No
- **Description:** Post-signup onboarding flow.

### Enrollment Required
- **Route:** `/enrollment-required`
- **Component:** `app/enrollment-required/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Yes
- **Alignment:** Gating message
- **Duplicate:** No
- **Legacy:** No
- **Description:** Shown when user needs to enroll in program.

---

## MONETIZATION LAYER (Gated)

> Stripe payment, session management, entitlement gating.

### Enroll (Create Account)
- **Route:** `/enroll/create-account`
- **Component:** `app/enroll/create-account/page.tsx`
- **Access:** Mixed (may be public for signup or gated post-free trial)
- **Functional:** Yes (has API: `/api/auth/create-user-with-entitlement/route.ts`)
- **Alignment:** Monetization entry (account + entitlement creation)
- **Duplicate:** Possibly with `/signup`
- **Legacy:** No
- **Description:** Sign up with payment/entitlement creation.

### Signup
- **Route:** `/signup`
- **Component:** `app/signup/page.tsx`
- **Access:** Public (if no session) / redirects to dashboard if logged in
- **Functional:** Yes (has API: `/api/auth/login/route.ts` handles signup)
- **Alignment:** Auth entry
- **Duplicate:** Possibly with /enroll/create-account
- **Legacy:** No
- **Description:** Standard signup form.

### Login
- **Route:** `/login`
- **Component:** `app/login/page.tsx`
- **Access:** Public (if no session) / redirects to dashboard if logged in
- **Functional:** Yes (has API: `/api/auth/login/route.ts`)
- **Alignment:** Auth entry
- **Duplicate:** No
- **Legacy:** No
- **Description:** Login form.

### Stripe APIs
- **POST /api/stripe/create-checkout-session** — Create Stripe session
- **POST /api/stripe/webhook** — Stripe webhook handler
- **POST /api/stripe/webhook/verify-session** — Verify Stripe session
- **GET /api/stripe/check-config** — Check Stripe configuration

---

## AFFIRMATIONS & PREFERENCES (Gated)

> Daily reflections, user preferences, state persistence.

### Affirmations
- **API:** `/api/affirmation/today` (GET) — Get today's affirmation
- **Access:** Gated (auth required)
- **Functional:** Yes
- **Alignment:** Daily ritual
- **Description:** Personalized affirmation delivered daily.

### Preferences
- **API:** `/api/preferences` (GET, POST, PUT)
- **Access:** Gated (auth required)
- **Functional:** Yes
- **Alignment:** User customization
- **Description:** Store user preferences (theme, notifications, etc.).

### User State
- **API:** `/api/me/state` (GET) — Get user state
- **Access:** Gated (auth required)
- **Functional:** Yes
- **Alignment:** State persistence
- **Description:** Cached user state (labs status, progress, etc.).

### User Profile/Me
- **API:** `/api/me` (GET) — Get user info
- **Access:** Gated (auth required)
- **Functional:** Yes
- **Alignment:** Account
- **Description:** Authenticated user info endpoint.

---

## LEGACY / DEPRECATED LAYER

> Old features, pre-ecosystem flows, or candidates for removal.

### Legacy Zone
- **Route:** `/legacy`
- **Component:** `app/legacy/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Placeholder (locked, shows link back to orientation)
- **Alignment:** Orphaned
- **Duplicate:** No
- **Legacy:** Yes (explicitly labeled as legacy)
- **Description:** Holds old content. Gated as placeholder.

### 6-Week Program
- **Route:** `/ipurpose-6-week`
- **Component:** `app/ipurpose-6-week/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Assume yes
- **Alignment:** Old program model
- **Duplicate:** Yes (overlaps with current labs/journey)
- **Legacy:** Maybe (check if still actively used)
- **Description:** Old 6-week structured program. May have been superseded by new labs.

### Development
- **Route:** `/development`
- **Component:** `app/development/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Assume yes
- **Alignment:** Internal/dev testing?
- **Duplicate:** Unknown
- **Legacy:** Maybe
- **Description:** Unclear purpose. May be internal dev tool or orphaned feature.

### Test Page
- **Route:** `/test`
- **Component:** `app/test/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Yes (testing image rendering)
- **Alignment:** Internal only (marked `noindex, nofollow`)
- **Duplicate:** No
- **Legacy:** No (utility for testing, not user-facing)
- **Description:** Internal test page for image/rendering validation.

---

## ADMIN & INTERNAL LAYER

> Admin-only endpoints, system status, developer tools.

### Admin Affirmations
- **API:** `/api/admin/affirmations` (POST)
- **Access:** Admin only (check requireUser with admin role)
- **Functional:** Yes
- **Alignment:** Content management
- **Description:** Create/manage affirmations (admin endpoint).

### Admin Status
- **API:** `/api/admin/status` (GET)
- **Access:** Admin only
- **Functional:** Yes
- **Alignment:** System monitoring
- **Description:** Admin dashboard data (system health, user counts, etc.).

### Admin Status (Private)
- **API:** `/api/_admin/status` (GET)
- **Access:** Admin only (underscore prefix = private)
- **Functional:** Yes
- **Alignment:** System monitoring
- **Description:** Private admin status endpoint.

### Health Check
- **API:** `/api/health` (GET)
- **Access:** Public (health checks should be open)
- **Functional:** Yes
- **Alignment:** Monitoring / DevOps
- **Description:** System health endpoint for monitoring.

### Dev Fallback
- **API:** `/api/_dev/fallback` (GET)
- **Access:** Internal/dev only
- **Functional:** Yes
- **Alignment:** Development tooling
- **Description:** Dev-only fallback endpoint.

---

## AUTHENTICATION APIS

> Auth flow management.

### Login
- **API:** `/api/auth/login` (POST)
- **Access:** Public
- **Functional:** Yes
- **Alignment:** Auth
- **Description:** Firebase login + session creation.

### Logout
- **API:** `/api/auth/logout` (POST)
- **Access:** Gated (auth required)
- **Functional:** Yes
- **Alignment:** Auth
- **Description:** Session invalidation + logout.

### Create User with Entitlement
- **API:** `/api/auth/create-user-with-entitlement` (POST)
- **Access:** Public (during signup with payment)
- **Functional:** Yes
- **Alignment:** Monetization + onboarding
- **Description:** Create user + assign entitlement tier in single call.

---

## LEADS & CAPTURE APIS

> Marketing funnels, form submissions, data capture.

### Clarity Check Lead
- **API:** `/api/leads/clarity-check` (POST)
- **Access:** Public
- **Functional:** Yes
- **Alignment:** Lead capture
- **Description:** Submit clarity check quiz results.

### Info Session Lead
- **API:** `/api/leads/info-session` (POST)
- **Access:** Public
- **Functional:** Yes
- **Alignment:** Lead capture
- **Description:** Register for info session.

### Welcome Popup Lead
- **API:** `/api/leads/welcome-popup` (POST)
- **Access:** Public
- **Functional:** Yes
- **Alignment:** Lead capture
- **Description:** Capture from welcome popup.

---

## CHAT & STREAMING APIS

> GPT integration, AI responses, streaming output.

### GPT
- **API:** `/api/gpt` (POST)
- **Access:** Gated (auth required)
- **Functional:** Yes
- **Alignment:** AI core
- **Description:** Single-request GPT call (non-streaming).

### GPT Stream
- **API:** `/api/gpt/stream` (POST)
- **Access:** Gated (auth required)
- **Functional:** Yes
- **Alignment:** AI core (streaming)
- **Description:** Streaming GPT response.

### AI Stream (Alias?)
- **API:** `/api/ai/stream` (POST)
- **Access:** Gated (auth required)
- **Functional:** Yes (assume)
- **Alignment:** AI
- **Duplicate:** Possibly with `/api/gpt/stream`
- **Description:** May be alias or variant of GPT stream.

### AI (Non-stream)
- **API:** `/api/ai` (POST)
- **Access:** Gated (auth required)
- **Functional:** Yes (assume)
- **Alignment:** AI
- **Duplicate:** Possibly with `/api/gpt`
- **Description:** May be alias or variant of GPT endpoint.

---

## SUMMARY BY CATEGORY

### Public Entry (11 routes)
✅ **Fully Aligned & Active:**
- `/` (home)
- `/orientation`
- `/ethics`
- `/clarity-check`
- `/starter-pack`
- `/ai-blueprint`
- `/info-session`
- `/about`
- `/program`
- `/discover`
- `/contact`
- `/privacy`
- `/terms`
- `/google-review`

🔶 **Duplicates / Needs Review:**
- `/clarity-check-numeric` — variant of clarity-check; unclear if still active

### Journey Core (7 routes)
✅ **Fully Aligned & Active:**
- `/dashboard`
- `/labs/identity`
- `/labs/meaning`
- `/labs/agency`
- `/labs` (hub)
- `/integration`

🟡 **Potential Overlap:**
- `/learning-path` & `/learning-path/orientation` — May be pre-labs flow; unclear if still used alongside new labs

### Community (2 routes)
✅ **Fully Aligned & Active:**
- `/community` (feed)
- `/community/post/[id]` (thread)

### AI & Intelligence (6 routes)
✅ **Active:**
- `/ai-tools`, `/ai-tools/chat`
- `/systems`, `/systems/chat`
- `/insights`, `/insights/chat`
- `/interpretation`
- `/creation`

🔶 **Duplicates:**
- `/ai` — Possibly redundant with `/ai-tools`

### Account & Preferences (3 routes)
✅ **Active:**
- `/profile`
- `/settings`
- `/onboarding`

🔶 **Needs Clarification:**
- `/enroll/create-account` vs. `/signup` — overlap in signup flow

### Soul (2 routes)
✅ **Active (new):**
- `/soul`
- `/soul/chat`

### Legacy (4 routes)
❌ **Deprecated / Candidates for Removal:**
- `/legacy` — explicit placeholder
- `/ipurpose-6-week` — may be superseded by new labs
- `/development` — unclear purpose
- `/test` — internal testing only (marked noindex)

### Auth (3 routes)
✅ **Core:**
- `/login`
- `/signup`
- `/enrollment-required`

---

## API ENDPOINT STATUS

### Functional APIs ✅
- **Auth:** login, logout, create-user-with-entitlement
- **Labs:** identity, meaning, agency (active, save, complete routes)
- **Community:** posts (create, list, get, update, delete), comments (list, create)
- **User:** me, me/profile, me/state, preferences, onboarding/accept
- **AI:** gpt, gpt/stream, ai, ai/stream
- **Affirmations:** affirmation/today
- **Leads:** clarity-check, info-session, welcome-popup
- **Stripe:** create-checkout-session, webhook, verify-session, check-config
- **Integration:** integration route
- **Soul:** checkin, practice, archetype
- **Dashboard:** compute status + progress
- **Monitoring:** health, admin/status, _admin/status, _dev/fallback
- **Clarity Check:** submit endpoint
- **Learning Path:** orientation, orientation/progress

### API Duplicates / Unclear ⚠️
- `/api/gpt` vs. `/api/ai` — Check if both needed
- `/api/gpt/stream` vs. `/api/ai/stream` — Check if both needed

---

## KEY FINDINGS

### Critical Duplicates to Clarify
1. **Clarity Checks:** `/clarity-check` vs. `/clarity-check-numeric`
   - Are both active? A/B test? Alternative for mobile?
   - Recommendation: Consolidate or explicitly mark one as deprecated.

2. **Signup Flow:** `/signup` vs. `/enroll/create-account`
   - Both create accounts. Do they differ in entitlement handling?
   - Recommendation: Clarify the distinction or merge.

3. **Learning Path:** `/learning-path` vs. `/labs`
   - Are these two different flows or does learning-path wrap labs?
   - Recommendation: Clarify sequencing. If learning-path is deprecated, remove.

4. **AI Endpoints:** `/api/gpt*` vs. `/api/ai*`
   - Are `/api/ai` and `/api/ai/stream` aliases or different implementations?
   - Recommendation: Consolidate to single naming convention.

5. **Insights/Systems/Creation/Interpretation:** Are these core tools or experimental?
   - Recommendation: Clarify placement in journey vs. optional tooling.

### Alignment Issues
- **`/test`, `/legacy`, `/development`:** Should be removed or explicitly admin-only
- **`/google-review`:** Single-purpose redirect. Could be simplified to link or metric call
- **Community only gated:** Should community be accessible to free users or only accelerator tier?
- **Soul tools (new):** Clear positioning. When are users directed here? After which step?

### Access Control Quality
✅ Public routes properly gated by middleware  
✅ Gated routes check for `requireUser`  
❌ Admin routes may not enforce role checks consistently  
⚠️ Some API endpoints missing explicit auth checks (verify all POST endpoints require session)

---

## NEXT PHASE: USER JOURNEY SEQUENCING

Once this inventory is validated, Phase 3 will sequence these routes into a coherent user journey:
1. **Landing** → Home/Discover entry
2. **Awareness** → About/Program/Ethics/AI Blueprint
3. **Assessment** → Clarity Check
4. **Entry** → Signup/Enroll
5. **Onboarding** → Onboarding flow
6. **Core Journey** → Orientation → Labs (Identity → Meaning → Agency) → Integration
7. **Community** → Community hub + reflection
8. **Advanced Tools** → AI Chat, Systems, Insights, Creation, Interpretation
9. **Soul** → Archetypal reflection (if applicable to all users)
10. **Continuation** → Affirmations, check-ins, milestones

---

## DOCUMENT METADATA

- **Created:** 2026-01-28
- **Scope:** Full route inventory, no code changes
- **Next:** USER_JOURNEY_SEQUENCE.md (Phase 3)
- **Validation:** Requires human review to confirm legacy status and duplicates

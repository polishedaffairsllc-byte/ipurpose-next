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
- **Functional:** Unverified (needs smoke test)
- **Alignment:** Core journey (visual/navigation aid)
- **Duplicate:** No
- **Legacy:** No
- **Description:** Visual journey map (for reference during orientation). **Status:** Verify runtime functionality.

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
- **Access:** Public (deprecated)
- **Functional:** Yes (present in repo)
- **Alignment:** Lead capture (variant)
- **Duplicate:** Yes (overlaps with /clarity-check)
- **Legacy:** Yes (A/B test remnant)
- **Description:** Alternative clarity assessment. **DEPRECATED.** Redirect to `/clarity-check` as canonical.

**Deprecation Directive:**
- Canonical route: `/clarity-check`
- `/clarity-check-numeric` → 301 redirect to `/clarity-check`
- Remove from navigation
- Mark route for removal after 30-day deprecation period

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

### Learning Path (UI Route)
- **Route:** `/learning-path` (if exists)
- **Component:** `app/(nav)/learning-path/page.tsx` (if exists)
- **Access:** Gated (auth required)
- **Functional:** Unverified (needs code audit)
- **Alignment:** Journey scaffolding (wrapper, NOT core spine)
- **Duplicate:** Yes (overlaps with Labs)
- **Legacy:** Yes (structurally superseded by Labs)
- **Description:** Learning path wrapper. **NOT canonical.** Core journey spine is Labs.

**Structure Clarification:**
- **Canonical spine:** Labs (Orientation → Identity → Meaning → Agency → Integration)
- Learning Path is a wrapper/onboarding layer, not the primary journey engine
- Labs define transformation logic

### Learning Path APIs
- **GET /api/learning-path/orientation** — Orientation progress
- **GET /api/learning-path/orientation/progress** — Track progress
- **Status:** Unverified (needs audit for relationship to labs APIs)

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

> Reflective wing, accessed post-Integration. Not part of core journey spine.

**Structure:** Dedicated reflective domain, accessible post-Integration

### Soul Home
- **Route:** `/soul`
- **Component:** `app/soul/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Unverified (needs smoke test)
- **Alignment:** Reflective wing hub (post-integration optional)
- **Duplicate:** No
- **Legacy:** No
- **Description:** Soul/archetype overview and navigation.

### Soul Chat
- **Route:** `/soul/chat`
- **Component:** `app/soul/chat/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Unverified (needs smoke test)
- **Alignment:** Reflective tool (post-integration optional)
- **Duplicate:** No
- **Legacy:** No
- **Description:** Archetypal chat tool. Check-in reflections. Practices/affirmations.

**Soul Positioning (APPROVED):**
- Soul is NOT part of core journey spine
- Core spine: Orientation → Labs → Integration → Community
- Soul is a reflective wing accessed post-integration
- Structurally: Post-Integration, optional
- Economic tier: NOT premium-gated by default (available to all authenticated users)
- Soul APIs: `/api/soul/checkin`, `/api/soul/practice`, `/api/soul/archetype`

---

## AI & INTELLIGENCE LAYER (Gated)

> AI coaching, streaming, advanced tools.

### AI Tools (Canonical)
- **Route:** `/ai-tools` (canonical AI hub)
- **Component:** `app/ai-tools/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Verified (compiled, route active)
- **Alignment:** Core AI tool hub
- **Duplicate:** No
- **Legacy:** No
- **Description:** Main AI tools hub. Single canonical entry point for AI coaching.

### AI Tools Chat (Canonical)
- **Route:** `/ai-tools/chat` (canonical AI chat)
- **Component:** `app/ai-tools/chat/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Verified (API present)
- **Alignment:** Core AI feature
- **Duplicate:** No
- **Legacy:** No
- **Description:** Main AI chat interface with streaming support. **API note:** Currently uses `/api/gpt/stream`; should migrate to `/api/ai/stream` (canonical AI namespace).

### AI (Deprecated Hub)
- **Route:** `/ai`
- **Component:** `app/ai/page.tsx`
- **Access:** Gated (auth required)
- **Functional:** Yes (present in repo)
- **Alignment:** Tool overview (redundant)
- **Duplicate:** Yes (superseded by /ai-tools)
- **Legacy:** Yes
- **Description:** Old AI hub. **DEPRECATED.** Use `/ai-tools` as canonical.

**Deprecation Directive:**
- Canonical route: `/ai-tools` (and `/ai-tools/chat`)
- `/ai` → 301 redirect to `/ai-tools`
- Remove from navigation

### Systems Hub
- **Route:** `/systems`
- **Component:** `app/systems/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Unverified (needs smoke test)
- **Alignment:** Optional advanced tool (post-integration)
- **Duplicate:** No
- **Legacy:** No
- **Description:** Systems thinking tool overview.

### Systems Chat
- **Route:** `/systems/chat`
- **Component:** `app/systems/chat/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Unverified (needs smoke test)
- **Alignment:** Optional advanced tool (post-integration)
- **Duplicate:** No
- **Legacy:** No
- **Description:** Specialized chat for systems thinking / design.

### Insights Hub
- **Route:** `/insights`
- **Component:** `app/insights/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Unverified (needs smoke test)
- **Alignment:** Optional advanced tool (post-integration)
- **Duplicate:** No
- **Legacy:** No
- **Description:** Insights overview.

### Insights Chat
- **Route:** `/insights/chat`
- **Component:** `app/insights/chat/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Unverified (needs smoke test)
- **Alignment:** Optional advanced tool (post-integration)
- **Duplicate:** No
- **Legacy:** No
- **Description:** Personalized insights and analysis chat.

### Interpretation
- **Route:** `/interpretation`
- **Component:** `app/interpretation/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Verified (present in repo)
- **Alignment:** Optional advanced tool (post-integration)
- **Duplicate:** No
- **Legacy:** No
- **Description:** Guided interpretation/meaning-making tool.

### Creation
- **Route:** `/creation`
- **Component:** `app/creation/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Verified (present in repo)
- **Alignment:** Optional advanced tool (post-integration)
- **Duplicate:** No
- **Legacy:** No
- **Description:** Guided creation/authoring tool.

**Advanced Tools Classification (APPROVED):**
- Systems, Insights, Creation, Interpretation are optional advanced tools
- NOT part of core journey spine
- Core journey: Orientation → Labs → Integration → Community
- These tools are post-integration deepening options for interested users

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

### Enroll / Create Account (Secondary System Route)
- **Route:** `/enroll/create-account`
- **Component:** `app/enroll/create-account/page.tsx`
- **Access:** System-only (not primary user entry)
- **Functional:** Verified (API present)
- **Alignment:** Monetization system route (post-checkout)
- **Duplicate:** Yes (overlaps with /signup)
- **Legacy:** No
- **Description:** System route for post-payment account creation. **NOT canonical user entry.**

**Usage Directive:**
- Canonical public entry: `/signup`
- `/enroll/create-account` is secondary, system-only
- Use only for:
  - Post-Stripe checkout flows
  - Entitlement assignment flows
  - Internal account creation
- If accessed directly by users → redirect to `/signup`
- Remove from primary navigation

### Signup (Canonical Account Creation)
- **Route:** `/signup` (canonical public signup)
- **Component:** `app/signup/page.tsx`
- **Access:** Public (if no session) / redirects to dashboard if logged in
- **Functional:** Verified (API present, route active)
- **Alignment:** Primary auth entry
- **Duplicate:** No (canonical)
- **Legacy:** No
- **Description:** Canonical account creation route for all users.

**Canonical Directive:**
- `/signup` is the single canonical public account creation entry point
- All user signups start here
- After payment, route to `/enroll/create-account` for entitlement assignment
- All docs and marketing reference `/signup` as primary

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

## LEGACY / DEPRECATED LAYER (Scheduled for Removal)

> Old features, pre-ecosystem flows, or candidates for removal. **APPROVED REMOVALS.**

### Legacy Zone (APPROVED FOR REMOVAL)
- **Route:** `/legacy`
- **Component:** `app/legacy/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Verified (placeholder page exists)
- **Alignment:** Orphaned
- **Duplicate:** No
- **Legacy:** Yes (explicitly labeled as legacy)
- **Description:** Dead placeholder. Serves no purpose. **APPROVED FOR REMOVAL.**

**Removal Directive:**
- Remove `/legacy` route from build
- No 301 redirect needed (dead placeholder, no legitimate traffic)

### Test Page (APPROVED FOR REMOVAL)
- **Route:** `/test`
- **Component:** `app/test/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Yes (testing image rendering)
- **Alignment:** Internal utility only (marked `noindex, nofollow`)
- **Duplicate:** No
- **Legacy:** No (internal tool, not legacy product)
- **Description:** Internal test page for image/rendering validation. **APPROVED FOR REMOVAL.**

**Removal Directive:**
- Remove `/test` route from user-facing build
- Migrate image tests to Jest/Cypress suite
- No 301 redirect needed (internal only, not user-facing)

### Development (APPROVED FOR REMOVAL)
- **Route:** `/development`
- **Component:** `app/development/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Unverified (needs code audit)
- **Alignment:** Internal/dev testing
- **Duplicate:** Unknown
- **Legacy:** Yes (orphaned feature)
- **Description:** Unclear purpose. Orphaned feature with no active use case. **APPROVED FOR REMOVAL.**

**Removal Directive:**
- Remove `/development` route from build
- No 301 redirect needed (internal/orphaned)

### 6-Week Program (APPROVED FOR REMOVAL)
- **Route:** `/ipurpose-6-week`
- **Component:** `app/ipurpose-6-week/page.tsx`
- **Access:** Gated (auth required) ✅
- **Functional:** Unverified (needs audit)
- **Alignment:** Old program model (superseded)
- **Duplicate:** Yes (overlaps with current labs/journey)
- **Legacy:** Yes (pre-labs program structure)
- **Description:** Old 6-week structured program. Superseded by new Identity/Meaning/Agency labs. **APPROVED FOR REMOVAL.**

**Removal Directive:**
- Remove `/ipurpose-6-week` route from build
- No 301 redirect needed (legacy feature, users on new labs path)

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

### AI Endpoints (Canonical Intelligence Layer)

**Canonical AI Namespace: `/api/ai*`**

#### AI (Non-stream, Canonical)
- **API:** `/api/ai` (POST)
- **Access:** Gated (auth required)
- **Functional:** Unverified (needs runtime test)
- **Alignment:** Canonical AI core
- **Relationship:** Canonical endpoint for synchronous AI queries
- **Description:** Single-request AI endpoint. Canonical entry point for synchronous AI queries.

#### AI Stream (Canonical)
- **API:** `/api/ai/stream` (POST)
- **Access:** Gated (auth required)
- **Functional:** Unverified (needs runtime test)
- **Alignment:** Canonical AI streaming
- **Relationship:** Canonical endpoint for streaming AI responses
- **Description:** Streaming AI response endpoint. Canonical for real-time AI conversations.

**AI API Canonicalization (APPROVED):**
- Canonical namespace: `/api/ai*` (intelligence layer)
- Legacy namespace: `/api/gpt*` (deprecate)
- Migration: All AI integrations should use `/api/ai*`
- `/api/gpt*` endpoints should be:
  - Internal thin wrappers, OR
  - Deprecated with 30-day sunset, OR
  - Documented as non-canonical
- Public API docs reference `/api/ai*` only

### GPT Endpoints (Legacy, Non-Canonical)

**Status:** `/api/gpt*` are non-canonical. Use `/api/ai*` instead.

#### GPT (Non-stream, Legacy)
- **API:** `/api/gpt` (POST)
- **Access:** Gated (auth required)
- **Functional:** Verified (present in repo)
- **Alignment:** Legacy AI namespace (non-canonical)
- **Relationship:** Non-canonical. Should migrate to `/api/ai`
- **Description:** Deprecated single-request endpoint. **Use `/api/ai` instead.**

#### GPT Stream (Legacy)
- **API:** `/api/gpt/stream` (POST)
- **Access:** Gated (auth required)
- **Functional:** Verified (present in repo)
- **Alignment:** Legacy AI namespace (non-canonical)
- **Relationship:** Non-canonical. Should migrate to `/api/ai/stream`
- **Description:** Deprecated streaming endpoint. **Use `/api/ai/stream` instead.**

**Migration Directive:**
- `/api/gpt*` are non-canonical legacy endpoints
- Currently used in `/ai-tools/chat` but should migrate to `/api/ai*`
- Mark `/api/gpt*` for deprecation
- Set 30-day sunset period

---

## SUMMARY BY CATEGORY

### Public Entry (14 routes)
✅ **Fully Aligned & Active:**
- `/` (home)
- `/discover`
- `/about`
- `/program`
- `/ai-blueprint`
- `/clarity-check` (canonical Clarity Check)
- `/starter-pack`
- `/info-session`
- `/ethics`
- `/privacy`
- `/terms`
- `/contact`
- `/google-review`
- `/orientation` (public entry to labs)

🔴 **Deprecated:**
- `/clarity-check-numeric` → redirect to `/clarity-check` (APPROVED FOR REMOVAL)

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

### AI & Intelligence (9 routes)
✅ **Canonical AI Routes:**
- `/ai-tools` (AI tools hub)
- `/ai-tools/chat` (main AI chat interface)

✅ **Optional Advanced Tools (Post-Integration):**
- `/systems` (systems thinking hub)
- `/systems/chat` (systems thinking chat)
- `/insights` (personalized analytics hub)
- `/insights/chat` (insights dialogue)
- `/interpretation` (guided meaning-making)
- `/creation` (guided creative authoring)

🔴 **Deprecated:**
- `/ai` → redirect to `/ai-tools` (APPROVED FOR REMOVAL)

**Classification:**
- AI tools are core tool layer (unlocked post-integration)
- Systems, Insights, Creation, Interpretation are optional advanced tools
- These are NOT part of core journey spine (Labs → Integration → Community)
- Positioned as post-integration deepening tools

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

### Critical Decisions — Locked & Approved

**Decision #1: Clarity Check Canonical Route**
- **Canonical:** `/clarity-check`
- **Deprecated:** `/clarity-check-numeric` → 301 redirect
- **Status:** ✅ LOCKED & APPROVED
- **Rationale:** Single unified clarity assessment experience

**Decision #2: Signup Flow Canonical Entry**
- **Canonical (Public):** `/signup`
- **Secondary (System-Only):** `/enroll/create-account` (post-Stripe checkout only)
- **Status:** ✅ LOCKED & APPROVED
- **Rationale:** Clear public entry point; system routes for internal use

**Decision #3: Core Journey Spine (4 Steps)**
- **Canonical Core:** Orientation → Labs → Integration → Community
- **Learning Path:** UX scaffolding, NOT canonical spine
- **Soul:** Post-Integration reflective wing, NOT core spine
- **Optional Tools:** Systems, Insights, Creation, Interpretation (post-integration only)
- **Status:** ✅ LOCKED & APPROVED
- **Rationale:** Labs define transformation engine; keep core focused

**Decision #4: AI API Namespace Canonicalization**
- **Canonical:** `/api/ai/*` (primary intelligence layer)
- **Legacy (Deprecate):** `/api/gpt/*` (30-day sunset)
- **Status:** ✅ LOCKED & APPROVED
- **Rationale:** Single canonical namespace for all AI/intelligence features

**Decision #5: Optional Tools Classification**
- **Classification:** Systems, Insights, Creation, Interpretation = optional post-integration tools
- **Status:** ✅ LOCKED & APPROVED
- **Rationale:** Not core spine; offered as deepening tools post-integration

**Decision #6: Soul Positioning & Gating**
- **Classification:** Post-Integration Reflective Wing
- **Economic Gating:** NOT premium-gated (accessible to all authenticated users)
- **Status:** ✅ LOCKED & APPROVED
- **Rationale:** Introspective deepening for interested users, not forced onto journey

**Decision #7: Community Entitlement Boundary** ⭐ PHASE 2
- **Tier Access:** PAID-ONLY (active paid entitlement required)
- **Routes Gated:** `/community`, `/community/post/[id]`, `/api/community/*`
- **Unauthorized Redirect:** `/enrollment-required`
- **Rationale:** Minimize trolling/moderation load; community as premium feature
- **Status:** ✅ LOCKED & APPROVED (Choice B)
- **Note:** `/ethics` remains PUBLIC (values/preview page)

**Decision #8: Soul Entitlement Gating** ⭐ PHASE 2
- **Classification:** Post-Integration Reflective Wing + Deepening-Tier Continuity Layer
- **Tier Access:** Deepening tier ($99/mo) and above ONLY
- **Routes Gated:** `/soul`, `/soul/chat`, soul APIs
- **Not Available To:** Free users, basic paid tiers
- **Unauthorized Redirect:** `/enrollment-required`
- **Status:** ✅ LOCKED & APPROVED (Choice B)
- **Rationale:** Soul as premium reflective deepening tool

**Decision #9: Advanced Tools Entitlement Gating** ⭐ PHASE 2
- **Classification:** Advanced Tools – Deepening Tier Continuity Layer
- **Routes Gated:** `/systems`, `/systems/chat`, `/insights`, `/insights/chat`, `/creation`, `/interpretation`
- **Tier Access:** Deepening tier ($99/mo) and above ONLY
- **Not Available To:** Free users, basic paid tiers
- **Unauthorized Redirect:** `/enrollment-required`
- **API Enforcement:** All related APIs require entitlement checks
- **UI Enforcement:** Navigation hidden for unauthorized users
- **Status:** ✅ LOCKED & APPROVED (Choice B)

**Decision #10: AI Tools Entitlement Gating** ⭐ PHASE 2
- **Classification:** Core Paid Intelligence Layer
- **Routes Gated:** `/ai-tools`, `/ai-tools/chat`
- **APIs Gated:** `/api/ai/*`, `/api/ai/stream`
- **Tier Access:** ALL paid tiers (not free users)
- **Not Available To:** Free users only
- **Unauthorized Redirect:** `/enrollment-required`
- **Status:** ✅ LOCKED & APPROVED (Choice B)
- **Rationale:** AI intelligence as core paid feature, accessible to all paying tiers

**Decision #11: Labs Access Boundary** ⭐ PHASE 2
- **Classification:** Core Journey Layer – Free Access (Auth Required)
- **Routes:** `/labs`, `/labs/identity`, `/labs/meaning`, `/labs/agency`
- **Tier Access:** ALL logged-in users (free + paid)
- **Entitlement Gating:** NONE (no monetization on labs)
- **Status:** ✅ LOCKED & APPROVED (Choice A)
- **Rationale:** Labs are transformation engine; free to all to enable core journey

**Decision #12: Integration Monetization Boundary** ⭐ PHASE 2
- **Classification:** Monetization Bridge Layer (Identity formation → Paid embodiment & action)
- **Routes:** `/integration` and related APIs
- **Tier Access:** ANY paid entitlement required (not free users)
- **Conversion Logic:** Labs → free access. Integration → paid gating forces upgrade decision.
- **Unauthorized Redirect:** `/enrollment-required` (before Integration, after Labs completion)
- **API Enforcement:** `/api/integration*` endpoints require entitlement
- **Status:** ✅ LOCKED & APPROVED (Choice B)
- **Rationale:** Integration is conversion bridge; labs alone insufficient for paid tier

### Alignment Issues (Resolved by Locked Decisions)

✅ **Legacy/Deprecated Routes (Decision #3, #6):** `/test`, `/legacy`, `/development` approved for removal. See "LEGACY / DEPRECATED LAYER" section for details.

✅ **Google Review Route:** Single-purpose redirect. Can be simplified post-launch.

✅ **Community Gating (Decision #7):** Community PAID-ONLY. Accessible only to users with active paid entitlements. Prevents trolling/low-quality content.

✅ **Soul Positioning (Decision #8):** Post-Integration reflective wing + Deepening-tier continuity layer. Gated by Deepening tier ($99/mo+).

✅ **Optional Tools (Decision #9):** Systems, Insights, Creation, Interpretation positioned as Advanced Tools – Deepening tier continuity layer. Gated by Deepening tier.

✅ **AI Tools (Decision #10):** Core Paid Intelligence Layer. Available to ALL paid tiers (not free). Gated at middleware + API level.

✅ **Labs (Decision #11):** Core Journey Layer – FREE access to all authenticated users (no entitlement gating). Labs are transformation engine accessible to all.

✅ **Integration (Decision #12):** Monetization Bridge Layer. Requires ANY paid entitlement. Forces upgrade decision after free labs completion. Gated at middleware + API level.

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

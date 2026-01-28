# Pruning Plan — iPurpose Ecosystem Optimization

**Generated:** January 28, 2026  
**Focus:** Eliminate duplication, clarify overlaps, identify deprecation candidates  
**Scope:** No implementation (recommendation document only)  

---

## Overview

Based on the **SYSTEM_INVENTORY.md** and **USER_JOURNEY_SEQUENCE.md**, this document identifies:
- **Redundant routes** to consolidate or remove
- **Overlapping features** to merge
- **Legacy flows** to deprecate
- **Orphaned pages** with no clear purpose
- **Broken navigation** patterns

---

## CONSOLIDATION CANDIDATES

### 1. CLARITY CHECKS — `/clarity-check` + `/clarity-check-numeric`

**Current State:**
- `/clarity-check` — Main clarity assessment quiz
- `/clarity-check-numeric` — Alternative version (unclear why)

**Overlap:** Both serve same purpose (lead capture + self-assessment)

**Analysis:**
- **Unknown:** Different question types? Mobile variant? A/B test remnant?
- **Risk:** Confusing for users; analytics split; two forms to maintain
- **Maintenance burden:** Any UX change requires two updates

**Recommendation:**

**CONSOLIDATE:**
```
KEEP:    /clarity-check (primary)
REMOVE:  /clarity-check-numeric
ACTION:  
  - If numeric was A/B test: verify winner, remove loser
  - If numeric addresses specific UX need: merge into /clarity-check
  - If numeric is experimental: document why, set deprecation date
```

**Timeline:** Determine winner → update all links → 301 redirect `/clarity-check-numeric` to `/clarity-check` → set removal date

---

### 2. SIGNUP FLOW — `/signup` + `/enroll/create-account`

**Current State:**
- `/signup` — Standard signup form
- `/enroll/create-account` — Signup + entitlement creation

**Overlap:** Both create accounts; unclear distinction

**Analysis:**
- **Hypothesis:** `/signup` → free users; `/enroll` → paid users
- **Problem:** No clear CTA guiding users to correct form
- **Maintenance:** Two signup flows to maintain
- **Naming:** "Enroll" is confusing (sounds like course enrollment, not signup)

**Recommendation:**

**CONSOLIDATE OR CLARIFY:**
```
OPTION A (Recommended): Single Signup Flow
  - KEEP: /signup (unified entry)
  - MOVE: /enroll/create-account → merge logic into /signup
  - CHANGE: Signup form detects tier (free vs. paid) and branches internally
  - REMOVE: /enroll/create-account route

OPTION B: Explicit Branching
  - KEEP: /signup (free tier) 
  - KEEP: /enroll/create-account (paid tier)
  - ADD: Landing page decision point → choose tier → route to correct signup
  - IMPROVE: Navigation UX to make choice clear

ACTION: Product decision required. Recommend Option A for simplicity.
```

**Timeline:** Decide → refactor signup logic → test both paths → launch

---

### 3. AI ENDPOINTS — `/api/gpt*` + `/api/ai*`

**Current State:**
- `/api/gpt` — GPT single-call endpoint
- `/api/gpt/stream` — GPT streaming endpoint
- `/api/ai` — (Unclear if alias or different)
- `/api/ai/stream` — (Unclear if alias or different)

**Overlap:** Potentially duplicate naming/functionality

**Analysis:**
- **Unknown:** Are `/api/ai/*` just renamed versions of `/api/gpt/*`?
- **Maintenance:** If duplicates, confusing for developers; routes may drift
- **API Clarity:** Frontend code may use wrong endpoint

**Recommendation:**

**STANDARDIZE NAMING:**
```
OPTION A: Single Namespace
  - KEEP: /api/gpt or /api/ai (choose one)
  - KEEP: /api/gpt/stream or /api/ai/stream (paired)
  - DEPRECATE: other namespace
  - TIMELINE: Mark old endpoints as deprecated for 1 month, then remove
  - REDIRECT: Old endpoints 301-redirect to new with warning

OPTION B: Verify Non-Overlap
  - Check if /api/ai/* differ from /api/gpt/* in implementation
  - If different: document clearly
  - If same: consolidate immediately

ACTION: Code audit required. Assume they're duplicates pending verification.
```

---

### 4. LEARNING PATH — `/learning-path` vs. `/labs`

**Current State:**
- `/learning-path` → Structured orientation path
- `/learning-path/orientation` → Orientation subpath with progress tracking
- `/labs` → Hub for Identity/Meaning/Agency labs
- `/orientation` → Entry-level orientation overview

**Overlap:** Multiple routes describe "orientation"; unclear sequencing

**Analysis:**
- **Hypothesis:** `/learning-path` may be legacy wrapper replaced by direct `/labs` access
- **Navigation:** Users may be confused by multiple entry points
- **Journey:** Current sequence is: `/orientation` (overview) → `/labs/identity` (direct). Does `/learning-path` fit?
- **Progress:** `/api/learning-path/orientation/progress` seems redundant with lab completion tracking

**Recommendation:**

**CLARIFY SEQUENCING:**
```
CURRENT JOURNEY:
  /orientation (overview) 
    → /labs/identity (first lab)
    → /labs/meaning (second lab)
    → /labs/agency (third lab)
    → /integration

QUESTION: Where does /learning-path fit?
  
OPTION A: Remove /learning-path
  - REMOVE: /learning-path, /learning-path/orientation
  - DEPRECATE: /api/learning-path/* APIs
  - RATIONALE: Direct /labs access is clearer
  
OPTION B: Keep /learning-path as Optional Guide
  - KEEP: /learning-path (overview/roadmap)
  - MAKE: /learning-path → link-only (no interactivity)
  - CLARIFY: This is optional for learners who want a guided path overview
  
ACTION: Requires product review. Assume deprecation (Option A) pending confirmation.
```

---

### 5. NAVIGATION HUB DUPLICATION — `/discover` + `/program` + `/about`

**Current State:**
- `/` (home) — Landing with entry points
- `/discover` — Discovery hub
- `/program` — Program overview
- `/about` — About mission

**Analysis:**
- **Navigation:** Three pages that describe the same thing: what iPurpose is
- **Redundancy:** Users can access same info from multiple routes
- **Messaging:** Home → discover → program → about (all explain the program)

**Recommendation:**

**SIMPLIFY MARKETING FUNNEL:**
```
KEEP:    /
KEEP:    /about (mission + trust)
CONSOLIDATE: /discover + /program → single hub or home sub-section
OPTION:  Make /discover → /program (301 redirect)
OR:      Keep both but link them clearly (discover → program)
         
RATIONALE: Reduce cognitive load. Pick singular path for prospects.
```

**Timeline:** Product decision → update links → implement 301s

---

## DEPRECATION CANDIDATES

### 1. **`/legacy` — Explicit Placeholder**

**Current State:**
```tsx
export default function LegacyPage() {
  return (
    <div className="container max-w-4xl mx-auto px-6 md:px-10 py-12">
      <h1 className="text-4xl font-semibold text-warmCharcoal">Legacy Zone</h1>
      <p className="mt-3 text-sm text-warmCharcoal/70">
        This zone is locked. Complete Orientation to unlock it.
      </p>
      <Link href="/orientation" className="inline-flex mt-6 text-sm text-ip-accent underline">
        Back to Orientation
      </Link>
    </div>
  );
}
```

**Status:** Locked placeholder with no content

**Recommendation:**
```
REMOVE: /legacy route entirely
ACTION:
  - Check if anyone links to /legacy (search codebase)
  - Remove app/legacy/page.tsx
  - Remove from middleware allowed routes
  - No 301 redirect needed (no legitimate traffic expected)
```

---

### 2. **`/test` — Internal Testing Page**

**Current Status:**
- Marked `robots: noindex, nofollow`
- Tests image rendering
- Not user-facing

**Recommendation:**
```
REMOVE: /test route from user-facing build
ALTERNATIVE:
  - Move to internal dev-only section (/dev/test)
  - Or remove completely and use Jest/Cypress for image testing
  
ACTION:
  - Remove app/test/page.tsx
  - Migrate tests to proper test suite if needed
```

---

### 3. **`/development` — Unclear Purpose**

**Current Status:**
- Gated behind auth
- No clear purpose in journey
- Not mentioned in documentation

**Recommendation:**
```
INVESTIGATE FIRST:
  - Search codebase for references to /development
  - Ask product: Is this active? What was it for?
  - Check analytics: Does anyone visit?

IF ORPHANED:
  - REMOVE: /development route
  - ACTION: Delete app/development/page.tsx

IF ACTIVE:
  - Document purpose clearly
  - Rename for clarity (e.g., /dashboard/dev-tools)
  - Link from appropriate hub
```

---

### 4. **`/ipurpose-6-week` — Possible Legacy Program**

**Current Status:**
- Gated behind auth
- Name suggests old 6-week program
- May be superseded by new Identity/Meaning/Agency labs

**Analysis:**
- **Question:** Is this still used or remnant from old program?
- **Risk:** Users may find old 6-week flow and get confused about current path
- **Analytics:** Check usage—if zero, safe to remove

**Recommendation:**
```
INVESTIGATE:
  - Check analytics: Any users accessing /ipurpose-6-week?
  - Check referrers: Who links to it?
  - Search docs: Is it mentioned?

IF UNUSED:
  - DEPRECATE: Mark as deprecated with 3-month sunset
  - REMOVE: After 3 months
  
IF USED:
  - CLARIFY: Document relationship to new labs
  - OR: Migrate users to current path
```

---

### 5. **`/google-review` — Single-Purpose Redirect**

**Current Status:**
- Public route that redirects to Google review
- Low value

**Analysis:**
- **Simpler Alternative:** Direct link (no route needed)
- **Measurement:** If tracking review clicks, use analytics event instead

**Recommendation:**
```
DEPRECATE: /google-review route
ACTION:
  - Replace inbound links with direct Google review URL + tracking
  - Use analytics event to track clicks instead of route
  - Remove app/google-review/page.tsx
  
BENEFIT: One fewer route to maintain
```

---

## ORPHANED OR UNCLEAR ROUTES

### Routes Needing Clarification

| Route | Status | Action |
|-------|--------|--------|
| `/ai` | Unclear if alias of `/ai-tools` | Audit: if duplicate, remove and 301 |
| `/enrollment-required` | Gating message only | Keep (needed for UX) |
| `/creation` | Available after auth, but no journey integration | Clarify unlock logic (Phase 5) |
| `/interpretation` | Same as above | Clarify unlock logic |
| `/soul` + `/soul/chat` | New (Jan 2026); unclear trigger | Clarify when recommended to users |
| `/api/_dev/fallback` | Dev-only? | Remove or clearly document internal |

---

## RECOMMENDATION SUMMARY

### CONSOLIDATE (High Priority)
```
1. /clarity-check-numeric → /clarity-check (merge or remove)
2. /signup + /enroll/create-account → unify flow
3. /api/gpt* + /api/ai* → standardize namespace
4. /learning-path + /labs → clarify sequencing
```

### REMOVE (High Priority)
```
1. /legacy (dead placeholder)
2. /test (move to dev suite)
```

### INVESTIGATE & DECIDE (Medium Priority)
```
1. /development (unclear purpose)
2. /ipurpose-6-week (legacy?)
3. /discover + /program (marketing redundancy)
4. /google-review (simplify to link)
```

### CLARIFY & DOCUMENT (Medium Priority)
```
1. /ai vs. /ai-tools
2. /soul unlock logic
3. /creation, /interpretation unlock logic
```

### KEEP (No Changes)
```
1. All core journey routes (orientation, labs, integration)
2. All community routes (community, posts)
3. All auth routes (login, signup)
4. All public entry routes (about, program, ethics, clarity-check)
5. All account routes (profile, settings, dashboard)
```

---

## CLEANUP TIMELINE (Phased)

### Week 1: Investigation & Decisions
- Audit /clarity-check-numeric usage
- Verify /api/ai* vs. /api/gpt* implementation
- Confirm /ipurpose-6-week is unused
- Clarify /signup vs. /enroll difference

### Week 2: Quick Wins
- Remove /legacy route
- Remove /test route (move tests to proper suite)
- Consolidate clarity-check variants
- 301 redirect /google-review to external URL + analytics

### Week 3–4: Larger Consolidations
- Merge /signup + /enroll flows
- Consolidate API namespace (/api/gpt* or /api/ai*)
- Clarify /learning-path vs. /labs
- Remove or clarify /development

### Week 5: Final Audit
- Test all redirects
- Update documentation
- Verify no broken links
- Check analytics impact

---

## RISK MITIGATION

### Before Removal:
- [ ] Check all inbound links (internal + external)
- [ ] Verify zero analytics traffic
- [ ] Search codebase for hardcoded references
- [ ] Set up 301 redirects for public routes
- [ ] Notify stakeholders if public routes change

### After Removal:
- [ ] Monitor error logs for 404s
- [ ] Track any user complaints
- [ ] Verify analytics 301 redirect traffic

---

## SUCCESS METRICS

After pruning:
- ✅ **No orphaned routes** (every route serves a purpose)
- ✅ **Clear journey flow** (no confusing alternatives)
- ✅ **Reduced maintenance** (one way to do things)
- ✅ **Better UX** (less navigation confusion)
- ✅ **Cleaner codebase** (less dead code)

---

## DOCUMENT METADATA

- **Created:** 2026-01-28
- **Scope:** Pruning recommendations (no code changes)
- **Decisions Required:** Product review on consolidations
- **Next:** VISIBILITY_MODEL.md (Phase 5)
- **Dependencies:** SYSTEM_INVENTORY.md, USER_JOURNEY_SEQUENCE.md

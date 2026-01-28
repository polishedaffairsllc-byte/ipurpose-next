# User Journey Sequence — iPurpose Ecosystem

**Generated:** January 28, 2026  
**Focus:** Human-first journey design (not tech implementation)  
**Scope:** Entry → Completion → Continuation  

---

## Overview

This document maps the **human journey** through iPurpose, step-by-step, showing what pages/tools users encounter and in what order.

The journey is designed to move users from:
- **Unawareness** → Clarity about their own alignment
- **Isolation** → Community connection
- **Reactivity** → Intentional agency
- **Momentum** → Sustainable practice

---

## THE iPURPOSE JOURNEY (10 Steps)

### STEP 1: ENTRY & DISCOVERY
**Goal:** Prospect becomes aware of iPurpose and its core value.

**Pages/Tools:**
- `/` (Homepage) — First impression. Depending on traffic source, homes user on value prop
- `/discover` — Hub for exploration. Often ad/campaign landing
- `/about` — Mission, founding story, credibility
- `/program` — Structured overview of what iPurpose offers
- `/ai-blueprint` — Educational. Shows iPurpose's AI approach (differentiator)

**User Question:** "What is this? Is it for me?"

**CTAs:**
- "Start Clarity Check" → `/clarity-check`
- "Explore Program" → `/program`
- "See AI Blueprint" → `/ai-blueprint`
- "Free Starter Pack" → `/starter-pack`

**Duration:** 2–5 minutes (awareness phase)

**Access:** Public  
**Auth Required:** No

---

### STEP 2: ASSESSMENT & LEAD CAPTURE
**Goal:** Prospects self-assess alignment and commit to learning more.

**Pages/Tools:**
- `/clarity-check` — Interactive quiz. Asks about current clarity level, alignment gaps, pain points
- `/clarity-check-numeric` — (Alternative version; under review for consolidation)
- **Form:** Clarity quiz submission → `/api/leads/clarity-check`

**User Question:** "Where am I stuck? What's my actual clarity level?"

**Outcome:** 
- Lead captured in CRM
- Quiz result shown
- Redirect to next step based on result

**Duration:** 3–7 minutes  
**Access:** Public  
**Auth Required:** No

---

### STEP 3: ETHICAL FRAMEWORK & COMMUNITY VALUES
**Goal:** User understands iPurpose community principles before entering.

**Pages/Tools:**
- `/ethics` — Community charter. Safety, agency, honesty, care
- `/starter-pack` — Free resource (affirmations, workbook, primer)

**User Question:** "Can I trust this? Do I align with how you work?"

**Outcome:**
- User feels safe
- Values alignment confirmed
- Free value delivered

**Duration:** 3–5 minutes  
**Access:** Public  
**Auth Required:** No

---

### STEP 4: SIGNUP & ACCOUNT CREATION
**Goal:** User creates account and enters ecosystem.

**Pages/Tools:**
- `/signup` — Create account form (email + password)
- `/enroll/create-account` — Create account + select entitlement tier (if paid)
- **API:** `/api/auth/login` (handles signup + session)
- **API:** `/api/auth/create-user-with-entitlement` (signup + entitlement assignment)

**User Question:** "How do I join?"

**Outcome:**
- Account created
- Session established (FirebaseSession cookie)
- User authenticated

**Duration:** 1–2 minutes  
**Access:** Public (pre-auth)  
**Auth Required:** No (yet)

---

### STEP 5: ONBOARDING & SYSTEM ORIENTATION
**Goal:** New user understands iPurpose structure and is oriented to their first steps.

**Pages/Tools:**
- `/onboarding` — Post-signup onboarding flow. Role selection, preferences, consent
- **API:** `/api/onboarding/accept` (confirm acceptance)
- `/orientation` — Deep orientation to the 3 labs (Identity → Meaning → Agency)
- `/orientation/map` — Visual journey map

**User Question:** "How does this work? What's my path?"

**Outcome:**
- User understands labs structure
- User knows what comes next
- Preferences recorded
- User ready to begin core journey

**Duration:** 5–10 minutes  
**Access:** Gated (auth required)  
**Auth Required:** Yes

---

### STEP 6: CORE JOURNEY — LABS (Identity → Meaning → Agency)
**Goal:** User discovers themselves through structured self-inquiry.

**Pages/Tools (in sequence):**

#### Lab 1: Identity
- `/labs/identity` — Interactive inquiry. "Who are you? What anchors you?"
- **API:** `/api/labs/identity` (save/load progress)
- **API:** `/api/labs/identity/active` (current state)
- **API:** `/api/labs/identity/save` (persist answers)
- **API:** `/api/labs/identity/complete` (mark complete)

**Output:** Self-language, values anchors, identity statement

#### Lab 2: Meaning
- `/labs/meaning` — Interactive inquiry. "What impact matters? What guides you?"
- **API:** `/api/labs/meaning` (save/load)
- **API:** `/api/labs/meaning/active`
- **API:** `/api/labs/meaning/save`
- **API:** `/api/labs/meaning/complete`

**Output:** Purpose statement, impact areas, values alignment

#### Lab 3: Agency
- `/labs/agency` — Interactive inquiry. "What are you ready to do? What's your next move?"
- **API:** `/api/labs/agency` (save/load)
- **API:** `/api/labs/agency/active`
- **API:** `/api/labs/agency/save`
- **API:** `/api/labs/agency/complete`

**Output:** Action plan, next steps, agency statement

**Labs Hub:**
- `/labs` — Overview and navigation between labs

**User Question:** "Who am I? What matters? What can I do about it?"

**Outcome:**
- Three core self-understanding documents
- Progress tracked in dashboard
- User ready for integration

**Duration:** 60–90 minutes total (can be spread over days/weeks)  
**Access:** Gated (auth required)  
**Auth Required:** Yes

---

### STEP 7: INTEGRATION & CONSOLIDATION
**Goal:** User integrates lab insights into lived practice.

**Pages/Tools:**
- `/integration` — Guided reflection. Connect insights to life patterns, relationships, work
- **API:** `/api/integration` (save integration notes)

**User Question:** "How do I live this? Where does this show up?"

**Outcome:**
- Insights integrated into daily life narrative
- User ready for community + continuation

**Duration:** 10–20 minutes  
**Access:** Gated (auth required)  
**Auth Required:** Yes

---

### STEP 8: COMMUNITY & PEER CONNECTION
**Goal:** User connects with others in reflection and recognition.

**Pages/Tools:**
- `/community` — Community hub. Multiple spaces (general, reflections)
  - Space selector (general, reflections, etc.)
  - Post composer with rate limiting (20s between posts)
  - "Load more" pagination
  - Community guidelines panel
- `/community/post/[id]` — Single post view. Thread of comments
  - Comments (rate limited at 10s between comments)
  - Edit/delete for post owner
  - Threaded discussion

**APIs:**
- `POST /api/community/posts` — Create post
- `GET /api/community/posts` — List posts (cursor pagination)
- `GET /api/community/posts/[id]` — Get single post
- `PATCH /api/community/posts/[id]` — Edit/soft delete post
- `GET /api/community/posts/[id]/comments` — Get post + comments
- `POST /api/community/posts/[id]/comments` — Add comment

**User Question:** "Who else is on this path? Can I share and be seen?"

**Outcome:**
- User posts reflection or experience
- User reads and responds to others
- Feels community, breaks isolation
- Gains perspectives from peers

**Duration:** Open-ended (ongoing)  
**Access:** Gated (auth required)  
**Auth Required:** Yes  
**Moderation:** Guidelines panel shown; rate limits reduce spam

---

### STEP 9: ADVANCED TOOLS & CONTINUED PRACTICE
**Goal:** User deepens work through specialized tools and AI coaching.

**Pages/Tools:**

#### AI Tools
- `/ai-tools` — Tool hub navigation
- `/ai-tools/chat` — Main AI chat interface
- **APIs:** `/api/gpt`, `/api/gpt/stream` (streaming responses)

#### Specialized Tools
- `/soul` — Soul/archetype exploration (NEW, Jan 2026)
  - `/soul/chat` — Archetypal conversations
  - **APIs:** `/api/soul/checkin`, `/api/soul/practice`, `/api/soul/archetype`

- `/systems` — Systems thinking tool
  - `/systems/chat` — Systems conversation
  
- `/insights` — Personalized analytics
  - `/insights/chat` — Insights dialogue

- `/interpretation` — Guided interpretation/meaning-making

- `/creation` — Guided creative authoring

#### Daily Practice
- **API:** `/api/affirmation/today` — Daily affirmation (delivered)

**User Question:** "How do I go deeper? What's my next layer of work?"

**Outcome:**
- User explores specialized aspects (soul, systems, creativity)
- Builds ongoing practice through affirmations
- Uses AI as a reflection partner
- Deepens insights

**Duration:** Ongoing (optional, based on user depth preference)  
**Access:** Gated (auth required)  
**Auth Required:** Yes

---

### STEP 10: CONTINUATION & ECOSYSTEM EMBEDDING
**Goal:** User embeds iPurpose into ongoing practice and identity.

**Pages/Tools:**
- `/dashboard` — Home hub. Shows:
  - Lab completion status
  - Next steps
  - Community activity
  - Practice reminders
  - Affirmation of the day

- `/profile` — User profile, public presence in community

- `/settings` — Preferences, notification control

- **Ongoing engagement:**
  - Daily affirmation check-in
  - Community participation
  - Regular dashboard visits
  - Milestone recognition (future)

**User Question:** "How do I keep this alive? What's my next evolution?"

**Outcome:**
- User sees iPurpose as ongoing practice, not one-time course
- Continues community participation
- Deepens tools based on need
- Becomes guide for others (eventually)

**Duration:** Indefinite (lifetime value)  
**Access:** Gated (auth required)  
**Auth Required:** Yes

---

## JOURNEY MAP — VISUAL SUMMARY

```
┌─────────────────────────────────────────────────────────────────────┐
│ PUBLIC ENTRY (No Auth)                                              │
│ Step 1: Discovery → Step 2: Assessment → Step 3: Ethics             │
│ /  /discover  /about  /program  /ai-blueprint                       │
│ ↓                                                                     │
│ /clarity-check  →  /ethics  →  /starter-pack                        │
└─────────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│ SIGNUP & ONBOARDING (Auth Begins)                                   │
│ Step 4: Account → Step 5: Orientation                               │
│ /signup  /enroll/create-account → /onboarding → /orientation        │
└─────────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│ CORE JOURNEY (Gated)                                                │
│ Step 6: Labs                                                         │
│ /labs/identity → /labs/meaning → /labs/agency → /labs               │
│ (Each lab saves progress, shows in dashboard)                       │
└─────────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│ INTEGRATION (Gated)                                                 │
│ Step 7: Integration                                                 │
│ /integration → Consolidates lab insights                            │
└─────────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│ COMMUNITY & ADVANCED (Gated, Ongoing)                               │
│ Step 8: Community → Step 9: Tools                                   │
│ /community → /community/post/[id]                                   │
│ /dashboard (hub)                                                     │
│ /ai-tools/chat  /soul/chat  /systems/chat  /insights/chat           │
│ /interpretation  /creation                                          │
└─────────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│ CONTINUATION (Gated, Lifetime)                                      │
│ Step 10: Ecosystem Embedding                                       │
│ /dashboard (daily hub)  /profile  /settings                         │
│ Daily affirmations, community, practice                             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## TIMELINE & PACING

| Step | Phase | Duration | Access | Context |
|------|-------|----------|--------|---------|
| 1 | Discovery | 2–5 min | Public | Awareness |
| 2 | Assessment | 3–7 min | Public | Lead capture |
| 3 | Ethics | 3–5 min | Public | Trust building |
| 4 | Signup | 1–2 min | Public | Transaction |
| 5 | Onboarding | 5–10 min | Gated | System intro |
| 6 | Labs | 60–90 min | Gated | Core transformation |
| 7 | Integration | 10–20 min | Gated | Consolidation |
| 8 | Community | Open | Gated | Ongoing connection |
| 9 | Tools | Open | Gated | Optional deepening |
| 10 | Continuation | Lifetime | Gated | Embedding + growth |

**Total Onboarding Time:** ~2–3 hours (Steps 1–7)  
**Engagement Cycle:** Daily (Steps 8–10, indefinite)

---

## CRITICAL JOURNEY QUESTIONS

### 1. **Where does "Learning Path" fit?**
   - Current: `/learning-path`, `/learning-path/orientation`
   - Question: Is this a wrapper around labs or separate flow?
   - Action: Clarify in Sequencing document or consolidate

### 2. **When does user enter Community?**
   - Current: After integration (Step 8)
   - Question: Could community be earlier? During labs?
   - Action: Decide based on community moderation readiness

### 3. **What triggers Soul tools?**
   - Current: Available after Step 5 (auth)
   - Question: Is soul optional or required? When to recommend?
   - Action: Define unlock logic or milestones

### 4. **How do users discover Advanced Tools (AI, Systems, Insights)?**
   - Current: All available after auth
   - Question: Should discovery be sequential or free-form?
   - Action: Define navigation/recommendation logic

### 5. **What defines "Completion"?**
   - Current: Labs complete, but journey continues indefinitely
   - Question: Does user get "Certificate"? Recognition?
   - Action: Design completion moments and milestones (Phase 5 visibility)

### 6. **How do free/trial users differ?**
   - Current: Journey same for all post-signup
   - Question: Which features are paywall-gated?
   - Action: Monetization mapping will clarify (Phase 6)

---

## GAPS & CANDIDATES FOR REMOVAL

Based on this sequencing, the following routes are **NOT part of the core journey**:

- ❌ `/legacy` — Placeholder; no clear purpose
- ❌ `/test` — Internal testing; should be hidden
- ❌ `/development` — Unclear purpose; orphaned?
- ❌ `/google-review` — Single-purpose redirect (minor)
- ⚠️ `/ipurpose-6-week` — Possibly superseded by labs
- ⚠️ `/clarity-check-numeric` — Duplicate of clarity-check
- ⚠️ `/learning-path` — Unclear relationship to labs

---

## NAVIGATION MODEL (for Phase 5)

Once journey is locked, Phase 5 (Visibility Architecture) will define:

1. **Main Navbar** — Which pages visible at each step?
2. **Unlock Gates** — When do advanced tools appear?
3. **Milestone Reveals** — Do routes unlock at specific completion points?
4. **Admin-Only Routes** — Which endpoints hidden from users?
5. **Contextual Navigation** — Smart suggestions based on progress

---

## NEXT PHASES

- **Phase 4 (Pruning):** Which routes from inventory can be deprecated or merged?
- **Phase 5 (Visibility):** Which pages appear in nav at which stages?
- **Phase 6 (Monetization):** Which steps trigger paywalls? Which tier gets what?

---

## DOCUMENT METADATA

- **Created:** 2026-01-28
- **Scope:** User journey sequencing (no code changes)
- **Validation:** Requires human review on unlock gates and tool discovery logic
- **Next:** PRUNING_PLAN.md (Phase 4)

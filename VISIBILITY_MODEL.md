# Visibility Model — Navigation & Feature Access Architecture

**Generated:** January 28, 2026  
**Focus:** Define what pages/tools are visible to users at each journey stage  
**Scope:** Navigation strategy, unlock logic, access gates (no implementation)  

---

## Overview

This document defines:
- **Which pages appear in main navigation** at each user stage
- **Which features are unlocked** based on progress or tier
- **Which pages are hidden** by default (admin-only, advanced)
- **Which routes redirect** based on user state
- **Navigation messaging** (CTAs, prompts, milestone reveals)

---

## USER STATES

The visibility model operates on these user states:

1. **Anonymous** — Not logged in
2. **New Account** — Just signed up, no progress
3. **In Onboarding** — In /onboarding flow
4. **In Labs** — Actively working through Identity/Meaning/Agency
5. **Labs Complete** — All three labs finished
6. **Post-Integration** — Completed integration step
7. **Community Active** — Regular community participant
8. **Advanced User** — Using multiple tools (AI, systems, insights, soul)
9. **Mature User** — 3+ months active, deep engagement

---

## NAVIGATION VISIBILITY MODEL

### STAGE: ANONYMOUS (Not logged in)

**Visible Routes (Main Navbar):**
```
iPurpose (logo/home)
├── Explore
│   ├── /about
│   ├── /program
│   └── /discover
├── Learn
│   ├── /clarity-check
│   ├── /ai-blueprint
│   └── /starter-pack
├── Join
│   ├── /signup
│   ├── /login
│   └── /info-session
└── Legal
    ├── /ethics
    ├── /privacy
    └── /terms
```

**Hidden Routes:**
- All `/labs/*` (gated)
- All `/community/*` (gated)
- All `/ai-tools/*` (gated)
- `/dashboard` (gated)
- All `/soul/*` (gated)
- All `/systems/*` (gated)
- `/settings` (gated)
- `/profile` (gated)

**CTAs:**
- "Start Clarity Check" → `/clarity-check`
- "Download Starter Pack" → `/starter-pack`
- "Join iPurpose" → `/signup`
- "Read Our Ethics" → `/ethics`

**Redirects:**
- Attempt to access `/dashboard` → `/login`
- Attempt to access `/community` → `/login`

---

### STAGE: NEW ACCOUNT (Just signed up)

**Visible Routes (Main Navbar):**
```
iPurpose (logo/home)
├── Get Started
│   ├── /onboarding
│   └── /orientation
├── Account
│   ├── /profile
│   └── /settings
└── Info
    ├── /ethics
    ├── /privacy
    └── /terms
```

**Visible Pages (not in nav, but accessible via links):**
- `/onboarding` (if not yet completed)
- `/orientation` (once onboarding done)

**Hidden Routes:**
- `/labs/*` (visible after onboarding, but locked until orientation complete)
- `/community` (visible in nav, but locked)
- `/ai-tools` (hidden)
- `/soul` (hidden)
- `/systems` (hidden)
- `/insights` (hidden)
- `/integration` (hidden until labs complete)

**Messaging:**
- Banner: "Welcome! Start with Orientation → Labs → Community"
- CTA: "Start Orientation" (big button on dashboard)

**Redirects:**
- Auto-forward to `/onboarding` if not completed
- After onboarding → `/orientation`

---

### STAGE: IN ONBOARDING

**Visible Routes:**
- `/onboarding` (current)
- `/settings` (to adjust preferences during onboarding)
- Account info

**Hidden/Disabled:**
- All other routes are locked until onboarding completes
- Navbars simplified to focus user

**Flow:**
```
/onboarding 
  ↓ (accept terms, role selection, preferences)
  → Auto-forward to /orientation
```

---

### STAGE: IN LABS (Started labs, none complete)

**Visible Routes (Main Navbar):**
```
iPurpose (logo/home)
├── My Journey
│   ├── /dashboard
│   ├── /orientation (reference)
│   ├── /labs (hub)
│   │   ├── /labs/identity (current)
│   │   ├── /labs/meaning (locked)
│   │   └── /labs/agency (locked)
│   └── /profile
├── Account
│   └── /settings
└── Info
    ├── /ethics
    ├── /privacy
    └── /terms
```

**Dashboard Shows:**
```
✅ Onboarding: Complete
🔄 Identity Lab: In Progress (est. 20 min remaining)
⏳ Meaning Lab: Not Started
⏳ Agency Lab: Not Started
🔒 Community: Unlock after labs complete
```

**Hidden Routes:**
- `/community` (locked until labs complete)
- `/integration` (locked until labs complete)
- `/ai-tools` (hidden)
- `/soul` (hidden)
- `/systems` (hidden)
- `/insights` (hidden)

**Navigation Flow:**
```
/dashboard
  → [Identity Lab] → opens /labs/identity
  → [Meaning Lab] → locked (shows CTA to complete identity first)
  → [Agency Lab] → locked (shows CTA to complete meaning first)
```

**CTAs:**
- "Continue Identity Lab" (big button on dashboard)
- "Next: Meaning Lab" (after identity completes)

---

### STAGE: LABS COMPLETE (All three labs finished)

**Visible Routes (Main Navbar):**
```
iPurpose (logo/home)
├── My Journey
│   ├── /dashboard
│   ├── /integration (NEW - now unlocked)
│   ├── /community (NEW - now unlocked)
│   └── /profile
├── Tools (NEW section)
│   └── /ai-tools
└── Account
    └── /settings
```

**Dashboard Shows:**
```
✅ Onboarding: Complete
✅ Identity Lab: Complete
✅ Meaning Lab: Complete
✅ Agency Lab: Complete
🔄 Integration: In Progress
📢 Community: Available
🔧 Tools: Available
```

**Newly Visible Routes:**
- `/integration` (post-lab consolidation)
- `/community` (peer connection)
- `/ai-tools` (all tools unlocked)
- `/soul` (recommended as optional deepening)

**Hidden Routes:**
- Still don't see: `/systems`, `/insights` (revealed in next stage)

**CTAs:**
- "Complete Integration Step" (primary CTA)
- "Join Community" (secondary CTA)
- "Explore AI Tools" (tertiary CTA)

---

### STAGE: POST-INTEGRATION (Integration step complete)

**Visible Routes (Main Navbar):**
```
iPurpose (logo/home)
├── My Journey
│   ├── /dashboard
│   ├── /community
│   └── /profile
├── Tools
│   ├── /ai-tools/chat
│   ├── /soul
│   ├── /systems (NEW - revealed)
│   ├── /insights (NEW - revealed)
│   └── Advanced Tools
│       ├── /creation
│       ├── /interpretation
└── Account
    └── /settings
```

**Dashboard Shows:**
```
✅ Full Journey Complete
📢 Community: Active
🔧 Tools: Full Suite Available
💡 "Your Next Step" (AI-recommended based on interests)
```

**Newly Visible:**
- `/systems` (systems thinking tool)
- `/insights` (personalized analytics)
- `/creation` (guided authoring)
- `/interpretation` (meaning-making deepening)

**Hidden Routes:**
- None major; all core features now visible

**Messaging:**
- "Your core journey is complete. Deepen with tools or connect in community."

---

## UNLOCK GATES & LOGIC

### Gate 1: Auth-Gated Routes
These require session cookie (`FirebaseSession`):
```
/dashboard
/labs/*
/community
/integration
/profile
/settings
/ai-tools/*
/soul/*
/systems/*
/insights/*
/creation
/interpretation
/onboarding
```

**Implementation:** Middleware checks session → if missing, redirect to `/login`

---

### Gate 2: Onboarding-Gated Routes
Require onboarding completion before accessing labs:
```
/orientation
/labs/*
/integration
/community
```

**Implementation:** AuthContext checks `user.onboardingStep >= 1` → if not, force `/onboarding`

---

### Gate 3: Lab-Progress-Gated
Labs must be completed in sequence before accessing community/integration:
```
/integration → Requires all 3 labs complete
/community → Requires all 3 labs complete
/soul, /systems, /insights → Recommended after labs, but optional
```

**Implementation:** 
- Dashboard queries Firestore for lab completion status
- `/api/labs/complete/route.ts` returns completion flags
- Client-side: if labs incomplete, show lock icon with "Complete labs first" CTA

---

### Gate 4: Admin-Only Routes
Restricted to admin role:
```
/api/admin/*
/api/_admin/*
```

**Implementation:** `requireUser()` middleware checks `user.role === 'admin'` → 403 if not

---

## NAVIGATION MENU COMPONENT LOGIC

### Main Navbar Conditional Rendering

```typescript
// Pseudocode for navbar visibility

if (!user) {
  // Anonymous: show Learn, Explore, Join sections
  return AnonymousNav()
}

if (user && !userState.onboardingComplete) {
  // In Onboarding: simplified nav, focus on onboarding
  return OnboardingNav()
}

if (user && userState.labsInProgress) {
  // Active Labs: show labs hub, dashboard, limited tools
  return LabsNav()
}

if (user && userState.labsComplete && !userState.integrationComplete) {
  // Post-Labs: unlock integration, community, basic tools
  return PostLabsNav()
}

if (user && userState.allComplete) {
  // Mature User: full nav, all tools visible
  return FullNav()
}
```

---

## UNLOCK TRIGGERS

### Automatic Unlocks (Milestone-Based)

| When | Then | Visible |
|------|------|---------|
| User signs up | Onboarding required | `/onboarding` |
| Onboarding complete | Start labs path | `/orientation`, `/labs` |
| Identity lab complete | Meaning lab unlocks | `/labs/meaning` |
| Meaning lab complete | Agency lab unlocks | `/labs/agency` |
| All labs complete | Integration + community unlock | `/integration`, `/community`, `/ai-tools` |
| Integration complete | Full tools suite + soul visible | `/systems`, `/insights`, `/soul` |

### Manual/Optional Reveals

| Tool | When Visible | Logic |
|------|--------------|-------|
| `/ai-tools/chat` | After labs complete | Optional deepening tool |
| `/soul` | After labs complete | Recommended if user shows introspection interest |
| `/creation` | After labs complete | Available but not highlighted |
| `/interpretation` | After integration complete | Deepening tool |

---

## HOMEPAGE BEHAVIOR (/)

### Anonymous User
Shows:
- Landing page with value prop
- CTAs: Clarity Check, Learn More, Join
- Nav with Explore, Learn, Join sections

### New Account (No Progress)
Redirects to `/dashboard` or shows:
- Welcome message
- "Start Here" button → `/onboarding` or `/orientation`
- Quick nav to account settings

### In Labs
Shows:
- Dashboard overview
- Current lab progress
- "Continue [Current Lab]" CTA

### Labs Complete
Shows:
- "Congratulations! Your core journey is complete"
- Next options: Integration, Community, Tools
- Recommended next step based on interests

### Mature User
Shows:
- Dashboard with daily affirmation
- Community activity feed (recent posts)
- Tool recommendations
- Continuation prompts

---

## FOOTER VISIBILITY

**All Stages:**
```
Contact | Privacy | Terms | Ethics
```

**Anonymous:**
```
About | Program | Discover | Blog (if exists)
```

**Authenticated:**
```
Help | Feedback | Profile Settings
```

---

## ADMIN-ONLY ROUTES (Hidden from Users)

```
/api/admin/affirmations
/api/admin/status
/api/_admin/status
/api/_dev/fallback

Hidden pages:
/test (internal, noindex)
/development (unclear; possibly admin)
```

**Implementation:** Admin panel (future) at `/admin` (not yet built)

---

## SYSTEM-ONLY ROUTES (Not User-Accessible)

```
/api/auth/webhook (Stripe)
/api/stripe/webhook
/api/health (monitoring)
```

**Note:** These return data but don't render pages; accessed by systems/monitoring

---

## MESSAGING & PROGRESSIVE DISCLOSURE

### Discovery Methodology

Rather than showing all tools at once, reveal progressively:

1. **Onboarding:** "You're going to explore three areas: Who you are, what matters, and what you can do."
2. **After Identity:** "Great! Now let's clarify what matters to you."
3. **After Meaning:** "Last step: What are you ready to do about this?"
4. **After Labs:** "Your insights are locked in. Let's integrate them into your life."
5. **After Integration:** "Ready to connect with others? The community is here."
6. **In Community:** "Deepen with our tools: AI Coach, Systems Thinking, Soul Work, Creative Expression."

### CTAs by Stage

| Stage | Primary CTA | Secondary CTA | Tertiary CTA |
|-------|-------------|---------------|--------------|
| Anonymous | Start Clarity Check | Learn More | Join |
| Onboarding | Complete Onboarding | (save preferences) | — |
| Labs Start | Continue Identity Lab | Read Orientation | — |
| Labs Active | Complete [Current Lab] | View Progress | Visit Community |
| Labs Done | Complete Integration | Join Community | Explore Tools |
| Post-Integration | Share in Community | Explore Systems Tool | Use AI Coach |
| Mature | Daily Affirmation | Community Activity | Choose a Tool |

---

## NAVIGATION PATTERNS

### Breadcrumb Trails (show context)
```
Home > Dashboard > Labs > Identity Lab
Home > Community > Post #42 > Comments
Home > Tools > AI Chat
```

### "What's Next?" Suggestions (contextual)
```
You completed Identity Lab → Next: Meaning Lab (est. 30 min)
You completed all labs → Next: Integration (est. 15 min)
You completed integration → Next: Share in Community or Explore Tools
```

### Milestone Markers
```
✅ Onboarding (complete)
🔄 Identity Lab (in progress, 70% done)
⏳ Meaning Lab (not started)
🔒 Community (locked until labs complete)
```

---

## EDGE CASES & REDIRECTS

### Attempt to Access Gated Route When Not Logged In
```
User visits /community
  ↓ (no session cookie)
  Middleware redirects to /login
  After login → redirect back to /community
```

### Attempt to Access Gated Route Before Prerequisites
```
User visits /integration
  ↓ (logged in but labs not complete)
  Page checks user state
  Shows: "Complete all labs first" + link to current lab
  Option: Auto-redirect to /dashboard
```

### Admin Attempting to Access User Content
```
User visits /api/admin/affirmations
  ↓ (has session but not admin)
  API returns 403 Forbidden
  No client route to access
```

### Logged-In User Visits /login or /signup
```
User visits /login
  ↓ (has valid session)
  Redirect to /dashboard
  (avoid confusing logged-in users)
```

---

## TESTING VISIBILITY MODEL

### Test Cases

- [ ] Anonymous user cannot access `/dashboard`
- [ ] New account auto-forwards to `/onboarding`
- [ ] In-lab user cannot access `/community`
- [ ] Complete user can see all tools in navbar
- [ ] Non-admin cannot access `/api/admin/*`
- [ ] Breadcrumbs show correct path
- [ ] "What's Next?" suggestions match progress state
- [ ] Milestone markers accurately reflect completion status

---

## FUTURE ENHANCEMENTS

### Phase 6+ Considerations
- **Milestone Recognition:** Special badges/messages at key completion points
- **Personalized Paths:** Different routes based on user interests
- **Accessibility:** Screen reader support for nav structure
- **Mobile Nav:** Simplified menu for mobile users (no horizontal overflow)
- **Dark Mode:** Alternative nav styling if dark mode added
- **Localization:** Nav text translated for international users

---

## DOCUMENT METADATA

- **Created:** 2026-01-28
- **Scope:** Visibility & navigation architecture (no code changes)
- **Implementation:** Requires navigation component refactor + auth state checks
- **Dependencies:** USER_JOURNEY_SEQUENCE.md, PRUNING_PLAN.md, SYSTEM_INVENTORY.md
- **Next:** MONETIZATION_MAP.md (Phase 6)
- **Validation:** Requires UX/product review of unlock gates and messaging

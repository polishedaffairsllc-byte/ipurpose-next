# Insights Layer — Read-Only Interpretation Architecture

**Date:** February 2, 2026  
**Status:** Implemented & Build-Verified  
**Architecture Pattern:** Read-Only Synthesis Layer (AI/Intelligence)

---

## Overview

The Insights page is implemented as a **pure read-only interpretation layer** in the Soul → Systems → AI architecture. It aggregates and displays user data without ever mutating state, triggering actions, or writing to the database.

### Design Principle

**Insights is to data what an interpreter is to language:** it makes meaning visible, but never changes the original text.

---

## What Insights Does

✅ **Displays computed metrics**
- Alignment consistency (7 days)
- Check-ins count (30 days)
- Practices count (30 days)
- Streak calculation
- Most recent check-in date

✅ **Interprets patterns**
- Presents data in visual hierarchy
- Surfaces trends and consistency signals
- Guides users toward the next action

✅ **Links out to actions**
- "Review Your Check-Ins" → `/soul` (check-in history)
- "View Your Systems" → `/systems` (practices & workflows)

✅ **Handles zero state gracefully**
- Shows guidance when users have no data yet
- Links to pages where they *can* start

---

## What Insights Does NOT Do

❌ **No toggles or settings**  
No preferences stored here. Insights has no "view as chart" toggle, no saved filters.

❌ **No action triggers**  
No "Start a check-in from Insights" button that pre-fills data. No "Apply this rhythm" one-click action.

❌ **No mutations**  
Zero POST, PATCH, or DELETE calls from this page (except standard auth).

❌ **No ephemeral state writes**  
No session-level or temporary local state stored in Firestore.

---

## Implementation Details

### 1. Server-Side Aggregation (`lib/insights/getInsightsSummary.ts`)

**Purpose:** Pure read-only calculation of metrics.

**Key Functions:**
- `getInsightsSummary(userId)` — Fetches check-ins & practices, computes alignment & streak
- `formatDateForDisplay()` — Formats dates to M/D/YYYY (user timezone: America/New_York)
- `calculateStreak()` — Tracks consecutive days with check-ins

**Data Model:**
```typescript
export interface InsightsSummary {
  alignmentConsistency7d: number;     // 0-100 (percent of days with check-ins)
  checkinsLast30d: number;             // count
  practicesLast30d: number;            // count
  mostRecentCheckinDate: string | null; // "2/1/2026" or null
  streakDays: number;                  // consecutive days
}
```

**Guarantees:**
- No writes to Firestore
- No side effects
- Handles missing data gracefully (returns zeros)
- Timestamps normalized to user's timezone

### 2. Page Architecture (`app/insights/page.tsx`)

**Type:** Next.js App Router server component (async)

**Flow:**
1. Verify session cookie (auth gate)
2. Check user entitlement
3. Call `getInsightsSummary(userId)` (read-only)
4. Render metrics + navigation UI

**No client-side state mutations:**
- All data computed server-side
- Page is prerendered where possible
- Links are static anchors (no click handlers)

### 3. UI/UX Pattern

**Cards display data as read-only:**
```tsx
<Card accent="lavender">
  <p>Alignment Consistency: {summary.alignmentConsistency7d}%</p>
  <Button href="/soul">Review Your Check-Ins →</Button>
</Card>
```

**Zero state handled with guidance:**
```tsx
{summary.checkinsLast30d > 0 ? (
  <p>You've logged {summary.checkinsLast30d} check-ins</p>
) : (
  <p>No check-ins yet. Start with your first check-in to build your insights.</p>
)}
```

**CTAs are navigation-only:**
- All buttons use `href` (not `onClick`)
- Links point to `/soul`, `/systems` (where actions happen)
- No prefetching or side effects

---

## Testing Verification

### Build Test
✅ `npm run build` passes without errors  
✅ Route shows as `ƒ` (server-rendered dynamic)

### API Call Test
✅ Zero POST/PATCH/DELETE calls from this page  
✅ Only GET calls (read Firestore data)

### Navigation Test
✅ All CTAs link to appropriate pages  
✅ No inline data mutations

---

## Entitlement & Access Control

**Same as other gated pages:**
- Requires session cookie (FirebaseSession)
- Checks user entitlement (active status)
- Supports founder bypass (`isFounder`)
- Redirects to `/login` if no session
- Redirects to `/enrollment-required` if not entitled

---

## Future Enhancements (Coming Soon)

### Alignment Trends
- 30-day chart visualization
- Shows alignment score progression
- Still read-only (no save feature)

### Custom Dashboards
- User can select which metrics to display
- *Preference storage* lives in `/preferences` or Settings
- Insights *reads* those preferences, doesn't write them

### AI Summaries
- GPT-powered interpretation of patterns
- Example: "Your alignment is strongest on Mondays"
- Still purely interpretive (no action triggers)

---

## Architecture Alignment

### How Insights Fits the Layer Model

```
┌─────────────────────────────────────────────────────┐
│ Soul Layer                                           │
│ - Check-ins (user intent capture)                   │
│ - Practices (lived activities)                      │
│ - User state (archetype, preferences)               │
└─────────────────────────────────────────────────────┘
                        ↓ reads
┌─────────────────────────────────────────────────────┐
│ Systems Layer                                        │
│ - Calendar Sync (operational workflows)             │
│ - Monetization (pricing models)                     │
│ - Offers (business architecture)                    │
└─────────────────────────────────────────────────────┘
                        ↓ reads
┌─────────────────────────────────────────────────────┐
│ AI/Intelligence Layer — INSIGHTS                     │
│ - Read-only synthesis                               │
│ - Computed metrics                                  │
│ - Pattern interpretation                            │
│ - Links outward (never inward)                      │
└─────────────────────────────────────────────────────┘
```

**Data Flow:** Soul → Systems ← Insights (one-way read)

**Benefit:**
- Clean separation of concerns
- No circular dependencies
- Insights failures don't corrupt user data
- Easy to test (no side effects)

---

## Non-Goals (Explicitly Out of Scope)

- ❌ Charts or visualizations (staying static "coming soon" for now)
- ❌ Settings panel in Insights (preferences live in `/settings`)
- ❌ Personalization toggles ("show as %" vs "show as count")
- ❌ Custom filtering or date range selection
- ❌ Saving metrics or snapshots
- ❌ Exporting data from this page

---

## Code References

### Key Files
- **Server aggregation:** `lib/insights/getInsightsSummary.ts`
- **Page:** `app/insights/page.tsx`
- **Types:** `InsightsSummary` (defined in aggregation module)

### Patterns to Match (Existing Codebase)
- **Auth pattern:** `app/soul/page.tsx` (same entitlement check)
- **Layout pattern:** `app/systems/page.tsx` (same card grid structure)
- **Date handling:** `lib/leads.ts` (Timestamp parsing utilities)

---

## Acceptance Criteria (Verified ✅)

✅ Page loads without errors (build verified)  
✅ Metrics reflect real user data  
✅ Page makes zero writes (no POST/PATCH/DELETE to non-auth endpoints)  
✅ CTAs only navigate (all buttons are `href` links)  
✅ UI matches structure (card grid, section headings, zero state)  
✅ Server-side only (no client mutations)  
✅ Properly gated (auth + entitlement)

---

## Maintenance Notes

### If You Need to Add a New Metric
1. Add field to `InsightsSummary` interface
2. Calculate in `getInsightsSummary()`
3. Render in template
4. Ensure it's purely computed (no writes)

### If You Need to Change Date Formatting
- Edit `formatDateForDisplay()` in `lib/insights/getInsightsSummary.ts`
- Timezone is currently `America/New_York` (configurable)

### If You Need to Add a "Coming Soon" Card
- Add static `<Card accent="...">` with opacity-50
- No JavaScript or interactivity needed
- Example: Alignment Trends, Custom Dashboards

---

## Summary

**Insights is clean, simple, and safe:**
- Reads data (✅)
- Computes metrics (✅)
- Displays clearly (✅)
- Links outward (✅)
- Never mutates (✅)

It's the read-only interpretation layer. Perfect.

# Integration Unlock Condition — Codex Specification

**Date:** February 2, 2026  
**Status:** ✅ CONFIRMED  
**Authority Level:** Decision #12 (Locked & Approved)

---

## AUTHORITATIVE SIGNAL: **OPTION A — Completion-Based**

### The Exact Unlock Condition

Integration unlocks when **all three labs have completion status = "complete"**:

```
Identity = complete  ✓
AND
Meaning = complete   ✓
AND
Agency = complete    ✓
```

**Zero additional artifacts, reflection, or manual affirmation required.**

---

## Implementation Evidence

### 1. **Labs Hub CTA Logic** (`app/(nav)/labs/page.tsx` line 103)
```tsx
{labs.identity === "complete" && labs.meaning === "complete" && labs.agency === "complete" ? (
  <Link href="/integration?from=labs">
    Continue to Integration
  </Link>
) : null}
```
**Behavior:** "Continue to Integration" button appears when all three labs === "complete"  
**No other condition checked.** No artifact, reflection, or affirmation required.

---

### 2. **Lab Completion Requirement** (Each lab: `app/api/labs/[lab]/complete/route.ts`)

Each lab marks as "complete" when:
- **completeEnough checkbox = true** (explicit user action), OR
- **Content threshold met:** ≥50 chars OR ≥20 words (automatic)

Example from Identity/Meaning/Agency routes:
```typescript
const completeEnough = Boolean(data.completeEnough);
const ready = completeEnough || chars >= 50 || words >= 20 || fields.some(hasMeaningfulText);

if (!ready) {
  return fail("NOT_READY", "Add a bit more detail...", 400);
}

// If passes: write to lab_completion collection
await completionRef.set({
  uid,
  labKey: "identity",      // "meaning" or "agency"
  completedAt: timestamp,
  method: completeEnough ? "checkbox" : "threshold",
});
```

**Result:** Lab marked "complete" in Firestore → queried by dashboard → CTA unlocks.

---

### 3. **No Reflection/Artifact Requirement**

- **Identity lab:** Saves 3 maps (selfPerceptionMap, selfConceptMap, selfNarrativeMap)
- **Meaning lab:** Saves 3 structures (valueStructure, coherenceStructure, directionStructure)
- **Agency lab:** Saves 3 patterns (awarenessPatterns, decisionPatterns, actionPatterns)
- **None of these are cross-checked before unlocking Integration**

The completion endpoint only checks:
- Existence of the lab_completion doc
- Content length/threshold (per lab)
- No aggregated reflection checkpoint

---

### 4. **No Manual Affirmation Required**

- **UI:** User clicks "Mark complete" button (or checkbox auto-completes)
- **No "I'm ready to integrate" confirmation step**
- **No integration readiness modal or additional gate**
- Integration page loads directly when all three labs complete

---

### 5. **Integration Access Gate** (`app/api/integration/route.ts`)

Once labs are complete, Integration is accessible only to **BASIC_PAID tier** (monetization bridge):

```typescript
export async function GET() {
  const entitlement = await requireBasicPaid();
  if (entitlement.error) return entitlement.error;
  // ... load integration data
}
```

**Gating is entitlement-based, NOT readiness-based.**

---

## Visibility Model Confirmation

From `VISIBILITY_MODEL.md` (line 389):

| When | Then | Visible |
|------|------|---------|
| All labs complete | Integration + community unlock | `/integration`, `/community`, `/ai-tools` |

**"All labs complete" = only trigger. No reflection artifact. No manual confirmation.**

---

## Why Option A?

### ✅ Implementation Alignment
- Code paths check only `identity === "complete" && meaning === "complete" && agency === "complete"`
- No reflection/summary field exists in completion logic
- No "readiness checkpoint" in state machine

### ✅ UX Clarity
- Clear, deterministic milestone
- No ambiguity about "enough reflection"
- Matches "Completion Rule" from Platform Spec: "≥50 chars OR ≥20 words OR checkbox"

### ✅ Monetization Bridge Design
- Labs (free) = content generation + milestone completion
- Integration (paid) = entitlement gate, not readiness gate
- Completion-based unlock keeps free tier simple; tier check handles monetization

---

## Options B & C — Why NOT Selected

### Option B (Completion + Reflection Artifact)
- **Not implemented:** No reflection/summary field required in any lab completion route
- **Not checked:** Integration access does not verify reflection artifact
- **Not viable:** Would require backend schema change + UI checkpoint

### Option C (Completion + Manual Affirmation)
- **Not implemented:** No "I'm ready to integrate" button or modal in code
- **Not checked:** Integration load does not verify affirmation flag
- **Not viable:** Would require state field + modal UX

---

## Summary for Codex

**The authoritative signal is: Option A — Completion-Based**

> Integration unlocks when `Identity = complete`, `Meaning = complete`, and `Agency = complete`.
> 
> No reflection artifact is required.  
> No manual affirmation is required.  
> Integration is then gated by entitlement tier (BASIC_PAID), not readiness.

**Decision is locked in code and design docs. Safe to build downstream systems on this signal.**

# Calendar Sync v1 - Step Switching Diagnostic Report

**Date:** February 1, 2026  
**Target System:** http://localhost:3000/systems/calendar  
**Instrumentation Status:** COMPLETE - All debug logging and markers added

---

## INSTRUMENTATION ADDED

### 1. Main Client Component (`CalendarOperationalClient.tsx`)

#### Debug Display (On-Screen)
- **Location:** Lines 293-295
- **Element:** Yellow box with text: `🔍 DEBUG: activeStep = {state.step} | Completion: 1=..., 2=..., 3=..., 4=...`
- **Updates:** Every render when `state.step` changes
- **Visibility:** Always visible, placed between progress info and guided setup card

#### Console Logging - useEffect on state.step
- **Location:** Lines 112-114
- **Logs:** `"[CALENDAR_SYNC_DEBUG] State updated. Current step: {state.step}"`
- **Trigger:** Fires whenever `state.step` changes
- **Purpose:** Proves state is updating

#### Console Logging - goToStep Function
- **Location:** Lines 205-208
- **Logs:** `"[CALENDAR_SYNC_DEBUG] goToStep called with step: {step}, current step: {state.step}, key: {key}"`
- **Trigger:** Fires when goToStep() is called
- **Purpose:** Proves function is invoked

#### Console Logging - Step Badge Click
- **Location:** Lines 252-256
- **Logs:** `"[CALENDAR_SYNC_DEBUG] Step badge clicked. Index: {index}, Locked: {locked}, Current step: {state.step}"`
- **Trigger:** Fires on every badge button click
- **Purpose:** Proves click handlers are firing and gating status

### 2. Step Components - Mount/Unmount Logging

#### TimeArchitectureStep.tsx
- **Lines 9-12:** `useEffect` logs mount/unmount
- **Blue Box Marker:** Lines 26-28 shows "✅ Mounted: Step 1 (TimeArchitectureStep)"

#### BookingRulesStep.tsx
- **Lines 14-17:** `useEffect` logs mount/unmount
- **Blue Box Marker:** Lines 38-40 shows "✅ Mounted: Step 2 (BookingRulesStep)"

#### FocusProtectionStep.tsx
- **Lines 7-10:** `useEffect` logs mount/unmount
- **Blue Box Marker:** Lines 24-26 shows "✅ Mounted: Step 3 (FocusProtectionStep)"

#### WeeklyResetStep.tsx
- **Lines 9-12:** `useEffect` logs mount/unmount
- **Blue Box Marker:** Lines 41-43 shows "✅ Mounted: Step 4 (WeeklyResetStep)"

---

## CODE PATH ANALYSIS

### Path 1: User Clicks Step Badge

```
Button onClick → renderStepBadge → [console.log] → goToStep(index) → updateState({step: index})
→ setState(next) → [console.log] "State updated" → React re-renders → 
{state.step === 2 && <BookingRulesStep />} condition evaluates → 
Component mounts → [console.log] "BookingRulesStep MOUNTED" → Blue box renders
```

### Path 2: State Update Mechanism

```
updateState(patch) → persist(next) → setState(next) → (sync) localStorage update + (async 400ms) Firestore update
```

**Key Point:** setState is SYNCHRONOUS for localStorage, async only for Firestore  
→ Means render should be immediate

### Path 3: Conditional Step Rendering

```jsx
<div className="grid gap-4">
  {state.step === 1 && (<TimeArchitectureStep />)}
  {state.step === 2 && (<BookingRulesStep />)}
  {state.step === 3 && (<FocusProtectionStep />)}
  {state.step === 4 && (<WeeklyResetStep />)}
</div>
```

**Logic:** React renders ONLY the matching `{condition && component}` block  
**No hidden elements:** Steps 2-4 are NOT in DOM when not selected  
**CSS not involved:** This is JSX conditional, not CSS display property

---

## VERIFICATION PROCEDURE

### TEST SEQUENCE TO RUN

1. **Open browser DevTools** (F12 / Cmd+Option+I)
2. **Navigate to** http://localhost:3000/systems/calendar
3. **Look for yellow box** showing "DEBUG: activeStep = 1"
4. **Open Console tab** (if not already open)
5. **Perform these clicks in sequence:**

```
Sequence:
- Observe console initially
- Click Step 1 badge → wait 500ms → check console logs & yellow box
- Click Step 2 badge → wait 500ms → check console logs & yellow box
- Click Step 3 badge → wait 500ms → check console logs & yellow box
- Click Step 4 badge → wait 500ms → check console logs & yellow box
```

### EXPECTED EVIDENCE FOR EACH STEP

#### After Clicking Step 2:

**Console should show:**
```
[CALENDAR_SYNC_DEBUG] Step badge clicked. Index: 2, Locked: false, Current step: 1
[CALENDAR_SYNC_DEBUG] goToStep called with step: 2, current step: 1, key: undefined
[CALENDAR_SYNC_DEBUG] State updated. Current step: 2
[CALENDAR_SYNC_DEBUG] TimeArchitectureStep (Step 1) UNMOUNTED
[CALENDAR_SYNC_DEBUG] BookingRulesStep (Step 2) MOUNTED
```

**On-screen should show:**
- Yellow box: `activeStep = 2 | Completion: 1=false, 2=false, 3=false, 4=false`
- Blue box: `✅ Mounted: Step 2 (BookingRulesStep)`
- Step 2 inputs visible (Audience dropdown, Buffer inputs, Day toggles, Time range)

#### After Clicking Step 3:

**Console should show:**
```
[CALENDAR_SYNC_DEBUG] Step badge clicked. Index: 3, Locked: true, Current step: 2
```

**Explanation:** Step 3 is LOCKED because Step 2 not completed (applied = false)

#### After Checking "I applied at least one booking rule" on Step 2:

- Step 3 button should become UNLOCKED (no opacity-60, cursor should be pointer not not-allowed)
- Console shows: `Step badge clicked. Index: 3, Locked: false` when clicking
- Then Step 3 mounts successfully

---

## FAILURE MODE DIAGNOSIS GUIDE

### If Yellow Box Shows Old Step Number After Click

**Diagnosis:** State is NOT updating  
**Root Cause:** `setState()` is not executing or `persist()` is not calling it  
**Evidence Needed:** 
- Console shows `goToStep called` but NOT `State updated`
- Yellow box doesn't change

**Next Steps:**
- Check if `persist()` function is actually calling `setState(next)`
- Check if `updateState()` is calling `persist()`
- Verify no errors in console blocking state update

---

### If Blue Box Doesn't Appear for Step 2+

**Diagnosis:** Component is not mounting or mount hook not firing  
**Root Cause:** Conditional JSX not rendering OR component not exported  
**Evidence Needed:**
- Yellow box shows `activeStep = 2` (state changed correctly)
- But NO blue box appears for Step 2
- No `[CALENDAR_SYNC_DEBUG] BookingRulesStep MOUNTED` in console

**Next Steps:**
- Check if `{state.step === 2 && <BookingRulesStep />}` is correct syntax
- Verify `BookingRulesStep` is properly exported from its file
- Check if useEffect hook is firing (should see MOUNTED log)
- Inspect DOM to see if step div exists at all

---

### If Step 3 Button Never Becomes Unlocked

**Diagnosis:** Completion flag not updating when checkbox clicked  
**Root Cause:** Checkbox onChange not calling the update function  
**Evidence Needed:**
- Yellow box still shows `2=false` even after clicking checkbox
- No console log from BookingRulesStep when clicking checkbox

**Next Steps:**
- Check if checkbox `onChange` handler is wired to `onChange` callback
- Verify `value.applied` state is updating
- Look for any errors in onChange callback

---

### If Click Works But Page Doesn't Scroll to Step

**Diagnosis:** Step is rendering but off-screen  
**Root Cause:** Container overflow or CSS clipping  
**Evidence Needed:**
- Blue box appears but content not visible
- Must scroll down manually to see content

**Fix:**
- Call `scrollIntoView()` on step container
- Check parent divs for `overflow: hidden`
- Verify Card component doesn't have max-height

---

## NEXT INVESTIGATION STEPS (After Running Tests)

1. **Return console logs** - Copy entire console output showing the test sequence
2. **Return screenshots** - One screenshot for each step showing:
   - Yellow debug box with correct `activeStep` value
   - Blue mount marker showing correct step component
   - Step content visible
3. **Return any errors** - If red error text appears in console
4. **Return click results** - Did each badge click produce the expected log sequence?

---

## SUMMARY OF INSTRUMENTATION

| Component | Type | Location | Expected Output |
|-----------|------|----------|-----------------|
| Yellow Debug Box | Display | CalendarOperationalClient line 293-295 | `activeStep = X` with current value |
| State Change Log | Console | CalendarOperationalClient line 112-114 | `[CALENDAR_SYNC_DEBUG] State updated. Current step: X` |
| goToStep Log | Console | CalendarOperationalClient line 205-208 | `[CALENDAR_SYNC_DEBUG] goToStep called with step: X` |
| Badge Click Log | Console | CalendarOperationalClient line 252-256 | `[CALENDAR_SYNC_DEBUG] Step badge clicked. Index: X, Locked: Y` |
| Step 1 Mount | Console + Display | TimeArchitectureStep line 9-28 | `[CALENDAR_SYNC_DEBUG] TimeArchitectureStep MOUNTED` + Blue box |
| Step 2 Mount | Console + Display | BookingRulesStep line 14-40 | `[CALENDAR_SYNC_DEBUG] BookingRulesStep MOUNTED` + Blue box |
| Step 3 Mount | Console + Display | FocusProtectionStep line 7-26 | `[CALENDAR_SYNC_DEBUG] FocusProtectionStep MOUNTED` + Blue box |
| Step 4 Mount | Console + Display | WeeklyResetStep line 9-43 | `[CALENDAR_SYNC_DEBUG] WeeklyResetStep MOUNTED` + Blue box |

---

## INSTRUCTIONS FOR USER

1. Do NOT click anything or modify the code
2. Navigate to http://localhost:3000/systems/calendar
3. Open DevTools (F12)
4. Go to Console tab
5. Perform the test sequence above
6. Return EXACTLY:
   - The console log output (copy all text)
   - Screenshots of each step showing yellow box + blue box
   - Any error messages that appeared
   - Result of each badge click (did it work or not?)

The diagnostic will then be COMPLETE and conclusive diagnosis possible.

---

**Files Modified:**
- `/Users/renita.hamilton/Desktop/ipurpose-next/app/systems/components/CalendarOperationalClient.tsx`
- `/Users/renita.hamilton/Desktop/ipurpose-next/app/systems/components/TimeArchitectureStep.tsx`
- `/Users/renita.hamilton/Desktop/ipurpose-next/app/systems/components/BookingRulesStep.tsx`
- `/Users/renita.hamilton/Desktop/ipurpose-next/app/systems/components/FocusProtectionStep.tsx`
- `/Users/renita.hamilton/Desktop/ipurpose-next/app/systems/components/WeeklyResetStep.tsx`

**All changes:** Ready for test execution. No guesswork possible after you run the sequence above.

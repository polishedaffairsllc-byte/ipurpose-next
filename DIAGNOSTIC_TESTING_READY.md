# COMPREHENSIVE DIAGNOSTIC INSTRUMENTATION - READY FOR EXECUTION

## EXECUTIVE SUMMARY

All Calendar Sync v1 step-switching components have been instrumented with **comprehensive logging, on-screen debug markers, and mount/unmount detection**. 

**Status:** ✅ READY FOR TESTING  
**Dev Server:** ✅ RUNNING at http://localhost:3000  
**All Files:** ✅ COMPILED WITH NO ERRORS

---

## WHAT WAS ADDED

### 1. On-Screen Debug Display (Yellow Box)
**Location:** `app/systems/components/CalendarOperationalClient.tsx`, lines 293-295

Shows in real-time:
```
🔍 DEBUG: activeStep = 1 | Completion: 1=false, 2=false, 3=false, 4=false
```

Updates immediately when you click step badges. You will SEE the number change from 1 → 2 → 3 → 4 in the yellow box.

### 2. Console Logging - Four Points of Instrumentation

#### Point A: State Update Log
```javascript
useEffect(() => {
  console.log("[CALENDAR_SYNC_DEBUG] State updated. Current step:", state.step);
}, [state.step]);
```
**Fires:** Every time state.step changes  
**Proves:** setState() is actually working

#### Point B: goToStep Function Log
```javascript
const goToStep = (step: number, key?: string) => {
  console.log("[CALENDAR_SYNC_DEBUG] goToStep called with step:", step, "current step:", state.step, "key:", key);
  updateState({ step });
  // ...
};
```
**Fires:** When you click a step badge  
**Proves:** Click handler is invoking goToStep()

#### Point C: Badge Click Handler Log
```javascript
onClick={() => {
  console.log("[CALENDAR_SYNC_DEBUG] Step badge clicked. Index:", index, "Locked:", locked, "Current step:", state.step);
  !locked && goToStep(index);
}}
```
**Fires:** Every badge button click  
**Proves:** Gating logic (locked/disabled state)

#### Point D: Component Mount/Unmount Logs
Each step component (TimeArchitectureStep, BookingRulesStep, FocusProtectionStep, WeeklyResetStep):
```javascript
useEffect(() => {
  console.log("[CALENDAR_SYNC_DEBUG] BookingRulesStep (Step 2) MOUNTED");
  return () => console.log("[CALENDAR_SYNC_DEBUG] BookingRulesStep (Step 2) UNMOUNTED");
}, []);
```
**Fires:** When component mounts/unmounts  
**Proves:** React is rendering/destroying components

### 3. Visual Markers - Blue Boxes at Top of Each Step

When you navigate to a step, a blue box appears at the very top showing:
```
✅ Mounted: Step 2 (BookingRulesStep)
```

This confirms the component is not just in memory, but MOUNTED and RENDERING in the DOM.

---

## EXACT TESTING PROCEDURE

### BEFORE YOU START
- Close all browser tabs to start fresh
- Open http://localhost:3000/systems/calendar
- Press F12 to open DevTools
- Click "Console" tab
- **Clear the console** (right-click → Clear console, or Ctrl+Shift+L)

### EXECUTE THIS SEQUENCE

**Step 1: Click Step 1 Badge**
- Observe console output
- Expected: You should see logs about Step 1 being selected
- Screenshot: Capture the yellow box and console together

**Step 2: Click Step 2 Badge** 
- Wait 500ms for any animations
- Expected: Console shows Badge clicked, goToStep called, State updated, Step 1 UNMOUNTED, Step 2 MOUNTED
- Observe: Yellow box changes to `activeStep = 2`
- Observe: Blue box changes to `Mounted: Step 2`
- Screenshot: Capture yellow box, blue box, and step content

**Step 3: Try to Click Step 3 Badge**
- Expected: Might be locked/disabled initially
- Console should show: `"Locked: true"` when clicking
- This is CORRECT behavior (Step 3 should be locked until Step 2 is completed)
- Screenshot: Show disabled state of Step 3 button if locked

**Step 4: Check "I applied at least one booking rule" on Step 2**
- Go back to Step 2 (click Step 2 badge)
- Check the required checkbox: "I applied at least one booking rule"
- Watch yellow box - should show `2=true`

**Step 5: Now Try Step 3 Again**
- Click Step 3 badge
- Expected: Should now work (button no longer disabled)
- Console: Should show `"Locked: false"` when clicking
- Yellow box: Changes to `activeStep = 3`
- Blue box: Changes to `Mounted: Step 3`
- Screenshot: Capture the Step 3 content

**Step 6: Repeat for Step 4**
- Same process - may need to complete Step 3 first
- Screenshot: Capture Step 4 with blue box showing `Mounted: Step 4`

---

## WHAT EACH PIECE OF EVIDENCE PROVES

### Evidence Piece 1: Console Logs

If you see these logs in this order:
```
[CALENDAR_SYNC_DEBUG] Step badge clicked. Index: 2, Locked: false, Current step: 1
[CALENDAR_SYNC_DEBUG] goToStep called with step: 2, current step: 1, key: undefined
[CALENDAR_SYNC_DEBUG] State updated. Current step: 2
[CALENDAR_SYNC_DEBUG] TimeArchitectureStep (Step 1) UNMOUNTED
[CALENDAR_SYNC_DEBUG] BookingRulesStep (Step 2) MOUNTED
```

**This proves:**
1. ✅ Click handler fired (badge is clickable)
2. ✅ goToStep() was called with correct step number
3. ✅ setState() executed and updated state.step
4. ✅ React re-rendered and unmounted Step 1
5. ✅ React mounted Step 2 component

**If ANY log is missing, that's the failure point.**

### Evidence Piece 2: Yellow Box Shows Correct Step Number

If yellow box shows:
```
activeStep = 2
```

**This proves:** `state.step` is actually 2 in React state (not just the display saying it, but actual state value).

### Evidence Piece 3: Blue Box Appears

If blue box says:
```
✅ Mounted: Step 2 (BookingRulesStep)
```

**This proves:** The component is actually in the DOM and rendering, not hidden by CSS or off-screen.

### Evidence Piece 4: You Can See the Step Content

If you can see:
- Audience dropdown
- Buffer sliders
- Day toggles
- Time range input

**This proves:** The component is rendering with all its JSX intact, not just an empty shell.

---

## INTERPRETING FAILURE MODES

### If Yellow Box Never Changes from 1

**Diagnosis:** setState() is not working
- Check console for `State updated` logs
- If you see `goToStep called` but NOT `State updated`, setState is blocked
- Could be: state update hook blocked, component unmounting, or frozen state

### If Logs Show Step Changed but Yellow Box Still Shows 1

**Diagnosis:** Component re-rendered but didn't update the display
- This would indicate React is running but display isn't syncing
- Check browser DevTools React tab for state value

### If Blue Box Never Appears for Step 2+

**Diagnosis:** Conditional rendering not working
- Check: Does yellow box show `activeStep = 2`?
- If YES but no blue box: Component not mounting (JSX conditional faulty)
- If NO: State never changed (see "Yellow Box Never Changes" above)

### If All Logs and Boxes Correct but Content Not Visible

**Diagnosis:** CSS hiding it
- Right-click the step content in DevTools
- Inspect → Computed tab
- Look for: `display: none`, `visibility: hidden`, `opacity: 0`, `height: 0`
- Check parent containers for `overflow: hidden`

### If Button Is Grayed Out/Disabled

**Diagnosis:** Gating logic is working as designed
- Console shows: `Locked: true`
- This is EXPECTED for Steps 3+ if previous steps not completed
- Complete the previous step and try again

---

## HOW TO RETURN RESULTS

**Return this information:**

1. **Full Console Log Transcript**
   - Right-click in console → Save as... → Save as text file
   - OR: Select all (Cmd+A) → Copy → Paste into report

2. **Four Screenshots**
   - Screenshot 1: Step 1 (with yellow and blue boxes)
   - Screenshot 2: Step 2 (with yellow showing "2" and blue showing "Step 2")
   - Screenshot 3: Step 3 (with yellow showing "3" and blue showing "Step 3")
   - Screenshot 4: Step 4 (with yellow showing "4" and blue showing "Step 4")

3. **Narrative**
   - For each step: Did clicking the badge work? Y/N
   - Did the yellow box number change? Y/N
   - Did the blue box appear? Y/N
   - Was the step content visible? Y/N

4. **Any Errors**
   - If anything appears in red in console, copy the exact error message
   - If page freezes/stutters, note when it happened

---

## DIAGNOSTIC CHECKLIST

- [ ] Opened http://localhost:3000/systems/calendar
- [ ] DevTools Console is open
- [ ] Console is cleared
- [ ] Yellow debug box is visible on page
- [ ] All step badges (1, 2, 3, 4) are visible
- [ ] Clicked Step 1 badge and observed
- [ ] Clicked Step 2 badge and observed
- [ ] Clicked Step 3 badge (noting if locked or not)
- [ ] Attempted Step 4 if applicable
- [ ] Captured console logs
- [ ] Took 4 screenshots
- [ ] Documented results

---

## AUTOMATIC ANALYSIS (What I'll Do With Your Results)

Once you provide the console logs and screenshots, I will:

1. **Cross-reference each log with the expected sequence**
   - If any log is missing → identify the missing piece
   - If logs are out of order → identify the execution problem

2. **Match console output to on-screen evidence**
   - If logs show "Step 2 MOUNTED" but no blue box → render logic issue
   - If yellow box shows step 2 but no logs → state updated but component issue

3. **Identify the exact failure mode**
   - State not updating? → Check setState, persist, updateState functions
   - Component not rendering? → Check conditional JSX syntax
   - Component hidden? → Check CSS and parent overflow
   - Button locked? → Check gating logic and completion flags

4. **Provide exact minimal fix**
   - Pinpoint the single line of code that needs to change
   - Explain why the fix works

---

## FILES READY FOR TESTING

All files have been modified and are currently on disk:

```
app/systems/components/CalendarOperationalClient.tsx    [MODIFIED - DEBUG ADDED]
app/systems/components/TimeArchitectureStep.tsx          [MODIFIED - MOUNT LOG ADDED]
app/systems/components/BookingRulesStep.tsx              [MODIFIED - MOUNT LOG ADDED]
app/systems/components/FocusProtectionStep.tsx           [MODIFIED - MOUNT LOG ADDED]
app/systems/components/WeeklyResetStep.tsx               [MODIFIED - MOUNT LOG ADDED]
```

All files compile successfully with NO ERRORS.

Dev server is running and recompiled all changes.

---

## NEXT STEP

**Navigate to http://localhost:3000/systems/calendar and execute the test sequence above.**

**Return the console logs + screenshots + narrative.**

All guesswork ends. The cause will be identified with 100% certainty.


# Verify Activation A (Saved Insight) — Checklist

**Scope:** Activation A only. No code/scripts. One page max.

## App Actions (Preview first)
1) **Meaningful save:** Log in, open any lab (Identity/Meaning/Agency), enter ≥25 words (or ≥140 chars), save.
2) **Duplicate save:** Re-save the exact same content in the same lab.
3) **Short/empty save:** Attempt to save with empty/very short content.

## Firestore Checks (server-side)
- `lab_events` collection: look for recent docs with `event=lab_save`.
- `activation_a_states` collection: look for one doc per unique meaningful content hash.
- `users/{uid}` doc: field `activation.activatedAt` should exist after first meaningful save (write-once).

## PASS Criteria
- Check 1 (meaningful save):
  - `lab_events`: entry with `success=true`, bucket ≥ "25-49" (or higher), correct labId/promptId.
  - `activation_a_states`: one new doc for this content hash.
  - `users/{uid}.activation.activatedAt`: present (set once).
- Check 2 (duplicate save):
  - `lab_events`: another `lab_save` for the second save.
  - `activation_a_states`: still one doc (no new doc created).
  - `activatedAt`: unchanged.
- Check 3 (short/empty save):
  - `lab_events`: entry with `success=false`, `errorCode=VALIDATION_ERROR`, bucket "0".
  - `activation_a_states`: no new doc.
  - `activatedAt`: unchanged/absent.

## Notes
- Run in preview; prod only if preview passes.
- If sessionId header is missing, events may show `sessionId="unknown"` — acceptable.
- No UI changes are expected; verification is via Firestore documents.

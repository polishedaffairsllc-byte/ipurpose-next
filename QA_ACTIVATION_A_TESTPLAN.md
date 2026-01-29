# QA Test Plan — Activation A (Saved Insight)

**Date:** January 28, 2026  
**Scope:** Manual tests and sanity checks for Activation A. No code/UI/routes authored here.  

## Happy Path
- Authenticated user opens a lab (Identity/Meaning/Agency).
- Enters meaningful text and saves.
- Save succeeds; confirmation appears; next-step suggestion appears.
- Events: `lab_save success=true` emitted with properties; state inference marks Explorer → Activated; optional `activation_a_reached` emitted once.

## Negative / Edge Cases
- Not logged in: attempt to save redirects to login; no `lab_save success=true`; no activation.
- Empty input: validation blocks save; no activation.
- Network failure: save fails; `lab_save success=false` logged (if instrumented); user can retry; activation only on success.
- Rapid duplicate saves: only first qualifying save triggers activation; subsequent duplicates do not re-trigger state change.

## Sanity Checks (Prod/Route)
- Labs routes load and are auth-gated as expected.
- Integration/community gating unchanged (Activation A does not alter gating).
- No new prompts or UI added beyond existing confirmation/next-step patterns.

## Acceptance Criteria
- Activation A Rate measurable (events present, state inference works).
- Happy path produces exactly one activation state transition per user/session for the first meaningful save.
- Errors and validation do not emit activation.
- Environment tagging present on events.

# Activation A Implementation Plan — Saved Insight

**Date:** January 28, 2026  
**Scope:** Activation A only (in-session saved insight). No code/UI/routes in this doc.  
**Definition:** A user is “Activated” when they complete one meaningful lab prompt (Identity/Meaning/Agency or equivalent) and successfully save it, receiving immediate confirmation plus a clear next step.

## Minimal End-to-End Flow
1. Prompt displayed (existing lab UI).
2. User inputs meaningful text (non-empty, above minimal threshold if enforced).
3. User saves.
4. System persists text, confirms success in-session.
5. System surfaces a single next-step suggestion (e.g., “Continue labs” or “Set cadence/plan teaser” per existing flow constraints). No new UI required—reuse current confirmation area.

## Dependencies & Assumptions
- Labs routes and save endpoints already exist and are auth-gated.
- Entitlement: Labs are FREE/auth-required; no paid gate for Activation A.
- State inference uses events; no new user-facing state labels.
- Integration and community remain gated; Activation A does not unlock new routes.
- Reminders/cadence opt-in may exist but are not required to mark Activation A (Activation A is satisfied by save success alone for this phase).

## Edge Cases
- Not logged in: save attempt redirects to login; no activation event.
- Save failure (network/server): show existing error path; do not emit activation success; consider retry logging.
- Empty/too-short input: treat as validation failure; no activation event.
- Duplicate rapid saves: ensure idempotent event emission (emit once per successful save payload or debounce per session).

## Success Criteria
- At least one successful lab_save event with persisted content for the session.
- Confirmation is displayed (existing UI) without errors.
- Next-step suggestion is shown (reuse existing pattern; no new UX build).
- Activation state inferred as Activated for the user based on event stream.

## Acceptance Tests (high level)
- Happy path: Authenticated user enters meaningful text, saves successfully, sees confirmation + next-step; activation event emitted; state moves Explorer → Activated.
- Not logged in: Save attempt redirects; no activation.
- Network failure: Save fails; no activation; user can retry; retry success emits single activation.
- Empty input: Validation prevents save; no activation event/state change.
- Duplicate saves: Only one activation state change per unique saved prompt per session (idempotent guard).

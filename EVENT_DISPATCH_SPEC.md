# Event Dispatch Spec — Activation A

**Date:** January 28, 2026  
**Scope:** Events for Activation A (no code/UI/routes).  

## Events
- `lab_save` (core) — fired on successful save of a lab prompt.
- `activation_a_reached` (derived/optional) — emitted once when Explorer → Activated for the first time in a session/user.

## Firing Conditions
- `lab_save`: client invokes save → server persists → on success, emit with required props.
- `activation_a_reached`: emitted by analytics/state engine when first qualifying `lab_save` is observed and user was Explorer.

## Required Properties
- `uid`
- `session_id`
- `lab_id` (identity/meaning/agency)
- `prompt_id` (if multiple prompts per lab)
- `word_count_bucket` (e.g., <50, 50-199, 200+)
- `timestamp`
- `entitlement_tier` (if known; optional for labs since free)
- `state_before` (Visitor/Explorer)
- `state_after` (Activated)
- `environment` (dev/stage/prod)
- `success` (boolean)

## Client vs Server
- Client: initiate save call; may log client-side attempt (not used for activation state).
- Server: authoritative `lab_save` success; emit server-side event or enqueue to analytics.
- State engine/analytics: derive `activation_a_reached` to avoid double counting.

## Idempotency
- Use combination of `uid` + `lab_id` + `prompt_id` + content hash + timestamp bucket or session_id to prevent duplicate activation events from rapid retries.
- Only one `activation_a_reached` per user per session; re-saves can update `lab_save` counts but not re-trigger activation.

## Error/Failure Logging
- On save failure: emit `lab_save` with `success=false` (no activation), include error_code if available.
- Do not emit `activation_a_reached` on failure.

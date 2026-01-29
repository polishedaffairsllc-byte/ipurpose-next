# State Engine Wiring — Activation A

**Date:** January 28, 2026  
**Scope:** Visitor → Explorer → Activated (Activation A only). No code/UI/routes here.  

## States in Scope
- Visitor
- Explorer
- Activated (Activation A)

## Entry/Exit Conditions
- Visitor: default before auth/intent.
- Explorer: triggered by `page_view` of labs/orientation or `clarity_check_start`/email capture.
- Activated: triggered by successful `lab_save` (meaningful content) in a core lab.
- No demotion; dormancy handled analytically (not altering state).

## Triggers (from events)
- Visitor → Explorer: `page_view` (labs/orientation/clarity) or `lead_submit`.
- Explorer → Activated: `lab_save` with success status and non-empty content.

## Where State Is Inferred
- Client emits events; server confirms persistence; analytics pipeline infers state based on event sequence.
- State attached to events post-inference; not stored in user profile UI.

## Persistence Approach
- Persist lab content in existing lab storage (unchanged).
- Persist events to analytics with properties: uid, session_id, lab_id, prompt_id, word_count_bucket, timestamp, success boolean.
- Optionally persist latest inferred state + timestamp in a server-side store for reporting (no user UI exposure), keyed by uid.

## Ordering & Idempotency
- Prioritize highest state reached; once Activated is achieved, do not re-emit transition for duplicate saves in the same session/payload.
- Use content hash + session_id to prevent double activation on duplicate submissions.

## Assumptions
- Auth is required for save; anonymous cannot save.
- Labs are ungated by tier; entitlement checks not needed for Activation A.
- Existing save endpoint returns success/failure synchronously to client.

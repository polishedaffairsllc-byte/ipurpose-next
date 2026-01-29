# Trigger Map — State Movement

**Date:** January 28, 2026  
**Scope:** What triggers movement between states (no code/UI/routes)  

## Triggers by Transition (from `STATE_MACHINE_SCHEMA.md`)

- Visitor → Explorer: `page_view` of orientation/labs/clarity check OR email capture (`lead_submit`).
- Explorer → Activated: `lab_save` + `cadence_opt_in` OR `clarity_check_complete` + `return_window=<48h>`.
- Activated → Engaged: `lab_return` within 7d OR `plan_iteration` within 7d of last save.
- Engaged → Invested: `integration_save_attempt` (gated) OR `community_post_attempt` (gated) OR `checkout_start`.
- Invested → Contributor: `community_post_create` OR `community_comment_create` (entitled).
- Contributor → Guide: N helpful responses or marked-helpful interactions within window (e.g., 5 in 30d, TBD).
- Guide → Advocate: `referral_share`, `testimonial_submit`, or confirmed referral conversion.

## Trigger Properties Needed
- Event timestamp
- `return_window` bucket (e.g., <48h, 2-7d, 8-30d)
- `intent_context` (integration|community|labs)
- `tier` if known
- Counts (posts/comments/helpful flags) for contribution thresholds

## Debounce & Ordering
- Evaluate highest qualifying state first; do not demote.
- Debounce multiple transitions in one session; log the highest achieved.

## Configurable Parameters
- Return windows (48h, 7d)
- Contribution threshold for Guide (TBD)
- Referral confirmation definition (e.g., referred user activates or converts)

## Safeguards
- No automatic entitlement changes based on state.
- State transitions are internal analytics signals; they must not alter gating or UI directly.

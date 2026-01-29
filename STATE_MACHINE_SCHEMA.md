# State Machine Schema — Phase 3 Activation

**Date:** January 28, 2026  
**Scope:** Logic model for user state transitions (no code/UI/routes)  

## States (from `USER_STATE_MODEL.md`)
- Visitor
- Explorer
- Activated
- Engaged
- Invested
- Contributor
- Guide
- Advocate

## Entry Criteria (examples)
- Visitor: default for anonymous/public traffic.
- Explorer: page_view of labs/orientation/clarity check OR email capture.
- Activated: `lab_save` (any core lab) AND `cadence_opt_in` OR `clarity_check_complete` + return within 48h.
- Engaged: `lab_return` within 7d OR `plan_iteration` within 7d of prior save.
- Invested: `checkout_start` OR repeated `integration_save_attempt` after gating OR `community_post_attempt` when gated.
- Contributor: `community_post_create` OR `community_comment_create` (entitled).
- Guide: sustained helpful responses (N comments over period) OR marked helpful; internal flag.
- Advocate: `referral_share` OR `testimonial_submit` OR tracked referral signup.

## Exit/Regression (observed, not forced)
- Time-based dormancy markers (e.g., no meaningful event for 30/60/90d) for retention reporting; state label need not regress, but dormancy flags apply.

## Triggers & Transitions (see `TRIGGER_MAP.md`)
- Event-driven: specific events with thresholds move user to next state.
- Time-window checks: return within 48h/7d advances Activated→Engaged.
- Intent attempts: gated actions move Engaged→Invested (intent) even if entitlement missing.

## State Assignment Logic (pseudologic)
- Evaluate from highest to lowest to avoid oscillation; once a higher state is reached, retain unless explicit demotion rule exists (none here).
- Use most recent qualifying event within lookback windows.
- Attach `user_state` to emitted events when inferred.

## Data Needed per Transition
- Event name, timestamp
- Properties: lab_key, intent_context, return_window, tier (if available), prompt_id (if upgrade prompt)
- Counts: plan iterations, community posts/comments, reminders opened/returned

## Configurable Thresholds
- Return windows: 48h (activation), 7d (engagement)
- Contribution threshold for Guide: e.g., 5 helpful comments in 30d (TBD)
- Referral/advocacy markers: at least 1 confirmed referral or testimonial

## Safeguards
- No manual user-facing labels; state is internal.
- No gating changes triggered automatically; state informs analytics and messaging logic only.
- Avoid double-counting transitions in a single session; debounce transition logging.

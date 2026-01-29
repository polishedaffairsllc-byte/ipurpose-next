# Event Map — Phase 3 Activation

**Date:** January 28, 2026  
**Scope:** Event taxonomy and firing conditions (no code/UI/routes)  

## Event Families (from `INSTRUMENTATION_SCHEMA.md`)
- Discovery & Orientation: `page_view`, `orientation_view`, `clarity_check_start`, `clarity_check_complete`
- Labs: `lab_open`, `lab_save`, `lab_return`
- Integration: `integration_load`, `integration_save_attempt`, `integration_save_success`, `plan_iteration`
- Cadence: `cadence_opt_in`, `reminder_sent`, `reminder_open`, `reminder_return`
- Community: `community_view`, `community_post_attempt`, `community_post_create`, `community_comment_create`, `community_feedback_received`
- Conversion: `upgrade_prompt_view`, `upgrade_prompt_accept`, `upgrade_prompt_dismiss`, `checkout_start`, `checkout_complete`, `entitlement_granted`
- Retention/Milestones: `streak_progress`, `milestone_reached`, `return_interval`

## Firing Conditions (representative)
- `page_view`: on load of key public/entry pages.
- `clarity_check_complete`: when user submits final step of assessment.
- `lab_save`: when user saves content in identity/meaning/agency labs.
- `lab_return`: when a lab is opened within defined window of prior save (e.g., 48h/7d buckets).
- `integration_load`: when integration page loads (authenticated context).
- `integration_save_attempt`: on submit before entitlement check.
- `integration_save_success`: on successful save (entitled or after upgrade).
- `cadence_opt_in`: when user consents to reminders (channel + frequency captured).
- `reminder_return`: when a session follows a reminder open within a short window.
- `community_post_attempt`: when user tries to post while gated (intent signal).
- `community_post_create`: when entitled user successfully posts.
- `upgrade_prompt_view`: when an upgrade modal/prompt is shown (context captured).
- `checkout_start` / `checkout_complete`: on entering checkout and successful payment.
- `milestone_reached`: when lab triad complete, first plan saved, or first community post done.

## Key Properties
- `user_state` (inferred)
- `lab_key` (identity/meaning/agency)
- `intent_context` (integration|community|labs)
- `prompt_id` and `prompt_context`
- `return_window` bucket
- `tier` (FREE/BASIC_PAID/DEEPENING) when known
- `environment` (dev/stage/prod)
- `referrer` / `entry_vector`

## Governance
- Keep event names stable; version changes if semantics change.
- Use environment flags to keep non-prod data isolated in analysis.
- Avoid capturing raw free-text in event payloads; use references.

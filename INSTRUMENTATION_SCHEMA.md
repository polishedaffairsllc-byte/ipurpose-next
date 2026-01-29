# Instrumentation Schema — Activation & Retention

**Date:** January 28, 2026  
**Scope:** Event model for activation, conversion, retention (no routes/UI/code changes)  
**Phase:** 3 — Activation Architecture

## Principles

- Behavior-first: state inferred from actions, not self-report.
- Identity-linked: reference user-authored text where privacy and consent permit.
- Minimal + meaningful: instrument only events that map to state transitions or loops.
- Respect consent: reminders/notifications opt-in; sharing clearly indicated.

## Core Event Families

### Discovery & Orientation
- `page_view` (public key surfaces)
- `orientation_view`
- `clarity_check_start` / `clarity_check_complete`

### Labs & Identity Work
- `lab_open` (identity/meaning/agency)
- `lab_save` (with lab key, word count bucket)
- `lab_return` (open within 48h/7d of prior save)

### Integration & Planning
- `integration_load`
- `integration_save_attempt` (before entitlement check)
- `integration_save_success`
- `plan_iteration` (counts edits/saves per plan)

### Cadence & Reminders
- `cadence_opt_in` (channel, frequency)
- `reminder_sent` (channel)
- `reminder_open`
- `reminder_return` (session that follows a reminder)

### Community (where entitled)
- `community_view`
- `community_post_attempt`
- `community_post_create`
- `community_comment_create`
- `community_feedback_received` (comment/like/response)

### Conversion Intents
- `upgrade_prompt_view` (context: integration, community)
- `upgrade_prompt_accept`
- `upgrade_prompt_dismiss`
- `checkout_start`
- `checkout_complete`
- `entitlement_granted` (tier)

### Retention & Progression
- `streak_progress` (based on meaningful actions, not logins)
- `milestone_reached` (labs triad complete, first plan saved, first community post)
- `return_interval` (bucketed time between sessions)

## Key Properties (selected)

- `user_state` (Visitor/Explorer/Activated/Engaged/Invested/Contributor/Guide/Advocate inferred)
- `lab_key` (identity/meaning/agency)
- `intent_context` (integration|community|labs)
- `prompt_id` (upgrade prompt instance)
- `word_count_bucket` (e.g., <50, 50-199, 200+)
- `return_window` (e.g., <48h, 2-7d, 8-30d)
- `tier` (FREE/BASIC_PAID/DEEPENING)

## State Inference (examples)

- Activated: `lab_save` + `cadence_opt_in` OR `clarity_check_complete` + return within 48h.
- Engaged: `lab_return` within 7d OR `plan_iteration` within 7d of prior save.
- Invested: `checkout_start` OR repeated `integration_save_attempt` after gating.
- Contributor: `community_post_create` OR `community_comment_create` (entitled users).

## Metrics

- Activation rate: % of Explorers who reach Activated within 7 days.
- Engagement depth: median plan iterations per user per 30 days.
- Conversion velocity: median time from first lab_save to checkout_start/complete.
- Reminder efficacy: reminder_open → reminder_return rate; post-return save rate.
- Retention: 30/60/90-day return with meaningful action (not just views).
- Social reinforcement: % posts with feedback, time-to-feedback.

## Data Hygiene & Privacy

- Avoid storing raw free-text in analytics where not necessary; use references/hashes when possible.
- Honor opt-outs for reminders and tracking; keep channels explicit.
- Distinguish local/dev instrumentation from prod; maintain environment flag.

## Open Questions

- Do we need sentiment/tonality on reflections? (Likely no for v1.)
- Which channels are allowed for reminders (email only vs SMS/push later)?
- How to surface state in-product without exposing jargon? (internal only.)

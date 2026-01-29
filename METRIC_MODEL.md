# Metric Model — Activation & Retention

**Date:** January 28, 2026  
**Scope:** KPIs per state and activation metrics (no code/UI/routes)  

## Core KPIs by State
- Visitor → Explorer: entry-to-explorer rate (% hitting orientation/labs/clarity or providing email).
- Explorer → Activated: activation rate within 7 days (% with lab_save + cadence_opt_in or clarity_check_complete + return <48h).
- Activated → Engaged: engagement rate (% with lab_return or plan_iteration within 7d) and median time to engagement.
- Engaged → Invested: intent rate (% with integration_save_attempt/community_post_attempt or checkout_start) and median time to intent.
- Invested → Contributor: contribution rate (% creating post/comment where entitled) and time from intent to first contribution.
- Contributor → Guide: helpfulness maturation rate (meeting helpfulness threshold) and time to reach threshold.
- Guide → Advocate: advocacy rate (% sharing referral/testimonial) and referral conversion rate.

## Activation Metrics (system-wide)
- Activation rate: Explorers → Activated within 7 days.
- Time-to-activation: median time from first qualifying Explorer event to Activated.
- Reminder efficacy: reminder_open → reminder_return; post-return save/iteration rate.
- Loop completion: % completing reflection after plan period; average plan iterations per 30d.

## Conversion Metrics
- Upgrade prompt view → accept rate, by context (integration vs community).
- Checkout start → complete rate; median time from first lab_save to checkout_start/complete.
- Gated intent frequency: counts of integration/community attempts prior to conversion.

## Retention Metrics
- 30/60/90-day meaningful return (lab_save/plan_iteration/integration_save_attempt/community_post*).
- Streak adherence (soft streaks based on meaningful actions).
- Milestone attainment: labs triad completion, first plan saved, first community post.

## Quality & Experience Metrics
- Feedback loop health: % posts with responses; time-to-feedback.
- Specificity growth: change in word_count_bucket over time (proxy for depth; optional).
- Consent health: opt-in/opt-out rates for cadence; reminder suppression rate.

## Reporting Considerations
- Segment by entry vector/funnel (`ACTIVATION_FUNNELS.md`).
- Attribute conversion to preceding anchors (which lab/statement prompted intent).
- Keep environment segmented (dev/stage/prod) for clean analysis.

## Safeguards
- Prefer aggregated or bucketed metrics; limit exposure of raw text.
- No user-facing state labels; metrics are internal.

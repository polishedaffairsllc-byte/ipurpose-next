# Conversion Paths — iPurpose

**Date:** January 28, 2026  
**Scope:** Behavioral conversion signals and paths (no routes/UI/code changes)  
**Phase:** 3 — Activation Architecture

## Conversion Definition (Behavioral)

A user is conversion-ready when they demonstrate intent to operationalize their insights (integration) or seek feedback/connection (community) and have already formed a cadence/plan.

## Primary Paths

1. **Labs → Integration (Monetization Bridge)**
   - Signals: completed labs, visits integration, attempts to save plan, multiple integration loads.
   - Action: present upgrade at the moment of operationalization (plan save) or repeated access.

2. **Labs → Community (Social Proof Bridge)**
   - Signals: wants to share insight, clicks community/post, seeks feedback.
   - Action: upgrade prompt framed as “share to get feedback/accountability.”

3. **Assessment → Orientation → Labs → Integration**
   - Signals: completes clarity check, follows orientation path, then opens labs/integration.
   - Action: gentle upgrade at integration attempt after labs completion.

4. **Reminder Return → Integration Save Attempt**
   - Signals: returns from reminder, edits plan, or reopens integration.
   - Action: surface upgrade when they try to save actionable plan.

## Readiness Signals (Observable)

- Behavioral: 2+ lab saves, 2+ integration visits, community/post click, checkout start.
- Temporal: returns within 48h of first lab; completes labs triad within 7–14 days.
- Depth: increases specificity in identity/meaning statements; edits/refines content.

## Framing Principles

- Context-first: upgrade messaging references user’s own statements and intent (“to act on X, unlock integration save/feedback”).
- Single CTA: one clear next step; avoid multi-offer clutter.
- Respect cadence: prompt at natural inflection points (save, share, return), not on idle.

## Anti-Patterns to Avoid

- Pushing upgrade before any meaningful action or save.
- Prompting during first 30–60 seconds of a session.
- Multiple overlapping prompts in a single session.
- Generic, non-personalized upsell copy.

## Measurement

- Path entry: event leading to the upgrade moment (e.g., integration_load).
- Upgrade prompt views vs accepts: prompt_view, prompt_accept, prompt_dismiss.
- Conversion: checkout_start, checkout_complete.
- Drop-off: prompt_dismiss + no return within X days.
- Cohort speed: time from first lab save to upgrade accept/checkout.

## Instrumentation (see `INSTRUMENTATION_SCHEMA.md`)

- Track attempts to operationalize (integration_save_attempt) and to share (community_post_attempt).
- Track prompt exposures and outcomes at these inflection points.
- Attribute conversion to prior anchors (which lab/statement led to the prompt).

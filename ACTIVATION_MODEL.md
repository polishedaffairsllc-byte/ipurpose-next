# Activation Model — iPurpose

**Date:** January 28, 2026  
**Scope:** Behavioral activation architecture (no routes/UI/code changes)  
**Phase:** 3 — Activation Architecture  

## What Activation Means (Psychological + Behavioral)

Activation is the moment a user internalizes that iPurpose is *their* structured path from inner clarity to sustained action, and takes a self-directed step that signals commitment. It blends:
- **Psychological:** Feeling seen (identity reflected), feeling capable (agency surfaced), and feeling guided (clear next step without overwhelm).
- **Behavioral:** Completing a purposeful action that ties personal identity → plan → community/commitment (e.g., finishing a lab, saving an integration statement, starting an accountability cadence).

**Definition (working):** A user is activated when they connect their identity/meaning inputs to a forward plan and consent to a recurring cadence (self or community) that reinforces progress.

## User State Model (overview)

- Visitor → Explorer → Activated → Engaged → Invested → Contributor → Guide → Advocate (detailed in `USER_STATE_MODEL.md`).

## Entry Vectors

- **Direct discovery:** Homepage, program page, about, starter pack download.
- **Assessment-first:** Clarity Check → email capture → labs intro.
- **Community preview:** Ethics/values page links; community value proposition.
- **Orientation path:** Orientation/learning path surfaces labs as “first proof.”
- **Referral/word-of-mouth:** Shared results, testimonials, or direct invite links.

## First-Session Activation Logic

- Present a *single* commitment: complete one lab module (Identity or Meaning) or start the Clarity Check.
- Make the next step obvious: after first lab save, show “carry this forward” CTA (integration teaser, not full access).
- Capture intent early: micro-commit (save a draft, set a reminder, opt into weekly recap email).
- Avoid choice overload: suppress advanced tool visibility until a lab save occurs.

## Identity Anchoring Mechanisms

- Reflect back user language from labs in subsequent prompts (stored statements become anchors).
- Show a “Why I’m here” snippet at session start (pull from first saved text).
- Tie actions to identity: “Because you said X about meaning, here’s the next action Y.”
- Offer a cadence choice linked to identity (daily nudge vs weekly reflection).

## Behavioral Loops

- **Reflection → Plan → Do → Reflect:** Labs input → integration plan → 7-day execution → log a reflection → adjust.
- **Commit → Reminder → Return:** User opts into cadence → receives reminder → returns to complete/advance.
- **Share → Feedback → Motivation:** Option to share a distilled insight with community (when entitled) → receive feedback → motivation to continue.

## Progression Logic

- Progression is driven by repeated alignment between identity statements and chosen actions.
- Gates unlock only after meaningful completion signals (e.g., saved lab content, not page views).
- Upgrades (paid) are positioned when a user attempts to operationalize (integration/save plan) or join feedback loops (community/post).

## Conversion Readiness Signals

- Behavioral: multiple lab saves, repeated visits to integration, attempts to post or access community, starts checkout.
- Psychological: edits/refines identity/meaning statements, increases specificity, accepts reminders.
- Timing: returns within 48h of first lab; completes 2+ labs within 7 days; opens integration twice.

## Retention Loops

- Scheduled reflections (weekly) tied to prior statements.
- Streaks anchored to purposeful actions (lab edits, plan updates, community participation).
- Milestone emails/notifications that mirror user language (“You clarified X; next, act on Y”).
- Community feedback loops (for entitled users) to reinforce effort with social proof.

## Instrumentation Points (see `INSTRUMENTATION_SCHEMA.md`)

- Track lab saves, integration loads/saves, cadence opt-ins, reminder deliveries, returns from reminders.
- Track community entry attempts and posts (where entitled) as activation/retention pivots.
- Track conversion intents: checkout starts, 403 upgrade prompts, enroll page visits.

## Guardrails

- No new routes, no UI redesigns in this phase; surface activation through existing flows and messaging.
- Keep prompts identity-linked; avoid generic nudges.
- Respect privacy: reminders and sharing are opt-in and transparent.

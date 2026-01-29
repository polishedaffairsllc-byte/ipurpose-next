# System Requirements — Phase 3 Activation Architecture Translation

**Date:** January 28, 2026  
**Scope:** Behavioral + functional requirements derived from Phase 3 models (no code/UI/routes)  

## Goals
- Translate activation/engagement behavior into system requirements.
- Preserve identity-linked experience without adding new routes or UI redesigns.
- Enable measurement of activation, engagement, conversion, and retention.

## Functional Requirements
- Support capture and reuse of user-authored identity/meaning text across sessions.
- Support cadence opt-in, storage of cadence preferences, and reminder scheduling (channel-agnostic).
- Support detection of state transitions based on events (no manual tagging by user).
- Support gating awareness: detect and log attempts to save integration/plan or post to community when not entitled.
- Support event emission for all defined activation, loop, and conversion points.
- Support storage/lookup of entitlement tier for evaluating intent and conversion attempts.
- Support reflection and plan iteration tracking (counts, timestamps).
- Support feedback loop signals (posts/comments where entitled) and surface counts for reinforcement messaging (without new UI assets).

## Behavioral Requirements
- Use identity anchoring in prompts/reminders (reuse prior statements; no generic nudges).
- Present single next-step logic per session context (avoid multiple concurrent CTAs in flow logic).
- Time-bound prompting: avoid prompts before meaningful action; prioritize after lab saves/returns.
- Respect consent for reminders and sharing; allow pause/opt-out logic in system configuration.
- Avoid dark patterns: only prompt upgrades at intent moments (integration save attempt, community post attempt, repeated integration visits).

## Data & Instrumentation Requirements
- Emit events defined in `INSTRUMENTATION_SCHEMA.md` with properties sufficient for state inference.
- Tag events with inferred `user_state` where possible.
- Maintain environment flags (dev/stage/prod) to avoid mixing data.
- Avoid storing raw free-text in analytics beyond necessary identifiers; prefer references/hashes.

## State & Trigger Requirements
- Implement state inference engine using `STATE_MACHINE_SCHEMA.md` triggers.
- Log state transitions with timestamps for cohort and funnel analysis.
- Allow configurable thresholds (e.g., return window 48h/7d) without code changes to routes.

## Funnel Requirements
- Track entry vector (source page/referrer) and path through activation funnels (`ACTIVATION_FUNNELS.md`).
- Attribute upgrade prompts and conversion attempts to prior anchors (which lab/statement or event sequence).

## Reliability & Safety Requirements
- Ensure reminders/notifications have idempotent delivery logging.
- Handle failure modes (e.g., reminder send failure) with retry/backoff logging (no user UI changes implied).
- Ensure gating attempts do not leak unauthorized data; only record intent events.

## Out of Scope (Phase 3A)
- New UI, routes, or feature implementation.
- Payment flow changes beyond recording attempts and entitlements.
- Community feature expansion beyond intent tracking and existing gating.

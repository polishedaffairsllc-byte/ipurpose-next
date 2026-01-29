# User State Model — iPurpose

**Date:** January 28, 2026  
**Scope:** Behavioral state progression (no routes/UI/code changes)  
**Phase:** 3 — Activation Architecture

## State Definitions

1. **Visitor** — Anonymous or first-touch; browsing public pages; no commitment yet.
2. **Explorer** — Authenticated or email-captured; tries an assessment or opens a lab; low-friction curiosity.
3. **Activated** — Has connected identity/meaning to a forward action and consented to a cadence (e.g., saved lab text + opted into reminder/plan continuation).
4. **Engaged** — Returns to act on prior intent (updates plan, completes another lab, follows a reminder); building a streak or rhythm.
5. **Invested** — Pays or attempts to pay; accesses paid surfaces (integration save, community posting); may encounter gating as upgrade trigger.
6. **Contributor** — Adds value back (posts, comments, shares distilled insight) where entitled; signals belonging and reciprocity.
7. **Guide** — Provides structured support (answers, templates, reflections); models the journey for others; creates accountability loops.
8. **Advocate** — Recommends iPurpose externally; refers others; shares outcomes/testimonials.

## Transition Signals (Behavioral)

- Visitor → Explorer: clicks into orientation/labs/clarity check; submits email; starts assessment.
- Explorer → Activated: saves first lab content or completes clarity check AND opts into a cadence/reminder.
- Activated → Engaged: returns within a defined window (e.g., 48h/7d), updates plan, or completes additional labs.
- Engaged → Invested: starts checkout, hits gated Integration/API/community, or completes labs and seeks next step.
- Invested → Contributor: posts/comment (if entitled) or shares insights; joins community loop.
- Contributor → Guide: consistent helpful interactions; responds to others; shares structured reflections.
- Guide → Advocate: refers new users; provides testimonials; participates in showcases/case studies.

## Psychological Markers

- Safety: feels seen; language mirrors their inputs.
- Agency: perceives small, doable next step; owns cadence choice.
- Meaning: connects labs insights to outcomes they care about.
- Belonging: sees/anticipates feedback loops (community or accountability) even if not yet entitled.

## Risks & Anti-Patterns

- Stalls at Explorer: browses but no save; overwhelm from too many options.
- Stalls at Activated: no reminders or unclear next step; cadence not honored.
- Stalls at Engaged: no social proof or feedback; progress not reflected back.
- Drop after Invested: friction in value realization; lack of reinforcement.

## Levers to Unblock Transitions (Non-UI structural)

- Reduce choice: highlight a single next action tied to identity statement.
- Reinforce identity: echo back saved language before proposing actions.
- Make cadence explicit: show what happens when they consent (frequency, channel).
- Contextual prompts: surface integration/plan continuation only after lab save.
- Timely touchpoints: reminders within 48h of first save; weekly reflection thereafter.

## Measurement Anchors

- State assignment is inferred from behaviors (events), not declared by user.
- Each state has a primary confirming event and optional secondary signals.
- See `INSTRUMENTATION_SCHEMA.md` for event definitions and thresholds.

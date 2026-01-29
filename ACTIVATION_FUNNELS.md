# Activation Funnels — Phase 3A

**Date:** January 28, 2026  
**Scope:** Entry→activation→engagement→conversion flows (no code/UI/routes)  

## Funnel 1: Assessment → Labs → Integration (Monetization Bridge)
- **Entry:** Clarity Check complete.
- **Activation:** First lab save + cadence opt-in within 48h.
- **Engagement:** Lab return or plan iteration within 7d.
- **Conversion Moment:** Integration save attempt (gated) or repeated integration loads; upgrade prompt framed to operationalize plan.

## Funnel 2: Orientation → Labs → Community (Social Proof Bridge)
- **Entry:** Orientation view (learning path start).
- **Activation:** First lab save + cadence opt-in.
- **Engagement:** Additional lab saves or plan iteration.
- **Conversion Moment:** Community post attempt (if gated) or community view after labs completion; prompt framed as feedback/accountability unlock.

## Funnel 3: Reminder Return → Plan Iteration
- **Entry:** Reminder_open.
- **Activation:** Reminder_return session.
- **Engagement:** Plan iteration or lab return during session.
- **Conversion Moment:** Integration save attempt or community post attempt within the same return session; prompt if gated.

## Funnel 4: Referral/Advocacy → Explorer → Activation
- **Entry:** Referral link or testimonial-driven visit.
- **Activation:** First lab save + cadence opt-in.
- **Engagement:** Lab return within 7d.
- **Conversion Moment:** Same as Funnel 1/2 depending on chosen path (integration or community intent).

## Measurements (per funnel)
- Entry rate: % of visitors entering funnel.
- Activation rate: % reaching Activated state.
- Engagement rate: % performing return/iteration.
- Conversion intent: % hitting gated intent (integration/community) and seeing prompt.
- Conversion completion: % checkout_complete.
- Time-to-activation and time-to-conversion (median).

## Guardrails
- One primary prompt per conversion moment; avoid stacking prompts.
- Use user-authored language for prompt framing when available.
- Respect opt-in for reminders; no forced cadence.

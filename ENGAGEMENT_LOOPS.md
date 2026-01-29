# Engagement Loops — iPurpose

**Date:** January 28, 2026  
**Scope:** Behavioral loops, identity anchoring, retention patterns (no routes/UI/code changes)  
**Phase:** 3 — Activation Architecture

## Core Loops

1. **Reflection → Plan → Do → Reflect**
   - Trigger: Lab save or clarity check completion.
   - Plan: Translate insight into a 7-day micro-plan (even if gated, frame the intent).
   - Do: Execute daily/weekly actions.
   - Reflect: Log a quick reflection; adjust next micro-plan.

2. **Commit → Reminder → Return**
   - Trigger: User opts into cadence (email/SMS/app notification where applicable).
   - Reminder: Scheduled nudge referencing user’s own language.
   - Return: User reopens integration/labs, edits plan, or completes next lab.

3. **Share → Feedback → Motivation** (for entitled users)
   - Trigger: User posts/shares distilled insight.
   - Feedback: Receives response or social proof.
   - Motivation: Increased likelihood to continue plan or share again.

4. **Progress Echo → Next Step → Reinforcement**
   - Trigger: Detect completion or streak milestones.
   - Echo: Reflect back what was done in user’s words.
   - Next Step: Offer a single, contextually relevant action.
   - Reinforcement: Acknowledge completion/streak without gamification excess.

## Identity Anchoring

- Use saved identity/meaning statements to personalize prompts and reminders.
- Anchor cadences to identity: “Because you said X matters, we’ll remind you to do Y.”
- Show continuity: reference last saved text when proposing the next action.

## Retention Patterns

- **Cadence adherence:** Weekly reflections tied to prior commitments.
- **Streaks:** Soft streaks based on meaningful actions (saves/edits), not logins.
- **Milestones:** Celebrate completion of labs triad, first integration plan, first community post.
- **Social proof:** Display feedback (where entitled) to reinforce contribution.

## Safeguards

- Avoid overwhelm: only one primary CTA per loop iteration.
- Respect consent: reminders and sharing are opt-in; easy to pause.
- No dark patterns: upgrades prompted at meaningful intent points (integration/community) only.

## Loop Health Signals

- Initiation rate: % of users who start a loop (e.g., commit to cadence after first save).
- Return rate: % who return from reminders within 48h/7d.
- Completion rate: % who close the loop (reflect after plan period).
- Progress depth: number of plan iterations per user over time.
- Social feedback rate: % of posts with responses (for entitled users).

## Instrumentation Hooks (see `INSTRUMENTATION_SCHEMA.md`)

- Loop start events: lab_save, cadence_opt_in, plan_create.
- Loop continuation: reminder_open, return_visit, plan_edit.
- Loop completion: reflection_save, plan_complete.
- Social reinforcement: post_create, comment_receive (entitled contexts).

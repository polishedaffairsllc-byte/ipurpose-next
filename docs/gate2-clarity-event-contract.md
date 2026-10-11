# Gate 2 — Clarity event contract

Date: October 11, 2026

## Purpose

This document defines the canonical firing rules for the two Clarity funnel events used by the Traffic Growth Operating Plan.

## `clarity_check_start`

Fire exactly once per fresh Clarity attempt when the user crosses the introduction boundary and actually begins the interactive Clarity questions.

Platform behavior:

- Web: the public `/clarity-check` page is informational and does not count as a start. A start is recorded when the interactive `/clarity-check-quiz` experience mounts after the user chooses **Start the Free Clarity Check**. A reload/remount must not create duplicate credit for the same in-memory attempt key.
- Native mobile: the introduction itself does not count as a start. A start is recorded when the user presses **Begin Clarity Check** / **Begin again** and the flow advances to the first Clarity question. A resumed draft that already passed the introduction must not emit a second start.

If an onboarding introduction later exposes separate **Continue** or **Skip** controls, either action counts as crossing the introduction boundary only when it advances into the interactive Clarity questions. Merely viewing the introduction does not count.

## `clarity_check_complete`

Fire exactly once per attempt only after a fresh, successful Clarity result exists and is rendered/accepted by the product flow.

A failed request, incomplete result, bookmarked/stale result, duplicate render, or repeated call for the same attempt must not create another completion.

Platform behavior:

- Web: completion is credited from the results experience only for a newly computed valid result tied to the active analytics attempt.
- Native mobile: completion is credited only after `submitClarityCheck` returns a valid result and the fresh result step is rendered. Resumed or previously saved results do not create duplicate completion credit.

## QA rule

Controlled Gate 2 tests are internal/QA activity and must not be used in customer conversion math. Use the existing owner/admin/QA exclusion mechanisms during any production verification.

## Gate 2 pass criteria

Gate 2 is cleared when all of the following are true:

1. These written definitions are the source of truth.
2. Automated tests prove one start and one complete per fresh attempt, including duplicate suppression and resumed-draft behavior.
3. Web wiring is confirmed for start and complete.
4. Native wiring is confirmed for start and complete.
5. One controlled production/device verification is logged as internal when physical-device proof is required.

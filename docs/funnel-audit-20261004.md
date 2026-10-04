# P0 — Clarity lifecycle audit, October 4, 2026

Status: Step 1 complete; Step 2 awaits confirmation of these findings, as the master brief requires. No product code, contacts, tasks, consent, subscriptions, or email delivery changed.

## Baseline and changes

Fetched `origin/main` successfully: `af303aea322f9c1fb065c691ca456f0b1752b4c7`. This report is isolated on `codex/funnel-audit-20261004`, starting at that commit. Changed file: `docs/funnel-audit-20261004.md` only. The user's `codex/android-launch-qa` checkout has pre-existing changes; none were staged, reverted, or copied into this branch.

Initial inspection of the user's older checkout showed an older scheduler. The conclusions below use refreshed origin/main, which already includes transactional per-lead queue deduplication. That distinction matters: repeat submissions do not always restart nurture, but a newly created lead ID can.

## Mobile submit, end to end

`mobile/src/components/ClarityCheckFlow.tsx` calls `submitClarityCheck` in `mobile/src/lib/api.ts`. It POSTs responses, identityResponses, and onboarding to `/api/clarity-check/submit`, using a verified Firebase bearer token. The server obtains the user's email from Firebase Auth and trims/lowercases it; the authenticated email takes precedence over any client email.

`app/api/clarity-check/submit/route.ts` writes a new randomly identified `clarityCheckSubmissions` document on every successful submit. For an authenticated identity result it transactionally writes the user's archetype fields and, where applicable, their partial onboarding state in `users/{uid}`. Finishing onboarding uses `/api/ai/profile` for fill-if-empty focus initialization and `/api/ai/onboarding` for completion. This flow does not call `processLead`, create/update `leads`, or enroll the user in the email queue.

| Lifecycle action | Mobile behavior | Public web behavior |
| --- | --- | --- |
| Save Clarity result | Yes, `/api/clarity-check/submit` | Yes, same submit route |
| Create/update lead | No | After separate results email-capture form submits |
| Results email to person | No | `sendClarityCheckResultsEmail`, when scores/summary/nextStep are supplied |
| Welcome/thank-you to person | No | `sendClarityCheckThankYouEmail` only following a new nurture enrollment |
| Seven-touch lifecycle | No | Immediate thank-you plus six queued tasks; final workshop touch is held unless `WORKSHOP_ACTIVE=true` |
| Founder notification | Submit route attempts it | Submit route attempts it, then email-capture route attempts a second notification |

No submit endpoints were exercised during this audit: even the mobile submit route can send a founder email to a real address. All email conclusions are source findings, not delivery claims.

## Web lifecycle and provider

The public `/clarity-check` entry sends people to `/clarity-check-quiz`. `app/clarity-check-quiz/page.tsx` submits the quiz, stores the results in sessionStorage and opens `/clarity-check-results`. That page separately asks for name/email and POSTs `/api/leads/clarity-check`, including the saved scores, resultSummary, nextStep, identity and original submission ID. The older `app/clarity-check/results/ClarityCheckResultsClient.tsx` also has email capture but does not supply the full result fields; its route call therefore does not independently satisfy the results-email condition.

`app/api/leads/clarity-check/route.ts` calls `processLead('clarity-check', ...)`, then `scheduleEmailSequence`, optionally sends the full results email, and attempts the founder email. `lib/email-automation.ts` delivers through Resend. Firestore `emailTasks` is the subscription queue; the code inspected does not upsert a Resend audience/contact as part of this flow.

`lib/launch-metrics/enrollNurture.ts` transactionally checks the normalized email's `email_opt_outs` document and any task with the same lead submissionId. Existing tasks return `duplicate`. New tasks use deterministic `{leadId}_{taskType}` IDs. Delays are days 2, 4, 5, 7, 10, and 14. `app/api/tasks/send-scheduled-emails/route.ts` dispatches them, retries failures up to five times, and holds the workshop touch behind its existing environment flag.

The thank-you is not currently a clean transactional welcome: it promotes the Starter Pack and announces a later founder-rate offer. Copying it unchanged to an app user without marketing consent would violate the brief's separation. Its results link is also given the lead ID by the scheduler rather than necessarily the quiz submission ID; this needs correction in the shared lifecycle without changing scoring/results copy.

## Consent findings

The current web result form promises delivery of results and next steps and says "No spam. Unsubscribe anytime." It has no separate marketing checkbox; the lead request/schema does not carry affirmative consent, consent timestamp, source, or wording version. Enrollment checks opt-out and duplicate tasks, not affirmative marketing consent.

`mobile/src/app/create-account.tsx` collects email/password/confirmation and says the Clarity Check establishes Compass context. `AuthContext.createAccount` creates the Firebase account and records `sign_up`. Neither has a marketing email opt-in or recorded consent. An app account must not be interpreted as marketing consent. No production consent records were inspected; absence of a record in this code path does not establish the consent history of every existing person.

`/api/unsubscribe` marks matching leads/users as opted out and writes `email_opt_outs/{base64(normalizedEmail)}`. New enrollment fails closed if that lookup fails, but individual marketing senders use an opt-out helper that returns false on lookup errors. Audit that behavior in the fix so failures cannot silently authorize marketing. Existing backfill also checks opt-out without affirmative consent; it was not run.

Smallest proposed consent step: an unchecked checkbox in Create Account or a separate results-screen opt-in, with clear marketing wording and an authenticated write recording affirmative consent, its time, source and copy version. Merely adding UI is insufficient. As the brief instructs, the P0 fix can leave app marketing unenrolled and report this gap; adding the checkbox is a separate proposal.

## Duplicate and retry findings

`lib/leads.ts` normalizes email with trim/lowercase. Its dedupe query scans leads for the same source and only reuses a matching lead created within seven days. Reuse updates touchCount/updatedAt. New leads use random IDs, and lookup/create is not an atomic uniqueness transaction. There is no lifetime, cross-source normalized-email unique key. Concurrent first submissions can race, an older lead can produce a second record, and the same email can exist under several sources. Firebase Auth account uniqueness does not provide lead uniqueness.

The current mobile path creates no lead, so today it cannot itself create a second lead; connecting it to the existing helper unchanged would inherit those problems. Clarity submissions themselves are separate history records and should not be confused with duplicate contact records.

Nurture is idempotent for a retained lead ID, including legacy tasks queried by submissionId. A different lead ID for the same email can create another sequence/welcome. Results email delivery has no explicit request idempotency key. The scheduler does not claim tasks before delivery; concurrent scheduler runs/provider-success-before-status-write remain duplicate-delivery risks to assess.

## Existing Launch Metrics contract

Latest main uses `lib/launch-metrics/events.ts`: `clarity_check_complete` is counted for a valid fresh result attempt; `email_signup` only for `{ok:true, enrollment:'enrolled', id}`. An account creation or lead write alone is not email_signup. Native `analyticsCore.ts`/`analyticsEvents.ts` already record sign_up, clarity_check_start and clarity_check_complete; native email_signup is not yet supported. Preserve the configured analytics gate and count no-consent app users as Clarity completions, not marketing signups. Do not replace these with the older `clarity_check_completed` helper in lib/analytics.ts.

## Concrete Step 2 proposal for confirmation

1. Share a server lifecycle helper between native completion and web email capture. Native identity/email come from verified Auth, not client claims. Do not fabricate the required web name for unnamed app accounts; give the shared helper an optional authenticated display name and a neutral greeting.
2. Resolve one contact for a normalized email for its lifetime, transactionally. Reuse existing records and preserve consent/opt-out/subscription fields. Legacy duplicate reconciliation needs an explicit migration plan; no live consolidation is authorized by this audit.
3. Separate transactional results/welcome from nurture. Persist a once-only welcome claim keyed by contact; use provider idempotency keys where supported and a retry-safe delivery record. Key results delivery to a stable submitted attempt so retries do not duplicate it; a genuine retake can have new results while welcome/nurture remain unchanged.
4. Enroll marketing only with an affirmative recorded consent and no suppression. Do not enroll app users from account creation alone, downgrade consent, resubscribe, or reset existing tasks. Protect the shared web path too; no-consent lead capture is not enrollment.
5. Preserve Clarity questions, scoring, identity types and results copy byte-for-byte. Instrument the existing completion/enrollment events without answers or personal data.
6. Test entirely with local fakes/provider mocks: new user; existing web lead using app (including a lead older than seven days); retake; duplicate/concurrent submits; no consent; opted-out user; preserved consent/status; provider failure/retry. Do not send test or live email to real addresses.

## Verification and limits

Verified by reading the named routes/helpers in fetched origin/main and comparing the user's checkout where relevant. No source implementation changed; the branch diff contains this report only, so Clarity source is unchanged. No P0 scenario tests, TypeScript, lint or exports have been claimed or run for a fix that has not been made. Production data, deployed backend behavior, provider delivery, uploaded app versions and physical devices are unverified.

Local commit hash is reported in the chat after committing this document. Nothing was pushed or merged. Step 2 remains paused for the brief's explicit findings-confirmation gate.

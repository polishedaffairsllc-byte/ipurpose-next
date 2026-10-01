# Canonical Firestore alignment (branch only)

Lab completion formerly wrote to two stores and could replace the learning-path steps array. Legacy text POSTs saved to a different path from their readers. Mixed Clarity schemas could hide a questionnaire, and Blueprint saves could report success after HTTP failures.

- `lab_completion/{uid}_{lab}` is the only runtime completion store. A transaction creates the requested canonical record and merges existing progress, deduplicating the six known steps and preserving all other step entries. Original completion timestamps survive retries. There is no legacy fallback, mirror, automatic migration or deletion.
- `identity_maps/{uid}`, `meaning_maps/{uid}` and `agency_maps/{uid}` are the canonical content stores. Integration loads `/active` and formats only the three defined structured content fields. Companion uses those same maps. Dashboard's lab-content fallback uses the Identity map. No legacy free text is converted. Old text POSTs and the unused generic completion POST return HTTP 410; generic completion GET reads canonical records.
- New questionnaire submissions have `type: questionnaire`. Compatible legacy records remain readable without a backfill. Explicit conversation records, unknown types and ambiguous legacy shapes are excluded from questionnaire readers. Latest selection pages past conversations, prefers UID, then allows a Firebase-verified account-email fallback only for records without a conflicting owner. Results, onboarding, founder intake, resend-email and the manual questionnaire report apply the type guard. No current conversation writer for this collection was found; its historical/external producer remains an open item.
- Blueprint checks HTTP status, serializes saves, exposes an error and retry, and does not mark failed saves successful. Editing waits for existing answers to load; auth changes invalidate pending saves.

No GA4 writer/configuration or historical analytics document is changed by this branch. Separate local reports contain the read-only analytics trace, an unapplied analytics diff, a metadata-only migration proposal and the ten-record no-contact cleanup proposal. No production migration, deletion, archive, answer export or deployment was performed during this branch-only continuation. The earlier scoped repair of two legacy flags predates these restrictions; no further legacy repair is proposed.

The fresh live inventory found no unmatched legacy completion flags. Proposed Clarity type backfill: 16 questionnaires and 8 conversations, subject to full-shape verification and separate approval. Ten no-contact questionnaires remain unlinked. The two historical `clarity_checks` records stay in place. Anonymous cleanup is not safe to call dependency-free: founder intake, result URLs and the manual funnel report still consume these records.

## Verification and release prerequisites

Run local regressions with Java 21 and Firebase CLI:

```sh
firebase emulators:exec --only firestore --project demo-data-alignment --config firebase.alignment-test.json "npm run test:firestore-alignment"
```

The tests refuse to run without a localhost emulator and always use the demo project. They cover preservation of Orientation/Integration/Community, concurrent completions, no legacy writes/backfill, timestamp idempotence, paginated type selection, UID precedence and conflicting-owner exclusion, HTTP failure/retry, save ordering, and the actual save → active reload → dashboard → Integration data flow for all three labs. The route harness stubs authentication and injects the emulator; it does not prove browser authentication or production indexes.

Before any production proposal, complete signed-in browser acceptance for Integration and Blueprint retry, review CI gates, and arrange an approved index rollout (`uid ASC, createdAt DESC` for Clarity, retaining the existing email index). Never deploy indexes, migrate data or release the application automatically from this audit. Production website baseline was independently verified at `292bb3713ad87e30ddf8916303cf096fbc531366` through Vercel's production alias metadata. The branch remains a draft review candidate.

Local checks on the revised branch: 12/12 emulator tests; 27/27 existing Node tests; production build including TypeScript passed using demo configuration; ESLint 0 errors (945 warnings); existing Playwright suite 8 passed, 6 environment-gated skips. The existing dependency audit still has an unresolved high-severity transitive dependency finding; no dependency or lockfile changes are included. These checks do not authorize a production rollout.

# Firestore data alignment repair

The lab completion APIs previously used different collections, and lab completion replaced the entire learning-path steps array. Legacy text-only lab POST handlers also saved to a path their GET handlers never read. Mixed questionnaire/conversation records could hide the latest questionnaire from the companion and dashboard.

## Behavior after this change

- `lab_completion/{uid}_{lab}` is the canonical completion record. Shared readers retain compatibility with `labCompletion/{uid}`. A completion transaction reconciles known legacy flags into canonical records, mirrors true flags back to the legacy document, and adds progress without dropping any earlier step. Existing completion timestamps are preserved; unknown historical dates are not invented.
- Learning-path updates merge completed steps and calculate percentage on the server. Initialization is transactional, so an initial page load cannot reset a concurrently completed lab.
- The unused text-only `POST /api/labs/{identity,meaning,agency}` handlers return 410. Current editors already use the matching `/save` and `/active` endpoints. GET remains available for Integration summaries. No existing lab answer is moved or deleted.
- Clarity Check readers prefer UID-owned questionnaire records, page past conversation records, then fall back to the authenticated account's email. A record explicitly owned by another UID is excluded from the fallback. The two historical `clarity_checks` records are not migrated; their intended mapping needs a separate ownership/content review.
- AI Blueprint saves check HTTP status, display errors and offer retry. Requests are serialized, newer edits keep their pending status, and editing waits for the user's saved answers to load.

## Release order

1. Deploy the added `clarityCheckSubmissions` index on `uid ASC, createdAt DESC` and wait until it is ready. The existing email/createdAt index is retained. Review any index deletion prompts instead of accepting them.
2. Deploy the application revision after normal review and passing deployment gates.
3. On an approved test account, confirm lab save/reload, lab completion on the dashboard, preservation of non-lab learning progress, and questionnaire selection after a newer conversation. Verify Blueprint failed-save feedback and retry.

No database migration script is bundled in the application. The separately audited single legacy completion record was corrected by a scoped, update-time-guarded operation; both completion representations were verified to show Identity, Meaning and Agency complete. Answers, anonymous Clarity Check records, and unrelated collections were not modified.

## Regression checks

Run the emulator tests with an installed Firebase CLI and Java 21:

```sh
firebase emulators:exec --only firestore --project demo-data-alignment --config firebase.alignment-test.json "npm run test:firestore-alignment"
```

The tests refuse to run without a localhost emulator and always use `demo-data-alignment`. They cover concurrent completions, preservation of non-lab steps, timestamp idempotence, legacy compatibility, paginated questionnaire lookup, ownership checks, HTTP failure/retry and save ordering. CI runs this as a separate job using Firebase CLI 15.6.0.

Local validation:

- 8 Firestore/save regression tests passed against the emulator.
- 27 existing Node regression tests passed.
- TypeScript check and production build passed with demo Firebase configuration and CI mode.
- Repository ESLint passed with existing warnings.
- Existing Playwright suite: 8 passed, 6 skipped under its environment gates.
- Required production dependency audit remains failing: 1 high and 8 moderate findings in the existing dependency tree. The high finding is transitive `undici`; no dependency versions or lockfile entries were changed here.

The production application revision has not been deployed by this change. Emulator tests do not prove index readiness or authenticated behavior in the production deployment.

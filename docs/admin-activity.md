# Admin activity and test-account purge

The Launch Metrics page adds an admin-only **People & activity** panel backed by
`/api/admin/launch-activity`. Existing weekly charts, the read-only metrics feed/MCP,
GA4 routing, and Firebase sign-in behavior are unchanged.

## Browse

- Login accounts: Firebase Auth (including disabled accounts).
- Saved profiles: `users`, including orphaned profiles.
- Captured emails: `leads`, including legacy `timestamp` records.
- Clarity Checks: `clarityCheckSubmissions`, including repeated and anonymous checks.
- Info-session signups: `infoSessionRegistrations`.
- Cohort signups: `cohort-registrations` (workshop leads also appear in Captured emails).
- Email queue/history: `emailTasks`. These are messages, **not** distinct subscriptions.

Each category pages through all retained records in batches of 100. Firestore uses
document-ID pagination so missing dates do not silently exclude older records.
Loaded records are sorted newest-first and searchable. The search label explicitly
says **loaded records**; keep loading pages to search all history. Repeated lead
submissions already collapsed by the signup code cannot be reconstructed. Platform
is not guessed from a login or email address. Missing email/date values stay missing.

## Permanent purge

1. Sign in with a Firebase app account with the existing `admin: true` custom claim.
2. Choose **Preview purge** on a test record. The server resolves its identity and
   shows all affected document paths, actions, and pending-email count. Nothing is
   deleted by preview. For an anonymous record, no account identity is invented.
3. Verify the entire person's linked records, not just the clicked row. Check the
   acknowledgment and type the exact `PURGE …` phrase.
4. Click **Permanently purge**. A sign-in within five minutes is required; sign out
   and back in if prompted. The server independently verifies current admin claims,
   revocation, origin, current target identity, and the preview fingerprint.

Purge disables the target login and revokes refresh tokens, applies a conditional
Firestore batch, then deletes the Firebase Auth account. Existing account-deletion
policy is reused: product/profile records and their descendants are removed;
purchase records are retained and de-linked; community posts are tombstoned so
other people's replies remain. Activity records and email queue/history for the
resolved identity are removed. Mixed-case legacy emails are matched carefully.

Your own account, configured founder email, `mshmltn@gmail.com`,
`renita@ipurposesoul.com`, admin/founder claims, and admin/founder profiles are
protected. Ambiguous identities are blocked rather than guessed. There is no
automatic test detection, purge-all button, or email-domain based deletion.

A minimal `email_opt_outs` suppression document is retained to block re-enrollment.
The scheduler re-reads a queued task and suppression status immediately before
delivery; missing/non-pending/suppressed tasks and lookup failures are skipped.
Messages already handed to the provider cannot be recalled. This is not an external
email-provider erasure request, and a person can later create a new login. Purge is
intended for inactive test data; new writes that start concurrently are not part of
an already reviewed batch. Review the lists again afterward.

The UI has no undo. No GA4 events, `analytics_weekly` snapshots, Stripe records,
Firebase console memberships, or Auth0 connector grants are deleted. Therefore
weekly charts do **not** automatically become test-filtered after cleanup.

## Failure safety and limits

The preview fingerprints document versions and the Auth identity; stale previews
are rejected. Each Firestore mutation has a last-update-time precondition and the
batch is atomic. Auth and Firestore are not one transaction: on failure, an account
may remain disabled and some cleanup may already have completed. The response says
this explicitly. Refresh **Login accounts**, preview the disabled account again,
and retry. Do not interpret a failure as completion.

Purge refuses more than 350 affected documents or a legacy source collection above
10,000 records, without silently truncating. Such cases need an indexed migration
or separately reviewed maintenance job. Preview currently scans these bounded
legacy collections to match mixed-case emails, so Firestore read charges scale with
their sizes. List reads are paginated. No new service or environment secret is added.

## Verification

```sh
node --test tests/admin-activity.test.cjs
node --import tsx --test tests/account-deletion.node.ts
node node_modules/typescript/bin/tsc -p tests/tsconfig.admin-activity.json --noEmit
node tests/admin-activity.browser.mjs
```

The browser test uses the actual component with synthetic Auth and HTTP boundaries;
it never loads a production token or deletes a real record. Live IAM permissions
and end-to-end production admin access must be verified after deployment without
purging a real user merely as a test.

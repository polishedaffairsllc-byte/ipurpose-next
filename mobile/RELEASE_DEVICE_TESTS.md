# Signed-build physical-device checks

## Android correction pass — 1.0.2 / code 3 authorized for Internal Testing

Renita reported PASS on Android **1.0.1 / code 2** for controlled disposable-account
creation, sign-out, manual sign-in, repeated sign-in and account deletion.
Authentication and deletion are no longer current blockers. This evidence does
not cover the newly prepared password/keyboard and branding corrections.

After a new build is reviewed and authorized, record its actual version/code from
Android app details (and the matching Play internal release), phone model, Android
version, navigation mode and font scale. Do not label code 2 as the updated build.

1. On a small Android display, open Create Account with the keyboard visible.
   Focus Password, then Confirm Password. Confirm each field and its Show/Hide
   control scroll fully above the keyboard. Scroll to and tap Create Account
   without dismissing the keyboard first. Repeat with enlarged system text.
2. Show and hide Password and Confirm Password independently. Confirm their
   values and exact letter case remain intact; mismatched values prevent submit.
3. With the device password manager enabled, check generated/saved credentials
   on creation, retrieval/autofill on Sign In, and current-password autofill in
   deletion confirmation. Do not turn autofill off for this check. Confirm
   toggling visibility preserves the filled value.
4. Sign out, sign back in repeatedly, then delete the disposable account. Check
   Show/Hide in deletion and that cancel/reopen clears and hides the password.
5. Verify iPurpose product headers, iPurpose Compass experience header, Compass
   message labels, Soul → Systems → AI and the approved detailed gold emblem.
   Check that all three approved welcome statements are unchanged.
6. Repeat keyboard reachability with gesture and three-button navigation. Record
   pass/fail separately from the automated geometry tests; those use native mocks
   and cannot certify a real Android keyboard or password manager.

See [PHYSICAL_ANDROID_QA_FINDINGS.md](PHYSICAL_ANDROID_QA_FINDINGS.md) for completed
code changes and [CLARITY_WORKFLOW_AUDIT.md](CLARITY_WORKFLOW_AUDIT.md) for the
separate email-workflow proposal awaiting approval.

## Full signed-build data lifecycle

For Android public-launch layout coverage, also run the pending matrix in
[ANDROID_LAUNCH_QA.md](ANDROID_LAUNCH_QA.md). Items 1, 2, and 4 require native evidence
before release sign-off.

Use disposable email/password accounts only. Never run account-deletion testing
with an owner, founder, customer, or paid account.

Run the complete sequence once on a physical iPhone and once on a physical
Android phone using the signed build for that platform:

1. Create a unique disposable account in the app and record its Firebase UID.
2. Complete the Clarity Check and Current Focus steps so onboarding completes.
3. Open Compass, send one harmless test message, and confirm a reply and
   conversation history are visible.
4. In Firebase Console, confirm test-only records exist for the UID, including
   the `users/{uid}` profile, its `companionConversations` subcollection, a
   matching `clarityCheckSubmissions` document, and `rate-limits/{uid}` after
   Compass usage.
5. To cover retained/tombstoned behavior, create clearly labeled test fixtures:
   a `community_posts` document whose `authorUid` is the disposable UID with one
   nested comment from a different test UID, and a `purchases` document whose
   `uid` is the disposable UID. Do not use a real Stripe transaction.
6. In Account → Account & Security, tap **Delete account**. Read the destructive
   warning, enter the disposable account password, and tap **Permanently delete
   account**. Confirm that the app returns to the signed-out welcome experience.
7. In Firebase Authentication, verify that the disposable UID no longer exists.
8. In Firestore, verify that `users/{uid}` and all nested data are gone; matching
   Clarity Check, Compass/GPT history, preferences, lab/workflow data, rate-limit
   state, email tasks, leads, and user-authored comments are gone.
9. Verify the test community post remains only as a tombstone: `isDeleted` is
   true, title/body are empty, `authorUid` is `deleted-user`, and the other test
   user's nested comment still exists.
10. Verify the test purchase record remains for audit purposes, its `uid` field
    is absent, and `accountDeletedAt` is present.
11. Attempt to sign in with the deleted email/password. Verify authentication
    fails and no new profile or onboarding data is created automatically.
12. Remove any test fixture that remains and record platform, OS version, app
    version/build number, timestamp, and pass/fail evidence in the release log.

If deletion fails, preserve the disposable UID and error details for diagnosis;
do not retry with a real account.

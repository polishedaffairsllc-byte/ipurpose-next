# Signed-build physical-device checks

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

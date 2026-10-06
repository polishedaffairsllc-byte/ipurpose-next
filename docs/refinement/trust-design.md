# Identity, email, and public-form trust design

Email verification answers **“Can this person receive mail at this address?”** Bot protection answers **“Does this submission appear to come from a legitimate human interaction?”** A confirmed email can still submit spam. A legitimate person can have an unusual name or dotted/plus-tagged Gmail address. No name-shape, Gmail-dot, dictionary-name, ethnicity, or semantic “nonsense” classifier is used.

## Account identity

Firebase Auth remains authoritative. Mobile and web signup request Firebase's verification email without turning a provider delivery failure into failed account creation. Account offers send/resend/check, refreshes on focus and foreground, reloads Firebase user state and refreshes the ID token. Web dashboard links to `/verify-email`. `/api/auth/email-status` accepts real bearer or session authentication and reads the current Admin SDK user; it does not trust client-supplied verification/consent flags. No password, verification action code, email, or Purpose answer is added to analytics.

The implementation follows Firebase's [user-management verification flow](https://firebase.google.com/docs/auth/web/manage-users) and [Admin user lookup](https://firebase.google.com/docs/auth/admin/manage-users). IP throttling uses Vercel's documented [trusted request headers](https://vercel.com/docs/headers/request-headers).

Unverified accounts retain sign-in, purchased entitlements, Clarity, Purpose, Compass, private saved profile, retakes, preferences, and deletion. They are ineligible for marketing until reachability and their separate explicit opt-in are established. Verification alone never grants consent, clears an opt-out, queues a campaign, or sends promotional mail. Existing neutral welcome and results are transactional and remain available.

`emailTrust/{sha256(normalizedEmail)}` is a server-owned reachability registry. For Firebase records, it identifies the Auth UID and verified status. Marketing delivery reads live Firebase state immediately before sending, including disabled/deleted users. A stale registry record cannot authorize delivery for a deleted account. Marketing consent on client-writable user documents can authorize only the UID matching the authoritative address identity; changing a profile email cannot consent on another person's behalf. Explicit consent on private lead records is also recognized. All existing opt-out checks remain authoritative.

## Guest Clarity capture

Prior lifecycle: the anonymous questionnaire returns results, email capture resolves a lead, sends requested results, and historically attempted implicit web nurture enrollment. It did not prove mail reachability. Mobile already required the approved explicit consent checkbox.

Current lifecycle: keep assessment/results and requested results delivery; send a separate neutral confirmation link. The contact starts unverified. A cryptographically random 32-byte token is stored only as a SHA-256 hash, expires after 24 hours, is invalidated on replacement, and is consumed atomically once. Requests for the same unverified address are limited to one per 15 minutes; provider failure allows recovery. Confirmation is a POST triggered by an explicit button, so email link scanners cannot confirm by GET. The receipt has no analytics/marketing layout, a strict CSP, no-referrer/no-store headers, and clears its URL fragment before confirmation. It cannot grant marketing consent or verify a Firebase account.

The existing web nurture enrollment no longer treats merely entered email or legacy implicit enrollment as verified consent. No new consent checkbox/text is invented. When there is no approved explicit consent record, marketing remains ineligible even after confirmation. This corrects a trust gap; existing campaigns and queued tasks also face the delivery gate. There is no automatic campaign/backfill on verification. A subsequent eligible Clarity completion may enroll using its separate approved consent. Deliberate owner authorization would be needed for any future public consent-copy change or verified-contact migration.

## Public-form defenses

Contact, anonymous Clarity questionnaire, Clarity email capture, info-session, workshop, and the dormant welcome-popup endpoint use the shared server protection. Live web callers request invisible challenges through `usePublicForm`; dormant popup callers must adopt that helper before reactivation.

- Server-issued random token binds to action and trusted infrastructure IP; minimum 1.5 seconds, maximum 2 hours. No client timestamp can establish age. The client helper handles immediately autofilled submissions with a brief automatic wait.
- Firestore transactions share throttles across server instances: contact 5 per IP per 10 minutes, other lead forms 8, anonymous questionnaire 15, confirmation 20. Address-based form throttles cap repeated requests across different IPs. Challenge issuance is limited to 60 per IP per 10 minutes.
- Honeypot submissions are dropped without lead storage/notification. Contact has an invisible website field; Clarity capture/workshop retain existing fields. Server checks also apply independently of client code.
- Atomic token consumption and payload fingerprints prevent concurrent replay and duplicate notifications. Anonymous questionnaire duplicates are IP-scoped so two people selecting the same answers are not conflated. Contact storage failure releases only its own reservation, allowing retry without resetting throttles.
- JSON streaming size limit 24 KB; type/length/control-character checks; basic email syntax. Contact names permit one-character names and any writing system. Contact HTML notifications escape input.
- Database failure fails closed for public intake. No new CAPTCHA provider, tracking cookie, device fingerprint, DNS mailbox guess, or third-party bot SDK is introduced. A sufficiently capable automated browser can still imitate interaction; monitor actual abuse before escalating to managed challenges.

Firebase SDK account creation is a separate direct service entry point. A Next form token cannot secure it. Keep Firebase's service quotas/abuse protections and consider a supported managed Firebase/Identity Platform challenge if signup abuse warrants it; no claim is made that the contact guard protects direct Firebase account creation. Native authenticated Clarity keeps its existing stable request ID and server Auth-owned email/UID; public challenge requirements do not break existing internal mobile builds.

## Rules, deletion, retention and deployment

Read-only production rules audit retrieved ruleset `projects/ipurpose-mvp/rulesets/1f138af5-7902-4e51-8e66-13759b776344`. It permits each UID to read/write its own `users/{uid}` only and denies every other collection. Thus emailTrust/publicChallenges/publicThrottle/publicReplays inherit client denial. No production rules were modified. Explicit deny snippets are provided for future policy maintenance; overlapping allow rules must never expose these collections.

Account deletion also removes emailTrust records matching the account email, including pending guest confirmation secrets for that address. Dedicated Purpose deletion still removes only Purpose results/reflection and updates both summaries through the same provider.

Enable Firestore TTL for `expiresAt` in publicChallenges/publicThrottle/publicReplays before production rollout, using additive field-policy updates; do not synchronize/delete unrelated indexes. Expired entries are ignored by application logic even before physical TTL removal. Email reachability persists until address/account deletion; pending confirmation token hashes become unusable after 24 hours and are cleared on successful confirmation/replacement. No plaintext confirmation tokens or raw IPs are stored in the new protection collections (IP bucket identifiers are hashes). Existing lead context fields are unchanged.

Deploy the reviewed web/API branch as a unit before a mobile rebuild. It adds `/api/auth/email-status`, `/api/public/challenge`, `/api/email/confirm`, `/confirm-email`, `/verify-email`, and the marketing delivery gates. Keep existing Resend/Firebase credentials and native analytics setup. No new secret/provider/signing credential is required. Confirm deployed endpoints, default-deny rules, TTL retention, Firebase templates/authorized domain, real mailbox receipt/confirmation, and consent/opt-out suppression using owned test identities before producing signed candidates. No backend deployment or production marketing/verification send was performed during local validation.

## Privacy/store review draft

Add a privacy disclosure that email confirmation verifies reachability, verification remains separate from optional marketing consent, and temporary request security records (timestamps, token hashes, hashed IP-based rate buckets, duplicate fingerprints) help protect public forms. Explain the relevant retention above once TTL is actually enabled. Preserve the previously approved Purpose disclosure and Compass-history caveat; the current source policy still lacks the Purpose disclosure.

Apple App Privacy and Google Play Data Safety require owner review of linked email verification status/account information and anti-abuse diagnostics, plus the already identified Purpose answers/results/optional reflection. Existing email/name categories may already cover identity, but do not assert store declarations are sufficient without comparing the current submitted forms. No new advertising collection, CAPTCHA/device identifier, or Firebase analytics configuration is introduced. Do not alter or resubmit Google Play production 1.0.2/code 5 or its review as part of this batch.

Apple requires accurate answers to be maintained as practices change; Google's form must accurately cover the app's collection/use practices. Actual declaration changes depend on the submitted answers, which were not altered or certified here. See [Apple App Privacy](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy) and [Google Play Data Safety](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en).

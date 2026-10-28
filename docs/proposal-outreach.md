# Proposal & Partnership Outreach

Standalone infrastructure from main, first integrated with the three live SDSN proposals. No dependency on PR #89, no UG feature assets or registration, no GA4 architecture/settings change.

## Registry and opt-in

`lib/outreach/registry.ts` is the controlled proposal registry. Each entry declares `id`, `family`, `organization`, `recipientId`, `deckVariant`, `pagePath`, `slideCount`, and a source-event-name → generic event-type allowlist. Neither the browser nor ingestion API can invent these fields. A future family (including UG) adds an entry and calls `createOutreachLogger()` in its existing emitter. No additional ledger, endpoint, dashboard or MCP tool is required. UG integration is deliberately deferred to PR #89.

The SDSN event sender invokes the logger once before the existing GA readiness queue. GA event names, parameters, destinations, exclusion behavior and pending-event delivery remain unchanged. First-party failures cannot block GA or the presentation. The client uses a bounded sendBeacon JSON body, or a keepalive fetch when beacon is unavailable/rejected.

## Ledger schema

Collection: `proposalOutreachEvents`. Document ID: `<production|preview>_<event UUID>` (atomic create deduplicates retries).

Stored fields only:

- `timestamp`: Firestore serverTimestamp, authoritative UTC receipt time
- `client_timestamp`: client ISO timestamp (not trusted for reporting time)
- `event_id`: random UUID, no identity/advertising ID
- `session_id`: random UUID for this proposal-page visit; not cross-site or account-linked
- `proposal_id`, `proposal_family`, `organization`, `recipient_id`, `deck_variant`, `page_path`: controlled registry values
- `event_type`: generic interaction type; `source_event_name`: original emitter/GA name
- `visit_number`: existing browser-local visit number; `sequence`: per-visit event order
- `slide_number`, `interaction_type`, `method`: only where applicable, strictly allowlisted
- `traffic_type`: internal/external; `debug_mode`: boolean
- `environment`: server-derived production/preview, never supplied by the browser
- optional `outreach_id`: SHA-256 ID of a registered opaque outreach record

No name, email, IP, account ID, referrer, full URL query, user agent, GA client ID, ad identifier or token is written. Ingestion intentionally does not log request bodies/identities or diagnostics. Hosting infrastructure may maintain its standard request logs independently of this collection.

## Ingestion / read APIs

`POST /api/outreach/event` accepts JSON only, streams at most 4096 bytes, rejects unknown fields/events/proposals/paths, checks same-origin Origin and Fetch Metadata, validates same-page Referer when present, and creates one ledger document. Public ingestion is untrusted activity telemetry, not proof of a human identity. Same-origin checks reduce browser abuse but are not authentication against scripts that forge headers.

Preview/QA query markers, persistent SDSN/internal/QA browser keys, debug activity and existing owner/admin Firebase sessions classify as internal. The server also checks existing owner/admin session claims/profile flags without retaining identity. Test visits should use `?preview=1`. A deliberately unmarked anonymous test cannot be distinguished from an anonymous recipient. Preview and production ledgers are strictly separated in read responses even when they use the same Firestore project.

`GET /api/admin/proposal-outreach` requires a verified, non-revoked Firebase ID token and current, enabled administrator claims, matching existing admin authorization. Filters: `window=today|24h|7d`, optional registered `proposal`, `includeInternal=1` (default false). Responses are private/no-store and contain no account data. UI refreshes about every 30 seconds only when the panel is visible and the document is foregrounded. Requests after sign-out/filter changes cannot populate stale privileged state.

The existing owner-only Launch Metrics v2 feed returns `outreach.proposals`, `outreach.recentEvents`, timestamps, timezone, externalOnly, environment, period and historical recovery. Existing get_launch_metrics returns the response unchanged; OAuth and owner protection are untouched. Legacy non-v2 snapshot responses remain compatible. Default feed window is seven days, external only, current deployment environment.

## Summaries / precision

First-party summaries cover the selected period, not lifetime totals. Visits are distinct anonymous page visits, not unique people. First visit means the earliest logged page-view event in that period. An opened page is not an opened email. UTC is retained; UI uses America/New_York with seconds. Sequence determines within-visit order when network receipt order differs; actual server receipt timestamps remain visible. More than 10,000 scanned events yields an explicit partial-results warning, never a silently complete summary.

Historical October 28, 2026 GA4 recovery uses the existing read-only Data API credentials/client and registered dimensions discovered through metadata. The GA4 Admin API reads the property timezone where permitted. Historical rows are aggregate minute buckets, not invented event records/visit identities. Missing/unset traffic classification is unknown, hidden by default, and never called confirmed external activity. Historical rows remain separate from ledger summaries to prevent double counting. Processing delays, unsupported dimensions, timezone unavailability and query failures are reported. Cache lifetime is five minutes.

## Opaque future outreach links

`node --conditions=react-server --import tsx scripts/outreach-maintenance.ts create-link <registered-proposal-id>` creates a random 256-bit opaque token. It prints a future URL with `?outreach=<token>`. Do not change already-sent links. Server registry `proposalOutreachLinks/<sha256(token)>` stores only `proposal_id`, `enabled` and an `expiresAt` timestamp (180 days). No person/contact record is required or created. Unknown, expired, disabled or mismatched-proposal tokens are discarded from events. Recognized token IDs can distinguish shared-link activity; they still do not prove who opened a forwarded link. To associate tokens with outreach contacts, use a separately authorized server-side system; names/emails must never enter URLs or event documents.

## Security and 180-day retention

Both new collections are server-only. Apply the deny-all blocks in `firestore.rules.snippet` within the project's authoritative Firestore rules; never deploy that partial snippet as the full ruleset. Direct anonymous/client SDK access must be denied. Admin SDK routes enforce the authorizations above. No client Firestore access is used.

Each successful ingestion schedules a bounded after-response sweep of up to 200 events older than 180 days by server timestamp. All read windows are at most seven days, so expired events cannot be displayed. For low-traffic periods/backlogs, an operator should run daily (and after a long idle period):

`node --conditions=react-server --import tsx scripts/outreach-maintenance.ts cleanup`

This command deletes expired event documents in batches and up to 200 expired opaque-link registrations per invocation. No TTL policy, scheduled production job or production rules deployment is silently configured by this preview PR. Configure the operator's scheduler when approving production; without activity or that command, physical deletion may lag the retention cutoff. Existing data outside these two collections is untouched.

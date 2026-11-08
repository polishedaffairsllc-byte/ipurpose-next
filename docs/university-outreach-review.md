# University outreach review previews

This branch implements 39 new institution briefs using one template, alongside review records for the already-contacted University of Ghana and KNUST. There are 30 Ghana institutions and 11 HBCUs. The Wa seed name is reconciled to Dr Hilla Limann Technical University using its official site. Existing SDSN, UG, KNUST and Found(her)s content, assets and event names are preserved.

## Approval boundary

Every record remains `awaiting_user_approval`. New targets are `unsent`; UG/KNUST are `already_contacted`. There is no sending, scheduling, approval mutation or publishing endpoint. No email task is enqueued. A separate explicit approval of each institution page and matching email is required before a later implementation can publish/contact that institution. New university pages, opaque redirects and the review API are preview-only and return 404 in production. Production activation will require a separately reviewed change; environment promotion alone cannot publish these pages.

The 39 pages and emails contain no proposal PDFs or price/waiver discussion. Existing approved UG/KNUST pages and their downloads remain unchanged. Existing institutions receive optional follow-up drafts only, blocked pending reconciliation of the prior recipient links and send dates; no duplicate initial outreach is generated.

## Data and privacy

- `lib/universities/institutions.json`: public, source-backed institution context and potential fit; no contact names/emails or tokens.
- `lib/universities/registry.ts`: university family entries appended to the existing generic proposal registry. No new event ledger, ingestion API, metrics API or MCP tool.
- Existing `proposalOutreachLinks/<sha256(token)>`: 256-bit capability, controlled proposal/institution/contact/campaign mapping, expiry, preview environment and review status. The raw review token is retained only in this server-only record so the authenticated review queue can retrieve a working preview link.
- `proposalOutreachContacts/<UUID>`: private, business-contact verification and draft-review metadata. Names/emails are returned only through the existing verified-admin authorization boundary. No contact fields enter event documents, public configuration, URLs or GA4 parameters. Opaque contact UUIDs and hashed outreach IDs identify a link, never a confirmed reader.
- Existing `proposalOutreachEvents`: seven new `proposal_` source events map into generic event types, with server-derived contact/institution/campaign attribution, authoritative receipt timestamps and preview/internal classification. Existing family input/output and GA4 routing remain unchanged.

The actual Firebase rules must deny anonymous reads of all three collections before seed writes. The operator command checks this and stops on any other result. `firestore.rules.snippet` documents the new collection deny rule; this branch does not deploy rules. Never commit/export contacts, raw tokens, credentials or authentication state into public artifacts.

## Counting and delivery

`/p/[token]` records raw link access at sequence 0, then redirects to the controlled page with an anonymous, HttpOnly, SameSite session cookie. Raw accesses and page loads are separate metrics, so the redirect is not counted as a second visit. Browser page loads, anonymous sessions, returns, section observations, observed interactions and each outbound destination are reported separately. A visible section observed for 700 ms is not a reading claim. Trusted browser input is an interaction signal, not proof of a human or a named reader. Transient scanner/prefetch headers can classify likely automation; full user agent/IP is not stored.

Allowed outbound destinations use `/p/[token]/go/[destination]`. The server awaits the ledger write before redirecting. Browser beacon and redirect share one event UUID for atomic deduplication; logging failure does not trap the visitor. A conversation click is neither proof that an email client opened nor an email was sent. All current university test activity is internal/preview and remains excluded from default external metrics.

The existing GA4 sender delivers the new source names to the same configured measurement IDs, using opaque IDs only. Google Ads and normal site chrome/Meta are excluded on the new university family. Existing public-site behavior and existing SDSN/UG exclusions are preserved.

## Review and exports

- `/admin/university-outreach`: administrator-only queue of 41 records, source and contact blockers, private preview links, plain-text email drafts and CSV export. Unknown contacts block sending, not page construction.
- Existing `/admin/launch-metrics`: initiative dropdown includes each new institution; recipient dropdown filters first-party events by server-derived UUID. Activity CSV export uses only the selected initiative/recipient/period. GA4 aggregate history is not presented as recipient-token evidence.
- Existing v2 feed and MCP expose the same generic `outreach.proposals`/`outreach.recentEvents`. There is no new feed credential, OAuth grant or tool. Preview integration is verified through the authenticated existing feed; the production connected MCP remains on current main until approval.

With existing server credentials loaded locally, use:

```
node --conditions=react-server --import tsx scripts/university-review.ts seed /private/path/contacts.json
node --conditions=react-server --import tsx scripts/university-review.ts export https://verified-preview.vercel.app /private/path/review.json
```

Private input is validated, seeded idempotently and contains one UUID per proposed recipient. Additional contacts at one institution get distinct records/tokens pointing to the shared page. No production URL or send date is invented. CSV cells are quoted and spreadsheet-formula prefixes escaped.

## Validation

Focused tests cover roster reconciliation, token expiry/revocation/environment scope, recipient isolation, strict event/destination allowlists, event deduplication, raw versus interactive counts, scanner labels, review-only drafts, and preservation of existing family events. Preview evidence and per-institution screenshots/contact caveats are delivered in a private local review package rather than committed to this repository.

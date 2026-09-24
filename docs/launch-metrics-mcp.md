# Owner-only ChatGPT MCP connector

## Scope and connection details

- Project: existing `ipurpose-next` Next.js/Vercel project.
- Server URL after deployment: `https://ipurposesoul.com/api/mcp`.
- Transport: stateless Streamable HTTP, using `mcp-handler` and the official MCP SDK.
- Tool: `get_launch_metrics`, with no arguments, read-only and idempotent.
- OAuth resource/audience: `https://ipurposesoul.com/api/mcp` (no trailing slash).
- Permission: `read:launch_metrics`.
- Discovery: `https://ipurposesoul.com/.well-known/oauth-protected-resource/api/mcp`.
- Only authorized identity: verified `mshmltn@gmail.com`.

The MCP server performs exactly one fixed HTTPS GET to the existing metrics feed
for a valid tool call. It does not import Firebase, access Firestore directly,
change analytics, enqueue jobs, or modify website authentication. The feed stays
unchanged. No UI, browser-side credential storage, OAuth session database,
custom token issuer, or additional Vercel project is introduced.

## Separate managed OAuth setup (required before activation)

Use a dedicated Auth0 tenant for this connector. Do not connect or migrate the
existing Firebase user database, change site login, or modify an existing site's
OAuth application. Provider setup is separate from the application code.

1. In that tenant, enable **Resource Parameter Compatibility Profile** and
   **Include Issuer in Authorization Responses** under Settings → Advanced.
   Confirm its discovery document advertises PKCE `S256`; do not fabricate
   discovery metadata in this application.
2. Register an API named `iPurpose Launch Metrics`, identifier
   `https://ipurposesoul.com/api/mcp`, signing algorithm RS256. Use the RFC 9068
   access-token profile, and set access-token lifetime to **900 seconds**.
   Add only the permission `read:launch_metrics` (read weekly launch metrics).
3. Register a dedicated **Regular Web Application** for ChatGPT. Use the
   authorization-code flow with S256 PKCE; do not enable implicit, password,
   or client-credentials grants. Use a predefined OAuth client for this small
   private integration; dynamic client registration is not needed.
4. Configure owner sign-in and verified email in this isolated tenant. Do not
   manually mark an unverified email as verified. If using Google login, use a
   production Google connection, not Auth0's shared development keys. Restrict
   the connection to this OAuth application. Disable public database signup if
   using a database connection and enroll only the owner through verification.
5. Deploy `ops/auth0/launch-metrics-owner.js` as a **Post Login Action**, bind it
   to the tenant's Login flow, and apply the flow. It denies other/unverified
   emails before granting access to this API and adds signed identity claims
   for the owner. It also runs on refresh grants. It has no secrets.
6. If API RBAC is enabled, assign the metrics-read permission only to the
   verified owner. Do not assign a general admin role or a write permission.
7. In ChatGPT's custom MCP connection management, choose OAuth and copy its
   **exact displayed callback URI** into this application's allowed callback
   URLs. Do not use wildcard callbacks or assume an older callback URI.
   Configure the predefined client ID and provider-issued client secret directly
   in ChatGPT's secure OAuth fields. Never put the feed token in these fields.
8. Add the two public configuration values below to Vercel **Production**, then
   deploy the tested code. Confirm issuer discovery, owner-denial Action binding,
   client registration and callback allowlist before declaring the connector live.

No provider client secret, signing key or access token belongs in this repo,
documentation, chat, browser JavaScript, screenshots, or logs. Auth0 issues and
manages the OAuth signing keys. ChatGPT stores the OAuth client credential and
access tokens; Vercel verifies signatures using public JWKS.

## Vercel environment variables

| Name | Purpose / required value |
| --- | --- |
| `LAUNCH_METRICS_FEED_TOKEN` | Existing server-side feed credential; preserve unchanged. |
| `LAUNCH_METRICS_OAUTH_ISSUER` | Actual dedicated Auth0 tenant issuer URL, HTTPS with trailing `/`, exactly matching discovery and issued tokens. The implementation accepts standard `*.auth0.com` tenant domains. Public configuration, not a secret. |
| `LAUNCH_METRICS_OAUTH_CLIENT_ID` | Actual provider-issued ID of the dedicated ChatGPT OAuth application. Public identifier, not its client secret. |

The last two are new. There is **no new production secret to generate in Vercel**.
Do not prefix them with `NEXT_PUBLIC_`, reuse the feed token as an OAuth
credential, or copy provider signing keys into Vercel. Missing/invalid configuration
fails closed: MCP requests receive 401 and discovery receives 503.

## Request security

The resource server checks RS256 signature, configured issuer, exact audience,
expiry, issued-at time (maximum age 15 minutes), configured OAuth client ID,
signed verified-email claims, and the read-only scope. Neither website cookies,
Firebase ID tokens, query-string tokens, nor the feed token authorize MCP access.
Every MCP request is checked, including initialization and tool discovery.
Present browser Origin headers are restricted to ChatGPT and the canonical site.
Responses and upstream reads are not cached. Feed redirects are rejected, and
feed requests time out after 10 seconds. Raw upstream errors are not returned.
Verbose MCP logging is disabled; no request/credential logging is installed.
Successful upstream JSON is returned unchanged; invalid or credential-echoing
responses are rejected instead of being forwarded.

Provider access revocation may take until an already-issued access token expires
(at most 15 minutes with the required configuration). Disable the dedicated
OAuth application and remove Vercel's OAuth client ID for emergency fail-closed
shutdown, without changing the feed token or website authentication.

## Tests and live acceptance

Run only the focused checks:

```sh
node --conditions=react-server --import tsx --test tests/launch-metrics-mcp.node.ts
npx tsc -p tests/tsconfig.launch-metrics-mcp.json
node --test tests/launch-metrics-feed.test.cjs
```

Local tests use generated, ephemeral signing keys and synthetic credentials.
They test the actual MCP protocol handler, owner authorization and denial,
upstream errors, and secret non-disclosure. They do **not** establish that an
Auth0 tenant has been configured or that a real owner completed OAuth.

After configuration and deployment:

1. Verify an unauthenticated POST to `/api/mcp` returns 401 and the metadata
   challenge; verify the discovery document advertises the actual issuer.
2. In ChatGPT, create a private connection named `iPurpose Launch Metrics` with
   the server URL above and OAuth, using the dedicated provider application's
   credentials in secure settings. Do not choose unauthenticated access.
3. Complete owner authorization as `mshmltn@gmail.com`. Confirm a non-owner
   identity is denied by the provider (using an approved test identity).
4. Invoke `get_launch_metrics` with `{}`. Check that the result contains the
   current real weekly snapshots, not test fixtures. Capture counts/dates only,
   never tokens, authorization headers, or OAuth callback codes.
5. Confirm the existing feed still rejects unauthenticated access. Do not
   treat a mocked test, 401 alone, or successful deployment as proof of live data.

## Cost and official references

No new Vercel project or datastore is needed. Normal Vercel function usage and
the existing feed's Firestore reads still apply. Auth0 advertises a free tier;
confirm the selected tenant's feature availability/plan before activation and
do not purchase an upgrade without owner approval.

- [OpenAI MCP authentication](https://developers.openai.com/plugins/build/auth)
- [Vercel MCP deployment](https://vercel.com/docs/mcp/deploy-mcp-servers-to-vercel)
- [Auth0 MCP setup](https://auth0.com/ai/docs/mcp/get-started/authorization-for-your-mcp-server)
- [Auth0 Post Login API](https://auth0.com/docs/actions/reference/post-login/post-login-api-object)
- [Auth0 pricing](https://auth0.com/pricing)

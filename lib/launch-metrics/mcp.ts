import 'server-only';
import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';
import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';

export const MCP_RESOURCE = 'https://ipurposesoul.com/api/mcp';
export const MCP_METADATA = 'https://ipurposesoul.com/.well-known/oauth-protected-resource/api/mcp';
export const MCP_SCOPE = 'read:launch_metrics';
export const OWNER_EMAIL = 'mshmltn@gmail.com';
export const EMAIL_CLAIM = 'https://ipurposesoul.com/mcp/email';
export const VERIFIED_CLAIM = 'https://ipurposesoul.com/mcp/email_verified';
const FEED_URL = 'https://ipurposesoul.com/api/admin/launch-metrics-feed';
const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store', Vary: 'Authorization' };

type OwnerVerification = 'owner' | 'forbidden' | 'invalid';
type VerifyOwner = (token: string) => Promise<OwnerVerification>;
type OAuthConfig = { issuer: string; clientId: string };

export function oauthConfig(): OAuthConfig | undefined {
  const issuer = process.env.LAUNCH_METRICS_OAUTH_ISSUER;
  const clientId = process.env.LAUNCH_METRICS_OAUTH_CLIENT_ID;
  if (!issuer || !clientId?.trim()) return undefined;
  try {
    const url = new URL(issuer);
    // A dedicated Auth0 tenant, not a URL supplied by an MCP caller.
    if (url.protocol !== 'https:' || !url.hostname.endsWith('.auth0.com')
      || url.pathname !== '/' || url.port || url.search || url.hash
      || url.username || url.password || url.href !== issuer) return undefined;
    return { issuer, clientId };
  } catch {
    return undefined;
  }
}

export function createOwnerVerifier(config: OAuthConfig, keys: JWTVerifyGetKey): VerifyOwner {
  return async token => {
    try {
      const { payload } = await jwtVerify(token, keys, {
        issuer: config.issuer,
        audience: MCP_RESOURCE,
        algorithms: ['RS256'],
        requiredClaims: ['iss', 'aud', 'sub', 'exp', 'iat'],
        maxTokenAge: '15m',
        clockTolerance: 5,
      });
      const scopes = typeof payload.scope === 'string' ? payload.scope.split(/\s+/) : [];
      if (typeof payload.sub !== 'string' || !payload.sub
        || (payload.client_id ?? payload.azp) !== config.clientId
        || payload[VERIFIED_CLAIM] !== true
        || typeof payload[EMAIL_CLAIM] !== 'string'
        || payload[EMAIL_CLAIM].toLowerCase() !== OWNER_EMAIL
        || !scopes.includes(MCP_SCOPE)) return 'forbidden';
      return 'owner';
    } catch {
      // JWT/JWKS errors can contain request details. Never log or return them.
      return 'invalid';
    }
  };
}

let configuredVerifier: { config: OAuthConfig; verify: VerifyOwner } | undefined;
async function verifyProductionOwner(token: string): Promise<OwnerVerification> {
  const config = oauthConfig();
  if (!config) return 'invalid';
  if (!configuredVerifier || configuredVerifier.config.issuer !== config.issuer
    || configuredVerifier.config.clientId !== config.clientId) {
    const keys = createRemoteJWKSet(new URL('.well-known/jwks.json', config.issuer), {
      timeoutDuration: 5000,
      cooldownDuration: 30000,
    });
    configuredVerifier = { config, verify: createOwnerVerifier(config, keys) };
  }
  return configuredVerifier.verify(token);
}

function toolError(message: string) {
  return { isError: true as const, content: [{ type: 'text' as const, text: message }] };
}

function containsSecret(value: unknown, secret: string): boolean {
  if (typeof value === 'string') return value.includes(secret);
  if (!value || typeof value !== 'object') return false;
  return Object.entries(value).some(([key, item]) => key.includes(secret) || containsSecret(item, secret));
}

export async function getLaunchMetrics(fetcher: typeof fetch = fetch) {
  const token = process.env.LAUNCH_METRICS_FEED_TOKEN;
  if (!token?.trim()) return toolError('Launch metrics are unavailable.');
  try {
    const response = await fetcher(FEED_URL, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      cache: 'no-store',
      credentials: 'omit',
      redirect: 'error',
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      await response.body?.cancel();
      return toolError(response.status === 401 || response.status === 403
        ? 'Launch metrics feed authorization failed.' : 'Launch metrics are temporarily unavailable.');
    }
    const text = await response.text();
    // Reject accidental upstream credential echoes, even on a success response.
    if (text.includes(token)) return toolError('Launch metrics returned an invalid response.');
    const data: unknown = JSON.parse(text);
    if (!data || typeof data !== 'object' || Array.isArray(data)
      || !('count' in data) || !Number.isInteger(data.count)
      || !('snapshots' in data) || !Array.isArray(data.snapshots)
      || data.count !== data.snapshots.length || data.snapshots.length > 52) {
      return toolError('Launch metrics returned an invalid response.');
    }
    // Check decoded JSON too: an upstream echo could use Unicode escape sequences.
    if (containsSecret(data, token)) return toolError('Launch metrics returned an invalid response.');
    // Preserve the upstream JSON object without filtering, recomputing, or writing.
    return { content: [{ type: 'text' as const, text: JSON.stringify(data) }], structuredContent: data };
  } catch {
    return toolError('Launch metrics are temporarily unavailable.');
  }
}

function denied(status: 401 | 403) {
  return Response.json({ error: status === 401 ? 'invalid_token' : 'insufficient_scope' }, {
    status,
    headers: {
      ...PRIVATE_HEADERS,
      'WWW-Authenticate': `Bearer resource_metadata="${MCP_METADATA}", scope="${MCP_SCOPE}", error="${status === 401 ? 'invalid_token' : 'insufficient_scope'}"`,
    },
  });
}

export function createLaunchMetricsHandler(
  verify: VerifyOwner = verifyProductionOwner,
  readFeed: typeof getLaunchMetrics = getLaunchMetrics,
) {
  const mcp = createMcpHandler(server => {
    server.registerTool('get_launch_metrics', {
      title: 'Get iPurpose launch metrics',
      description: 'Read the latest up to 52 weekly iPurpose launch-metrics snapshots, newest first. No writes or recomputation.',
      inputSchema: z.object({}).strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
      _meta: { securitySchemes: [{ type: 'oauth2', scopes: [MCP_SCOPE] }] },
    }, () => readFeed());
  }, { serverInfo: { name: 'ipurpose-launch-metrics', version: '1.0.0' }, verboseLogs: false, maxSubscriptions: 0 });

  return async (request: Request): Promise<Response> => {
    const origin = request.headers.get('origin');
    if (origin && origin !== 'https://chatgpt.com' && origin !== 'https://ipurposesoul.com') return denied(403);
    const token = /^Bearer[ \t]+([^\s,]+)$/i.exec(request.headers.get('authorization') || '')?.[1];
    if (!token || token.length > 16384) return denied(401);
    try {
      const identity = await verify(token);
      if (identity !== 'owner') return denied(identity === 'forbidden' ? 403 : 401);
      const response = await mcp(request);
      const headers = new Headers(response.headers);
      for (const [name, value] of Object.entries(PRIVATE_HEADERS)) headers.set(name, value);
      return new Response(response.body, { status: response.status, headers });
    } catch {
      return Response.json({ error: 'MCP request unavailable' }, { status: 503, headers: PRIVATE_HEADERS });
    }
  };
}

export function protectedResourceMetadata() {
  const config = oauthConfig();
  if (!config) return Response.json({ error: 'OAuth is not configured' }, { status: 503, headers: PRIVATE_HEADERS });
  return Response.json({
    resource: MCP_RESOURCE,
    resource_name: 'iPurpose Launch Metrics',
    authorization_servers: [config.issuer],
    scopes_supported: [MCP_SCOPE],
    bearer_methods_supported: ['header'],
  }, { headers: { 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' } });
}

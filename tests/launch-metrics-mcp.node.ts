import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createRequire } from 'node:module';
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT, type JWTPayload } from 'jose';
import {
  createLaunchMetricsHandler, createOwnerVerifier, EMAIL_CLAIM, getLaunchMetrics,
  MCP_METADATA, MCP_RESOURCE, MCP_SCOPE, oauthConfig, OWNER_EMAIL,
  protectedResourceMetadata, VERIFIED_CLAIM,
} from '../lib/launch-metrics/mcp';
import { GET, POST } from '../app/api/mcp/route';

// All credentials/keys in these tests are synthetic. No production network calls.
const FEED_SECRET = 'synthetic-feed-secret-for-tests-only';
const config = { issuer: 'https://test-owner.us.auth0.com/', clientId: 'test-chatgpt-client' };
const envNames = ['LAUNCH_METRICS_FEED_TOKEN', 'LAUNCH_METRICS_OAUTH_ISSUER', 'LAUNCH_METRICS_OAUTH_CLIENT_ID'] as const;
const originalEnv = Object.fromEntries(envNames.map(name => [name, process.env[name]]));
let keys: Awaited<ReturnType<typeof generateKeyPair>>;
let verify: ReturnType<typeof createOwnerVerifier>;
const metrics = {
  count: 1,
  snapshots: [{
    schemaVersion: 1, weekStart: '2026-09-14', weekEnding: '2026-09-20',
    computedAt: '2026-09-21T10:00:00.000Z', reportingTimezone: 'America/New_York',
    property: 'properties/525662576',
    counts: { first_open: 0, sign_up: 0, clarity_check_start: 1, clarity_check_complete: 1, email_signup: 0 },
    byPlatform: { Android: {}, iOS: {}, web: { clarity_check_start: 1, clarity_check_complete: 1 } },
    rates: { installToRegistration: null },
  }],
};

before(async () => {
  process.env.LAUNCH_METRICS_FEED_TOKEN = FEED_SECRET;
  process.env.LAUNCH_METRICS_OAUTH_ISSUER = config.issuer;
  process.env.LAUNCH_METRICS_OAUTH_CLIENT_ID = config.clientId;
  keys = await generateKeyPair('RS256');
  const publicKey = await exportJWK(keys.publicKey);
  verify = createOwnerVerifier(config, createLocalJWKSet({ keys: [{ ...publicKey, kid: 'test-key', alg: 'RS256' }] }));
});
after(() => {
  for (const name of envNames) {
    if (originalEnv[name] === undefined) delete process.env[name];
    else process.env[name] = originalEnv[name];
  }
});

async function token(overrides: JWTPayload = {}) {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({
    iss: config.issuer, aud: MCP_RESOURCE, sub: 'test-owner', iat: now, exp: now + 900,
    client_id: config.clientId, scope: MCP_SCOPE,
    [EMAIL_CLAIM]: OWNER_EMAIL, [VERIFIED_CLAIM]: true, ...overrides,
  }).setProtectedHeader({ alg: 'RS256', kid: 'test-key' }).sign(keys.privateKey);
}

function rpc(authorization?: string, method = 'tools/call', params: object = { name: 'get_launch_metrics', arguments: {} }) {
  return new Request(MCP_RESOURCE, {
    method: 'POST',
    headers: {
      'content-type': 'application/json', accept: 'application/json, text/event-stream',
      'mcp-protocol-version': '2025-06-18',
      ...(authorization ? { authorization } : {}),
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
}

async function rpcBody(response: Response) {
  const body = await response.text();
  const dataLine = body.split('\n').find(line => line.startsWith('data: '));
  return JSON.parse(dataLine ? dataLine.slice(6) : body);
}

test('actual MCP route rejects unauthenticated, malformed, cookie and query-token requests', async () => {
  for (const handler of [GET, POST]) {
    for (const authorization of [undefined, 'Basic invalid', 'Bearer', 'Bearer a b', `Bearer ${FEED_SECRET}`]) {
      const request = rpc(authorization);
      request.headers.set('cookie', `FirebaseSession=${FEED_SECRET}`);
      const response = await handler(request);
      assert.equal(response.status, 401);
      assert.equal(response.headers.get('cache-control'), 'private, no-store');
      assert.ok(response.headers.get('www-authenticate')?.includes(MCP_METADATA));
      assert.equal((await response.text()).includes(FEED_SECRET), false);
    }
  }
  assert.equal((await GET(new Request(`${MCP_RESOURCE}?token=${FEED_SECRET}`))).status, 401);
});

test('signed verified owner token is accepted; other emails and unverified claims are rejected', async () => {
  assert.equal(await verify(await token()), 'owner');
  assert.equal(await verify(await token({ [EMAIL_CLAIM]: 'MsHmltn@gmail.com' })), 'owner');
  for (const claims of [
    { [EMAIL_CLAIM]: 'someone-else@gmail.com' },
    { [EMAIL_CLAIM]: 'mshmltn+other@gmail.com' },
    { [VERIFIED_CLAIM]: false }, { [VERIFIED_CLAIM]: 'true' },
    { [EMAIL_CLAIM]: undefined }, { scope: 'admin' }, { scope: undefined },
    { client_id: 'another-client' }, { sub: '' },
  ]) assert.equal(await verify(await token(claims)), 'forbidden');
});

test('JWT signature, algorithm, audience, issuer, expiry and age are enforced', async () => {
  const now = Math.floor(Date.now() / 1000);
  for (const claims of [
    { iss: 'https://attacker.example/' }, { aud: 'https://another-api.example/' },
    { exp: now - 60 }, { exp: undefined }, { iat: undefined },
    { iat: now - 1000, exp: now + 900 }, { nbf: now + 1000 },
  ]) assert.equal(await verify(await token(claims)), 'invalid');
  const otherKeys = await generateKeyPair('RS256');
  const forged = await new SignJWT({ [EMAIL_CLAIM]: OWNER_EMAIL, [VERIFIED_CLAIM]: true })
    .setProtectedHeader({ alg: 'RS256', kid: 'test-key' }).sign(otherKeys.privateKey);
  assert.equal(await verify(forged), 'invalid');
  const unsigned = `${Buffer.from('{"alg":"none"}').toString('base64url')}.${Buffer.from('{}').toString('base64url')}.`;
  assert.equal(await verify(unsigned), 'invalid');
});

test('unauthorized identity cannot invoke the feed and browser origins are checked', async () => {
  let calls = 0;
  const handler = createLaunchMetricsHandler(verify, async () => { calls++; return getLaunchMetrics(async () => Response.json(metrics)); });
  const response = await handler(rpc(`Bearer ${await token({ [EMAIL_CLAIM]: 'not-owner@example.com' })}`));
  assert.equal(response.status, 403);
  const request = rpc(`Bearer ${await token()}`);
  request.headers.set('origin', 'https://attacker.example');
  assert.equal((await handler(request)).status, 403);
  assert.equal(calls, 0);
});

test('owner completes MCP initialization, discovers exactly one read-only tool and retrieves unchanged metrics', async () => {
  const ownerToken = await token();
  let calls = 0;
  const handler = createLaunchMetricsHandler(verify, () => getLaunchMetrics(async (url, init) => {
    calls++;
    assert.equal(url, 'https://ipurposesoul.com/api/admin/launch-metrics-feed');
    assert.equal(init?.method, 'GET');
    assert.equal(init?.cache, 'no-store');
    assert.equal(init?.redirect, 'error');
    assert.equal(init?.credentials, 'omit');
    assert.equal(new Headers(init?.headers).get('authorization'), `Bearer ${FEED_SECRET}`);
    assert.notEqual(new Headers(init?.headers).get('authorization'), `Bearer ${ownerToken}`);
    assert.ok(init?.signal);
    return Response.json(metrics);
  }));
  const auth = `Bearer ${ownerToken}`;
  const init = await handler(rpc(auth, 'initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test-client', version: '1.0' } }));
  assert.equal(init.status, 200);
  assert.equal((await rpcBody(init)).result.serverInfo.name, 'ipurpose-launch-metrics');
  const list = await rpcBody(await handler(rpc(auth, 'tools/list', {})));
  assert.deepEqual(list.result.tools.map((tool: { name: string }) => tool.name), ['get_launch_metrics']);
  assert.deepEqual(list.result.tools[0].annotations, { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false });
  assert.deepEqual(list.result.tools[0]._meta.securitySchemes, [{ type: 'oauth2', scopes: [MCP_SCOPE] }]);
  assert.equal(calls, 0);
  const response = await handler(rpc(auth));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
  const body = await rpcBody(response);
  assert.deepEqual(body.result.structuredContent, metrics);
  assert.deepEqual(JSON.parse(body.result.content[0].text), metrics);
  assert.equal(JSON.stringify(body).includes(FEED_SECRET), false);
  assert.equal(JSON.stringify(body).includes(ownerToken), false);
  assert.equal(calls, 1);
});

test('unknown tools and extra arguments cannot select an upstream URL or perform writes', async () => {
  let calls = 0;
  const handler = createLaunchMetricsHandler(verify, async () => { calls++; return getLaunchMetrics(async () => Response.json(metrics)); });
  const auth = `Bearer ${await token()}`;
  for (const params of [{ name: 'delete_metrics', arguments: {} }, { name: 'get_launch_metrics', arguments: { url: 'https://attacker.example' } }]) {
    const body = await rpcBody(await handler(rpc(auth, 'tools/call', params)));
    assert.ok(body.error || body.result?.isError);
  }
  assert.equal(calls, 0);
});

test('upstream 401/403 and 500 produce sanitized MCP errors without exposing response bodies', async () => {
  for (const status of [401, 403, 500]) {
    const handler = createLaunchMetricsHandler(verify, () => getLaunchMetrics(async () => new Response(`private Authorization: Bearer ${FEED_SECRET}`, { status })));
    const body = await rpcBody(await handler(rpc(`Bearer ${await token()}`)));
    assert.equal(body.result.isError, true);
    assert.equal(body.result.content[0].text, status === 500 ? 'Launch metrics are temporarily unavailable.' : 'Launch metrics feed authorization failed.');
    assert.equal(JSON.stringify(body).includes(FEED_SECRET), false);
  }
});

test('network/parse/credential-echo errors never log or return secrets', async t => {
  const logs: unknown[][] = [];
  for (const method of ['log', 'warn', 'error', 'info', 'debug'] as const) t.mock.method(console, method, (...args: unknown[]) => { logs.push(args); });
  for (const fetcher of [
    async () => { throw new Error(`private credentials ${FEED_SECRET}`); },
    async () => new Response('invalid json'),
    async () => Response.json({ ...metrics, leakedHeader: `Bearer ${FEED_SECRET}` }),
    async () => new Response(JSON.stringify({ ...metrics, leakedHeader: FEED_SECRET }).replace(FEED_SECRET, [...FEED_SECRET].map(c => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`).join(''))),
    async () => Response.json({ count: 54, snapshots: [] }),
    async () => new Response(FEED_SECRET, { status: 500 }),
  ]) {
    const result = await getLaunchMetrics(fetcher);
    assert.equal('isError' in result && result.isError, true);
    assert.equal(JSON.stringify(result).includes(FEED_SECRET), false);
  }
  const response = await createLaunchMetricsHandler(async () => { throw new Error(FEED_SECRET); })(rpc('Bearer synthetic-oauth-token'));
  assert.equal(response.status, 503);
  assert.equal((await response.text()).includes(FEED_SECRET), false);
  const ownerToken = await token();
  const failingTool = createLaunchMetricsHandler(verify, () => getLaunchMetrics(async () => {
    throw new Error(`Authorization: Bearer ${FEED_SECRET}`);
  }));
  const rpcResult = await rpcBody(await failingTool(rpc(`Bearer ${ownerToken}`)));
  assert.equal(rpcResult.result.isError, true);
  assert.equal(JSON.stringify(rpcResult).includes(FEED_SECRET), false);
  assert.equal(JSON.stringify(rpcResult).includes(ownerToken), false);
  assert.deepEqual(logs, []);
});

test('missing configuration fails closed; metadata exposes only public OAuth configuration', async () => {
  assert.deepEqual(oauthConfig(), config);
  const metadata = await protectedResourceMetadata().json();
  assert.deepEqual(metadata, {
    resource: MCP_RESOURCE, resource_name: 'iPurpose Launch Metrics',
    authorization_servers: [config.issuer], scopes_supported: [MCP_SCOPE], bearer_methods_supported: ['header'],
  });
  assert.equal(JSON.stringify(metadata).includes(FEED_SECRET), false);
  try {
    delete process.env.LAUNCH_METRICS_OAUTH_CLIENT_ID;
    assert.equal(protectedResourceMetadata().status, 503);
    assert.equal((await POST(rpc(`Bearer ${await token()}`))).status, 401);
    process.env.LAUNCH_METRICS_OAUTH_CLIENT_ID = config.clientId;
    for (const issuer of ['http://local.auth0.com/', 'https://evil.example/', 'https://test.auth0.com/?token=x', 'https://test.auth0.com/path', 'https://test.auth0.com']) {
      process.env.LAUNCH_METRICS_OAUTH_ISSUER = issuer;
      assert.equal(oauthConfig(), undefined);
    }
    delete process.env.LAUNCH_METRICS_FEED_TOKEN;
    const result = await getLaunchMetrics(async () => { throw new Error('must not fetch'); });
    assert.equal(result.content[0].text, 'Launch metrics are unavailable.');
  } finally {
    process.env.LAUNCH_METRICS_OAUTH_ISSUER = config.issuer;
    process.env.LAUNCH_METRICS_OAUTH_CLIENT_ID = config.clientId;
    process.env.LAUNCH_METRICS_FEED_TOKEN = FEED_SECRET;
  }
});

test('Auth0 Action denies non-owner/unverified users before issuing claims, including refresh grants', async () => {
  const require = createRequire(import.meta.url);
  const { onExecutePostLogin } = require('../ops/auth0/launch-metrics-owner.js');
  for (const protocol of ['oidc-basic-profile', 'oauth2-refresh-token']) {
    for (const user of [{ email: 'other@example.com', email_verified: true }, { email: OWNER_EMAIL, email_verified: false }, { email: OWNER_EMAIL, email_verified: 'true' }]) {
      const denied: string[] = []; const claims: unknown[] = [];
      await onExecutePostLogin({ resource_server: { identifier: MCP_RESOURCE }, user, transaction: { protocol } }, {
        access: { deny: (message: string) => denied.push(message) },
        accessToken: { setCustomClaim: (...args: unknown[]) => claims.push(args) },
      });
      assert.equal(denied.length, 1);
      assert.deepEqual(claims, []);
    }
  }
  const claims: unknown[] = [];
  await onExecutePostLogin({ resource_server: { identifier: MCP_RESOURCE }, user: { email: OWNER_EMAIL, email_verified: true } }, {
    access: { deny: () => assert.fail('owner should be allowed') },
    accessToken: { setCustomClaim: (...args: unknown[]) => claims.push(args) },
  });
  assert.deepEqual(claims, [[EMAIL_CLAIM, OWNER_EMAIL], [VERIFIED_CLAIM, true]]);
  await onExecutePostLogin({ resource_server: { identifier: 'another-api' }, user: {} }, {
    access: { deny: () => assert.fail('unrelated auth must not change') },
    accessToken: { setCustomClaim: () => assert.fail('unrelated auth must not change') },
  });
});

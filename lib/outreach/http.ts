import type { Auth } from 'firebase-admin/auth';
import { outreachSchema, type OutreachInput, type OutreachFilters } from './model';

import { proposalById } from './registry';

const headers = { 'Cache-Control': 'private, no-store', Vary: 'Authorization' };
class RequestError extends Error { constructor(public status: number, message: string) { super(message); } }
export async function boundedJson(request: Request) {
  if (Number(request.headers.get('content-length')) > 4096) throw new RequestError(413, 'Payload too large.');
  if (request.headers.get('content-type')?.split(';')[0] !== 'application/json') throw new RequestError(415, 'JSON is required.');
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError(400, 'Invalid request.');
  let size = 0; const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 4096) { await reader.cancel(); throw new RequestError(413, 'Payload too large.'); }
    chunks.push(value);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown; }
  catch { throw new RequestError(400, 'Invalid JSON.'); }
}
export function ingestionHandler(store: (data: OutreachInput, request: Request) => Promise<unknown>) {
  return async (request: Request) => {
    try {
      const origin = new URL(request.url).origin;
      if (request.headers.get('origin') !== origin || ['cross-site', 'same-site'].includes(request.headers.get('sec-fetch-site') || '')) throw new RequestError(403, 'Same-origin requests are required.');
      const parsed = outreachSchema.safeParse(await boundedJson(request));
      if (!parsed.success) throw new RequestError(400, 'Invalid partnership event.');
      const referer = request.headers.get('referer');
      if (referer) {
        const ref = new URL(referer);
        if (ref.origin !== origin || ref.pathname !== parsed.data.page_path) throw new RequestError(403, 'Invalid partnership origin.');
        const query = ref.searchParams;
        if (query.get('preview') === '1' || query.get('ipurpose_qa') === '1' || query.get('utm_source')?.toLowerCase() === 'codex_qa') parsed.data.traffic_type = 'internal';
      }
      if (parsed.data.debug_mode) parsed.data.traffic_type = 'internal';
      await store(parsed.data, request);
      return new Response(null, { status: 204, headers });
    } catch (error) {
      return Response.json({ error: error instanceof RequestError ? error.message : 'Event logging unavailable.' }, { status: error instanceof RequestError ? error.status : 503, headers });
    }
  };
}
export function outreachFilters(request: Request): OutreachFilters {
  const params = new URL(request.url).searchParams;
  const window = params.get('window') || '7d';
  if (!['today', '24h', '7d'].includes(window)) throw new RequestError(400, 'Invalid time range.');
  const proposalId = params.get('proposal');
  if (proposalId && !proposalById(proposalId)) throw new RequestError(400, 'Invalid proposal.');
  const internal = params.get('includeInternal');
  if (internal && !['0', '1'].includes(internal)) throw new RequestError(400, 'Invalid activity filter.');
  return { window: window as OutreachFilters['window'], ...(proposalId ? { proposalId } : {}), includeInternal: internal === '1' };
}
export function outreachAdminHandler(load: () => Promise<{ auth: Auth; read: (filters: OutreachFilters) => Promise<unknown> }>) {
  return async (request: Request) => {
    try {
      const token = /^Bearer (\S+)$/i.exec(request.headers.get('authorization') || '')?.[1];
      if (!token) throw new RequestError(401, 'Administrator sign-in is required.');
      const { auth, read } = await load();
      let decoded;
      try { decoded = await auth.verifyIdToken(token, true); } catch { throw new RequestError(401, 'Sign in again to continue.'); }
      const actor = await auth.getUser(decoded.uid);
      if (decoded.admin !== true || actor.customClaims?.admin !== true || actor.disabled) throw new RequestError(403, 'Administrator access is required.');
      return Response.json(await read(outreachFilters(request)), { headers });
    } catch (error) {
      return Response.json({ error: error instanceof RequestError ? error.message : 'Outreach activity unavailable.' }, { status: error instanceof RequestError ? error.status : 503, headers });
    }
  };
}

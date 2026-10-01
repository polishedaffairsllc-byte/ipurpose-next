import type { Auth } from 'firebase-admin/auth';
import { ActivityError, targetOf, type createActivityService } from './service';
import type { ActivityKind } from './types';

const headers = { 'Cache-Control': 'private, no-store', Vary: 'Authorization' };
type Dependencies = { auth: Auth; service: ReturnType<typeof createActivityService> };
export function activityHandler(load: () => Promise<Dependencies>) {
  return async (request: Request) => {
    try {
      const token = /^Bearer (\S+)$/i.exec(request.headers.get('authorization') || '')?.[1];
      if (!token) throw new ActivityError(401, 'Administrator sign-in is required.');
      const { auth, service } = await load();
      let decoded;
      try { decoded = await auth.verifyIdToken(token, true); }
      catch { throw new ActivityError(401, 'Sign in again to continue.'); }
      // Check current claims as well as the token, so removing admin access takes effect immediately.
      const actor = await auth.getUser(decoded.uid);
      if (decoded.admin !== true || actor.customClaims?.admin !== true || actor.disabled) throw new ActivityError(403, 'Administrator access is required.');
      if (request.method === 'GET') {
        const params = new URL(request.url).searchParams;
        return Response.json(await service.list((params.get('kind') || 'accounts') as ActivityKind, params.get('cursor') || undefined), { headers });
      }
      if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405, headers });
      const origin = request.headers.get('origin');
      if (origin && origin !== new URL(request.url).origin) throw new ActivityError(403, 'Cross-origin requests are not allowed.');
      const text = await request.text();
      if (text.length > 8000) throw new ActivityError(400, 'Invalid request.');
      let body;
      try { body = JSON.parse(text); } catch { throw new ActivityError(400, 'Invalid request.'); }
      if (!body || typeof body !== 'object') throw new ActivityError(400, 'Invalid request.');
      const target = targetOf(body.target);
      if (body.action === 'preview') return Response.json(await service.preview(decoded.uid, target), { headers });
      if (body.action !== 'purge' || typeof body.fingerprint !== 'string' || typeof body.confirmation !== 'string') throw new ActivityError(400, 'Invalid request.');
      const age = Math.floor(Date.now() / 1000) - decoded.auth_time;
      if (!Number.isFinite(age) || age < 0 || age > 300) throw new ActivityError(401, 'For permanent deletion, sign out and sign in again, then retry within five minutes.');
      return Response.json(await service.purge(decoded.uid, target, body.fingerprint, body.confirmation), { headers });
    } catch (error) {
      return Response.json({ error: error instanceof ActivityError ? error.message : 'Activity operation unavailable. Please retry.' }, {
        status: error instanceof ActivityError ? error.status : 503, headers,
      });
    }
  };
}

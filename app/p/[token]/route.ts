import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { resolveUniversityLink, universityPreviewEnabled, anonymousVisit, trafficClassification } from '@/lib/universities/links';
import { storeOutreachEvent } from '@/lib/outreach/service';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const protection = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'Referrer-Policy': 'no-referrer' };
export async function GET(request: NextRequest, context: { params: Promise<{ token: string }> }) {
  if (!universityPreviewEnabled()) return new Response(null, { status: 404, headers: protection });
  const { firebaseAdmin } = await import('@/lib/firebaseAdmin');
  const link = await resolveUniversityLink(firebaseAdmin.firestore(), (await context.params).token);
  if (!link) return new Response(null, { status: 404, headers: protection });
  const key = `university_visit_${link.hash.slice(0,16)}`;
  const visit = anonymousVisit(request.cookies.get(key)?.value);
  try { await storeOutreachEvent(firebaseAdmin.firestore(), {
    proposal_id: link.institution.proposal_id, source_event_name: 'proposal_link_access', event_id: randomUUID(), session_id: visit.id,
    client_timestamp: new Date().toISOString(), page_path: link.institution.page_path, visit_number: visit.number, sequence: 0,
    traffic_type: 'internal', debug_mode: true, outreach_id: link.token, traffic_classification: trafficClassification(request, true),
  }); } catch { /* A logging outage cannot prevent the proposal opening. */ }
  const url = new URL(link.institution.page_path, request.url); url.searchParams.set('outreach', link.token); url.searchParams.set('preview', '1');
  const response = NextResponse.redirect(url, 303);
  Object.entries(protection).forEach(([name,value]) => response.headers.set(name,value));
  response.cookies.set(key, Buffer.from(JSON.stringify(visit)).toString('base64url'), { httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'lax', path: '/', maxAge: 1800 });
  return response;
}

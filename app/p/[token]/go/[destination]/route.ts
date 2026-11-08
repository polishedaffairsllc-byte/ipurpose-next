import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { resolveUniversityLink, universityInternalRequest, trafficClassification } from '@/lib/universities/links';
import { privatePresentation } from '@/lib/universities/presentations';
import { universityDestinations } from '@/lib/universities/institutions';
import { storeOutreachEvent } from '@/lib/outreach/service';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'Referrer-Policy': 'no-referrer' };
export async function GET(request: NextRequest, context: { params: Promise<{ token: string; destination: string }> }) {
  const { token, destination } = await context.params; const { firebaseAdmin } = await import('@/lib/firebaseAdmin');
  const link = await resolveUniversityLink(firebaseAdmin.firestore(), token); if (!link || !await privatePresentation(firebaseAdmin.firestore(), link)) return new Response(null, { status: 404, headers });
  const internal = universityInternalRequest(request);
  const destinations = universityDestinations(link.institution); if (!Object.hasOwn(destinations, destination)) return new Response(null, { status: 404, headers });
  let sessionId = randomUUID(), number = 1;
  try { const visit = JSON.parse(Buffer.from(request.cookies.get(`university_visit_${link.hash.slice(0,16)}`)?.value || '', 'base64url').toString()); if (/^[0-9a-f-]{36}$/.test(visit.id)) { sessionId = visit.id; number = visit.number || 1; } } catch { /* Anonymous fallback. */ }
  const placement = Number(request.nextUrl.searchParams.get('slide'));
  const sourceFormat = request.nextUrl.searchParams.get('format') === 'pdf' ? 'pdf' as const : 'web' as const;
  const eventId = request.nextUrl.searchParams.get('event');
  const sequence = Number(request.nextUrl.searchParams.get('seq'));
  const visitNumber = Number(request.nextUrl.searchParams.get('visit'));
  if (Number.isInteger(visitNumber) && visitNumber >= 1 && visitNumber <= 1000000) number = visitNumber;
  try { await storeOutreachEvent(firebaseAdmin.firestore(), {
    proposal_id: link.institution.proposal_id, source_event_name: destination === 'conversation' ? 'proposal_meeting_request_click' : 'proposal_external_link_click',
    event_id: eventId && /^[0-9a-f-]{36}$/.test(eventId) ? eventId : randomUUID(), session_id: sessionId, client_timestamp: new Date().toISOString(),
    page_path: link.institution.page_path, visit_number: number, sequence: Number.isInteger(sequence) && sequence >= 1 && sequence <= 1000000 ? sequence : 1000000, interaction_qualified: request.nextUrl.searchParams.get('interactive') === '1', destination_id: destination,
    ...(Number.isInteger(placement) && placement >= 1 && placement <= 8 ? { source_slide_number: placement, source_format: sourceFormat } : {}),
    traffic_type: internal ? 'internal' : 'external', debug_mode: internal, outreach_id: token, traffic_classification: trafficClassification(request, internal),
  }); } catch { /* Continue to the requested allowed destination if logging is unavailable. */ }
  const response = NextResponse.redirect(destinations[destination as keyof typeof destinations], 303); Object.entries(headers).forEach(([name,value])=>response.headers.set(name,value)); return response;
}

import type { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { resolveUniversityLink, universityPreviewEnabled, trafficClassification } from '@/lib/universities/links';
import { ASSET_COLLECTION, PRIVATE_ASSET_HEADERS, privatePresentation } from '@/lib/universities/presentations';
import { storeOutreachEvent } from '@/lib/outreach/service';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest, context: { params: Promise<{ token: string }> }) {
  const unavailable=()=>new Response(null,{status:404,headers:PRIVATE_ASSET_HEADERS});
  if(!universityPreviewEnabled())return unavailable();
  const {token}=await context.params;const {firebaseAdmin}=await import('@/lib/firebaseAdmin');const db=firebaseAdmin.firestore();
  const link=await resolveUniversityLink(db,token);if(!link)return unavailable();
  const deck=await privatePresentation(db,link),asset=deck?.assets['presentation.pdf'];if(!deck||!asset)return unavailable();
  const data=(await db.collection(ASSET_COLLECTION).doc(asset.id).get()).data();if(!data||data.sha256!==asset.sha256||data.environment!=='preview'||!Buffer.isBuffer(data.bytes))return unavailable();
  let sessionId=randomUUID(),number=1;
  try {const visit=JSON.parse(Buffer.from(request.cookies.get(`university_visit_${link.hash.slice(0,16)}`)?.value||'','base64url').toString());if(/^[0-9a-f-]{36}$/.test(visit.id)){sessionId=visit.id;number=visit.number||1;}}catch{/* Anonymous fallback. */}
  const query=request.nextUrl.searchParams,eventId=query.get('event'),seq=Number(query.get('seq')),slide=Number(query.get('slide')),visit=Number(query.get('visit'));
  try {await storeOutreachEvent(db,{proposal_id:link.institution.proposal_id,source_event_name:'proposal_pdf_download',event_id:eventId&&/^[0-9a-f-]{36}$/.test(eventId)?eventId:randomUUID(),session_id:sessionId,client_timestamp:new Date().toISOString(),page_path:link.institution.page_path,visit_number:Number.isInteger(visit)&&visit>=1&&visit<=1000000?visit:number,sequence:Number.isInteger(seq)&&seq>=1&&seq<=1000000?seq:1000000,traffic_type:'internal',debug_mode:true,outreach_id:token,interaction_qualified:query.get('interactive')==='1',traffic_classification:trafficClassification(request,true),...(Number.isInteger(slide)&&slide>=1&&slide<=8?{source_slide_number:slide,source_format:'web' as const}:{})});}catch{/* Download remains available if telemetry fails. */}
  return new Response(new Uint8Array(data.bytes),{headers:{...PRIVATE_ASSET_HEADERS,'Content-Type':'application/pdf','Content-Length':String(data.bytes.length),'Content-Disposition':`attachment; filename="${deck.pdf_filename}"`}});
}

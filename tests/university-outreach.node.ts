import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { Timestamp, type Firestore } from 'firebase-admin/firestore';
import { institutions, newInstitutions, universityEvents, universityDestinations } from '../lib/universities/institutions';
import { seedReviewContact, resolveUniversityLink, tokenHash, anonymousVisit, trafficClassification, universityPreviewEnabled, type ReviewContact } from '../lib/universities/links';
import { draftUniversityEmail, reviewCsv } from '../lib/universities/drafts';
import { universityReview } from '../lib/universities/review';
import { outreachSchema, summarize, type OutreachInput } from '../lib/outreach/model';
import { storeOutreachEvent, readOutreach } from '../lib/outreach/service';
import { outreachFilters } from '../lib/outreach/http';
const institution = newInstitutions[0];
function memoryDb() {
  const docs = new Map<string, Record<string, unknown>>();
  function ref(collection: string, id: string) { const key = `${collection}/${id}`; return { key, id,
    get: async () => ({ exists: docs.has(key), data: () => docs.get(key) }),
    create: async (data: Record<string, unknown>) => { if (docs.has(key)) throw Object.assign(new Error('duplicate'), { code: 6 }); docs.set(key, { ...data, ...(collection === 'proposalOutreachEvents' ? { timestamp: Timestamp.now() } : {}) }); },
  }; }
  const db = { collection(collection: string) { let predicates: Array<[string,string,unknown]> = [], max = Infinity;
    const chain = { doc: (id: string) => ref(collection, id), where(field: string, op: string, value: unknown) { predicates.push([field,op,value]); return chain; }, orderBy() { return chain; }, limit(n: number) { max = n; return chain; },
      async get() { const rows = [...docs].filter(([key,data]) => key.startsWith(collection + '/') && predicates.every(([field,op,value]) => op === '==' ? data[field] === value : (data[field] as Timestamp).toMillis() >= (value as Timestamp).toMillis())).slice(0,max).map(([key,data]) => ({ id: key.split('/')[1], data: () => data })); predicates = []; return { docs: rows, size: rows.length }; },
    }; return chain;
  }, batch() { const pending: Array<() => Promise<void>> = []; return { create(r: ReturnType<typeof ref>, data: Record<string,unknown>) { pending.push(() => r.create(data)); }, async commit() { for (const write of pending) await write(); } }; } } as unknown as Firestore;
  return { db, docs };
}
function contact(overrides: Partial<ReviewContact> = {}): ReviewContact { return { contact_id: randomUUID(), institution_id: institution.institution_id, recipient_name: null, recipient_email: null, primary_office: institution.primary_office, verified_source_url: institution.sources[0].url, source_checked_at: '2026-11-07', contact_status: 'needs_research', notes: [], ...overrides }; }
function input(token: string, overrides: Partial<OutreachInput> = {}): OutreachInput { return { event_id: randomUUID(), session_id: randomUUID(), proposal_id: institution.proposal_id, source_event_name: 'proposal_page_view', page_path: institution.page_path, client_timestamp: new Date().toISOString(), sequence: 1, visit_number: 1, traffic_type: 'internal', debug_mode: true, outreach_id: token, ...overrides }; }
test('41 reconciled public records contain 39 new proposals, two existing contacted routes and no private contacts', () => {
  assert.equal(institutions.length, 41); assert.equal(newInstitutions.length,39); assert.equal(institutions.filter(i=>i.country==='Ghana').length,30);
  assert.equal(institutions.filter(i=>i.already_contacted).length,2); assert.equal(new Set(institutions.map(i=>i.proposal_id)).size,41);
  assert.equal(institutions.find(i=>i.seed_name==='Wa Technical University')?.institution_name,'Dr Hilla Limann Technical University');
  for(const row of institutions) { assert.equal(row.review_status,'awaiting_user_approval'); assert.equal(Object.hasOwn(row,'recipient_email'),false); for(const source of row.sources) assert.match(source.url,/^https:\/\//); }
  for(const row of newInstitutions) { const text=JSON.stringify(row); assert.doesNotMatch(text,/\b(?:fees?|pricing|waivers?|free|complimentary|subsidized|PDFs?)\b/i); }
});
test('university tokens are random, contact-specific, proposal-scoped, revocable, expiring and preview-only', async () => {
  const { db,docs }=memoryDb();const a=contact(), b=contact();await seedReviewContact(db,a);await seedReviewContact(db,b);await seedReviewContact(db,a);
  const links=[...docs.entries()].filter(([key])=>key.startsWith('proposalOutreachLinks/')).map(([,data])=>data);
  assert.equal(links.length,2);assert.notEqual(links[0].review_token,links[1].review_token);const token=String(links[0].review_token);assert.equal(token.length,43);
  assert.equal((await resolveUniversityLink(db,token))?.contactId,a.contact_id);assert.equal(await resolveUniversityLink(db,'unknown'),null);
  links[0].enabled=false;assert.equal(await resolveUniversityLink(db,token),null);links[0].enabled=true;links[0].expiresAt=Timestamp.fromMillis(Date.now()-1);assert.equal(await resolveUniversityLink(db,token),null);
  const previous=process.env.VERCEL_ENV;process.env.VERCEL_ENV='production';try{assert.equal(universityPreviewEnabled(),false);assert.equal(await resolveUniversityLink(db,String(links[1].review_token)),null);await assert.rejects(()=>seedReviewContact(db,contact()));}finally{if(previous===undefined)delete process.env.VERCEL_ENV;else process.env.VERCEL_ENV=previous;}
  await assert.rejects(()=>seedReviewContact(db,contact({institution_id:institutions.find(i=>i.already_contacted)!.institution_id})));
});
test('shared ledger derives recipient identity server-side, deduplicates outbound click, scopes filters and separates raw/page/interactive metrics',async()=>{
  const {db,docs}=memoryDb();const a=contact(),b=contact();await seedReviewContact(db,a);await seedReviewContact(db,b);
  const tokenFor=(id:string)=>String([...docs.values()].find(row=>row.contact_id===id&&row.review_token)?.review_token);
  const tokenA=tokenFor(a.contact_id),tokenB=tokenFor(b.contact_id);const session=randomUUID();
  await storeOutreachEvent(db,input(tokenA,{session_id:session,source_event_name:'proposal_link_access',sequence:0,traffic_classification:'likely_automated'}),'preview');
  await storeOutreachEvent(db,input(tokenA,{session_id:session}),'preview');
  const click=input(tokenA,{session_id:session,source_event_name:'proposal_meeting_request_click',destination_id:'conversation',sequence:2,interaction_qualified:true,traffic_classification:'internal'});
  await storeOutreachEvent(db,click,'preview');assert.deepEqual(await storeOutreachEvent(db,click,'preview'),{duplicate:true});
  await storeOutreachEvent(db,input(tokenB),'preview');
  const all=await readOutreach(db,{window:'30d',includeInternal:true},'preview');const report=await readOutreach(db,{window:'30d',includeInternal:true,recipientId:a.contact_id},'preview');
  assert.equal(all.recentEvents.length,4);assert.equal(report.recentEvents.length,3);assert.ok(report.recentEvents.every(row=>row.attributed_recipient_id===a.contact_id&&row.outreach_id===tokenHash(tokenA)));
  assert.equal(report.recipientOptions[a.contact_id].institution_id,institution.institution_id);
  const summary=report.proposals.find(row=>row.proposal_id===institution.proposal_id)!;assert.equal(summary.visits,1);assert.equal(summary.universityMetrics?.rawAccesses,1);assert.equal(summary.universityMetrics?.uniqueSessions,1);assert.equal(summary.universityMetrics?.qualifiedVisits,1);assert.equal(summary.universityMetrics?.meetingRequests,1);
  const stored=JSON.stringify([...docs.entries()].filter(([key])=>key.startsWith('proposalOutreachEvents/')));assert.equal(stored.includes(tokenA),false);assert.equal(stored.includes('recipient_email'),false);
  assert.equal((await readOutreach(db,{window:'30d',includeInternal:false},'preview')).recentEvents.length,0);
  await assert.rejects(()=>storeOutreachEvent(db,input(tokenA,{proposal_id:newInstitutions[1].proposal_id,page_path:newInstitutions[1].page_path}),'preview'));
});
test('schema requires controlled university link/section/destination and preserves strict existing events',()=>{
  const base=input('x'.repeat(43));assert.equal(outreachSchema.safeParse(base).success,true);
  for(const patch of [{outreach_id:undefined},{recipient_email:'private@example.com'},{source_event_name:'proposal_section_view'},{source_event_name:'proposal_section_view',section_id:'unknown'},{source_event_name:'proposal_external_link_click',destination_id:'https://evil.example'},{source_event_name:'proposal_meeting_request_click',destination_id:'source-0'},{sequence:0}])assert.equal(outreachSchema.safeParse({...base,...patch}).success,false);
  assert.equal(outreachSchema.safeParse({...base,source_event_name:'proposal_section_view',section_id:'pilot'}).success,true);
  assert.equal(outreachSchema.safeParse({...base,source_event_name:'proposal_external_link_click',destination_id:'source-0'}).success,true);
  assert.equal(Object.hasOwn(universityDestinations(institution),'https://evil.example'),false);
  assert.equal(universityDestinations(institution).ipurpose,'https://ipurposesoul.com');
  assert.equal(outreachSchema.safeParse({...base,source_event_name:'proposal_external_link_click',destination_id:'ipurpose'}).success,true);
  assert.equal(outreachFilters(new Request('https://example.com?recipient='+randomUUID())).recipientId?.length,36);
});
test('scanner classification does not claim human reading; anonymous sessions are bounded and contain no identity',()=>{
  assert.equal(trafficClassification(new Request('https://example.com',{headers:{purpose:'prefetch'}}),true),'likely_automated');
  assert.equal(trafficClassification(new Request('https://example.com',{headers:{'user-agent':'Proofpoint URL scanner'}}),false,true),'likely_automated');
  assert.equal(trafficClassification(new Request('https://example.com'),false),'unclassified');assert.equal(trafficClassification(new Request('https://example.com'),false,true),'interactive');assert.equal(trafficClassification(new Request('https://example.com'),true,true),'internal');
  const first=anonymousVisit(undefined);assert.equal(first.number,1);assert.deepEqual(anonymousVisit(Buffer.from(JSON.stringify(first)).toString('base64url')),{id:first.id,number:2});assert.equal(anonymousVisit('bad').number,1);
});
test('admin review creates one-link draft artifacts only; existing institutions never receive duplicate initial drafts',async()=>{
  const {db,docs}=memoryDb();await seedReviewContact(db,contact());const review=await universityReview(db,'https://preview.example');assert.equal(review.rows.length,41);assert.equal(review.counts.new,39);
  const first=review.rows[0];assert.match(first.preview_url!,/^https:\/\/preview.example\/p\/[\w-]{43}\?preview=1$/);assert.equal(first.sent_status,'unsent');assert.equal(first.live_url,null);assert.equal(first.review_status,'awaiting_user_approval');
  for(const row of newInstitutions){const draft=draftUniversityEmail(row,null,'https://preview.example/p/'+'x'.repeat(43));assert.doesNotMatch(draft.body,/\b(?:fees?|pricing|waivers?|free|complimentary|subsidized|PDFs?)\b/i);assert.equal((draft.body.match(/https:\/\//g)||[]).length,1);}
  const existing=review.rows.filter(i=>i.already_contacted);assert.equal(existing.length,2);assert.ok(existing.every(i=>i.email_kind==='follow_up_review_only'&&i.outreach_token===null&&i.sent_status==='already_contacted'));
  assert.equal([...docs].some(([key])=>key.startsWith('emailTasks/')),false);
  assert.match(reviewCsv([{email_body:'=formula'}]),/"'=formula"/);
});
test('new route and chrome boundaries preserve existing deck assets and reject production publication',()=>{
  const page=readFileSync('app/partnerships/universities/[institution]/page.tsx','utf8');assert.match(page,/if \(!universityPreviewEnabled\(\)\) notFound/);assert.match(page,/if \(!token\) notFound/);assert.match(page,/adult students/);assert.doesNotMatch(page,/\.pdf|\b(?:download|fees?|waivers?)\b/i);
  for(const file of ['app/components/SiteChrome.tsx','app/components/GoogleAds.tsx'])assert.ok(readFileSync(file,'utf8').includes("pathname.startsWith('/partnerships/universities/')"));
  assert.equal(Object.keys(universityEvents).length,7);assert.equal(summarize([],false).find(i=>i.proposal_id===institution.proposal_id)?.visits,0);
});

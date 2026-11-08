/** Operator-only import of reconciled private review artifacts. Preview only; never sends or publishes. */
import 'server-only';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { CONTACT_COLLECTION, universityPreviewEnabled } from '@/lib/universities/links';
import { ASSET_COLLECTION, PRESENTATION_COLLECTION, PRESENTATION_VERSION, type UniversityPresentation } from '@/lib/universities/presentations';
import { newInstitutions } from '@/lib/universities/institutions';
async function main(){
 if(!universityPreviewEnabled())throw new Error('Preview-only import.');
 const [source,directory]=process.argv.slice(2);if(!source||!directory)throw new Error('Supply private reconciled JSON and asset directory.');
 const master=JSON.parse(await readFile(source,'utf8'));const rows=master.institutions.filter((r:{already_contacted:boolean})=>!r.already_contacted);
 if(rows.length!==39||new Set(rows.map((r:{institution_id:string})=>r.institution_id)).size!==39)throw new Error('Expected exactly39 new institutions.');
 const {firebaseAdmin}=await import('@/lib/firebaseAdmin');const db=firebaseAdmin.firestore();
 const project=process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,key=process.env.NEXT_PUBLIC_FIREBASE_API_KEY;if(!project||!key)throw new Error('Security preflight configuration missing.');
 for(const collection of [CONTACT_COLLECTION,ASSET_COLLECTION,PRESENTATION_COLLECTION]){
  const url=`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/${collection}/anonymous-security-probe?key=${key}`;
  const response=await fetch(url,{signal:AbortSignal.timeout(15000)});if(response.status!==403)throw new Error(`Anonymous access not proven denied for ${collection}; no data imported.`);
 }
 const prepared=[];
 for(const row of rows){
  const institution=newInstitutions.find(r=>r.institution_id===row.institution_id);if(!institution||row.sent_status!=='unsent'||row.review_status!=='awaiting_user_approval')throw new Error('Invalid approval boundary.');
  const contact=await db.collection(CONTACT_COLLECTION).doc(row.contact_id).get();const data=contact.data();if(!data||data.institution_id!==row.institution_id||data.environment!=='preview'||data.sent_status!=='unsent')throw new Error('Contact does not match an unsent preview record.');
  const assets:UniversityPresentation['assets']={};const bytesById=new Map<string,Buffer>();
  const files=(await readdir(path.join(directory,row.institution_id))).filter(f=>/^slide-0[1-8](?:-(?:1280|1920))?\.webp$/.test(f)||f==='presentation.pdf');
  if(files.length!==25||row.slides.length!==8)throw new Error('Incomplete presentation package.');
  for(const file of files){const bytes=await readFile(path.join(directory,row.institution_id,file));if(bytes.length>900000)throw new Error('Private asset exceeds the bounded document limit.');const sha256=createHash('sha256').update(bytes).digest('hex'),id=`preview_${sha256}`;assets[file]={id,sha256,bytes:bytes.length,content_type:file.endsWith('.pdf')?'application/pdf':'image/webp'};bytesById.set(id,bytes);}
  const deck:UniversityPresentation={institution_id:row.institution_id,contact_id:row.contact_id,environment:'preview',content_version:PRESENTATION_VERSION,prepared_for:row.prepared_for,source_sha256:master.source_sha256,review_status:'awaiting_user_approval',slides:row.slides,assets,pdf_filename:`iPurpose_${row.institution_id}_Partnership_Concept.pdf`};
  prepared.push({row,deck,bytesById});
 }
 const uploaded=new Set<string>();
 for(const {row,deck,bytesById}of prepared){
  for(const asset of Object.values(deck.assets)){if(uploaded.has(asset.id))continue;const ref=db.collection(ASSET_COLLECTION).doc(asset.id);if(!(await ref.get()).exists)await ref.create({environment:'preview',sha256:asset.sha256,content_type:asset.content_type,bytes:bytesById.get(asset.id)});uploaded.add(asset.id);}
  const batch=db.batch();batch.set(db.collection(PRESENTATION_COLLECTION).doc(`preview_${row.contact_id}`),deck);
  batch.update(db.collection(CONTACT_COLLECTION).doc(row.contact_id),{recipient_name:row.recipient_name,recipient_email:row.recipient_email,primary_office:row.office,verified_source_url:row.verified_source_url,source_checked_at:row.source_checked_at,contact_status:row.contact_status,notes:row.notes,named_role_verified:row.named_role_verified,display_addressee:row.display_addressee,alternative_emails:row.alternative_emails,email_evidence:row.email_evidence,state:row.state,content_version:PRESENTATION_VERSION,analytics_status:'preview_link_ready_for_qa',qa_checked_at:null,review_status:'awaiting_user_approval'});await batch.commit();
  console.log(JSON.stringify({imported:row.institution_id,assets:25,slides:8,sent:0}));
 }
 console.log(JSON.stringify({presentations:prepared.length,distinctPrivateAssets:uploaded.size,anonymousAccess:'denied',sent:0,scheduled:0,productionWrites:0}));
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});

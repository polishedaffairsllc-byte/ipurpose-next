/** Operator-only publication of the owner's 39 original scheduled links. Never reads/writes Gmail. */
import 'server-only';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { Timestamp } from 'firebase-admin/firestore';
import { institutionById } from '@/lib/universities/institutions';
import { CONTACT_COLLECTION, LINK_COLLECTION, tokenHash } from '@/lib/universities/links';
import { PRESENTATION_COLLECTION, ASSET_COLLECTION, PRESENTATION_VERSION } from '@/lib/universities/presentations';
import { PUBLICATION_COLLECTION, presentationFingerprint } from '@/lib/universities/publication';

async function main() {
  const [filename, action] = process.argv.slice(2);
  if (!filename || (action && action !== '--publish')) throw new Error('Supply the private approved manifest; omit --publish for validation only.');
  const manifest = JSON.parse(await readFile(filename, 'utf8')) as { approval_reference: string; links: { institution_id: string; original_url: string }[] };
  if (manifest.approval_reference !== 'owner-approved-issue-101' || !Array.isArray(manifest.links) || manifest.links.length !== 39 || new Set(manifest.links.map(row => row.institution_id)).size !== 39 || new Set(manifest.links.map(row => row.original_url)).size !== 39) throw new Error('Expected exactly 39 unique owner-approved scheduled links.');
  const { firebaseAdmin } = await import('@/lib/firebaseAdmin');
  const db = firebaseAdmin.firestore();
  const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (project !== 'ipurpose-mvp' || !key) throw new Error('Publication project configuration mismatch.');
  for (const collection of [CONTACT_COLLECTION, LINK_COLLECTION, PRESENTATION_COLLECTION, ASSET_COLLECTION, PUBLICATION_COLLECTION]) {
    const probe = await fetch(`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/${collection}/anonymous-security-probe?key=${key}`, { signal: AbortSignal.timeout(15000) });
    if (probe.status !== 403) throw new Error(`Anonymous access not denied for ${collection}; nothing published.`);
  }
  const prepared = [], assets = new Map<string, { sha256: string; bytes: number; content_type: string }>();
  for (const row of manifest.links) {
    const url = new URL(row.original_url), institution = institutionById(row.institution_id);
    if (!institution || institution.already_contacted || url.origin !== 'https://ipurposesoul.com' || url.search || url.hash || !/^\/p\/[A-Za-z0-9_-]{43}$/.test(url.pathname)) throw new Error('Invalid approved URL or institution.');
    const hash = tokenHash(url.pathname.slice(3)), link = (await db.collection(LINK_COLLECTION).doc(hash).get()).data();
    if (!link || link.institution_id !== row.institution_id || link.proposal_id !== institution.proposal_id || link.environment !== 'preview' || link.enabled !== true || link.review_status !== 'awaiting_user_approval' || !(link.expiresAt instanceof Timestamp) || link.expiresAt.toMillis() <= Date.now() || typeof link.contact_id !== 'string' || typeof link.campaign_id !== 'string') throw new Error(`Original link not valid for ${row.institution_id}.`);
    const contact = (await db.collection(CONTACT_COLLECTION).doc(link.contact_id).get()).data();
    const presentationId = `preview_${link.contact_id}`, deck = (await db.collection(PRESENTATION_COLLECTION).doc(presentationId).get()).data();
    if (!contact || contact.institution_id !== row.institution_id || contact.contact_status === 'qa_only' || !deck || deck.institution_id !== row.institution_id || deck.contact_id !== link.contact_id || deck.environment !== 'preview' || deck.review_status !== 'awaiting_user_approval' || deck.content_version !== PRESENTATION_VERSION || !Array.isArray(deck.slides) || deck.slides.length !== 8 || deck.slides.some((slide, i) => slide.number !== i + 1) || !deck.assets || Object.keys(deck.assets).length !== 25) throw new Error(`Presentation binding incomplete for ${row.institution_id}.`);
    for (const file of [...Array.from({ length: 8 }, (_, i) => ['', '-1280', '-1920'].map(size => `slide-0${i + 1}${size}.webp`)).flat(), 'presentation.pdf']) {
      const asset = deck.assets[file];
      if (!asset || typeof asset.id !== 'string' || !/^[a-f0-9]{64}$/.test(asset.sha256) || !Number.isSafeInteger(asset.bytes) || asset.bytes < 1 || asset.content_type !== (file.endsWith('.pdf') ? 'application/pdf' : 'image/webp')) throw new Error(`Incomplete asset manifest for ${row.institution_id}.`);
      assets.set(asset.id, asset);
    }
    const publication = { environment: 'production', enabled: true, review_status: 'approved_for_recipient_access', approval_reference: manifest.approval_reference, approvedAt: Timestamp.now(), expiresAt: link.expiresAt, institution_id: row.institution_id, contact_id: link.contact_id, proposal_id: link.proposal_id, campaign_id: link.campaign_id, presentation_id: presentationId, presentation_sha256: presentationFingerprint(deck) };
    const ref = db.collection(PUBLICATION_COLLECTION).doc(hash), existing = await ref.get();
    if (existing.exists && (existing.data()?.presentation_sha256 !== publication.presentation_sha256 || existing.data()?.institution_id !== row.institution_id || existing.data()?.enabled !== true)) throw new Error('Existing publication differs; explicit reconciliation required.');
    prepared.push({ ref, publication, exists: existing.exists });
  }
  const assetRows = [...assets.entries()];
  for (let i = 0; i < assetRows.length; i += 20) {
    const chunk = assetRows.slice(i, i + 20), stored = await db.getAll(...chunk.map(([id]) => db.collection(ASSET_COLLECTION).doc(id)));
    stored.forEach((doc, index) => {
      const data = doc.data(), expected = chunk[index][1];
      if (!data || data.environment !== 'preview' || !Buffer.isBuffer(data.bytes) || data.bytes.length !== expected.bytes || data.content_type !== expected.content_type || data.sha256 !== expected.sha256 || createHash('sha256').update(data.bytes).digest('hex') !== expected.sha256) throw new Error('Approved asset integrity check failed; nothing published.');
    });
  }
  if (action === '--publish') {
    const batch = db.batch();
    for (const row of prepared) if (!row.exists) batch.create(row.ref, row.publication);
    await batch.commit();
  }
  console.log(JSON.stringify({ approved: prepared.length, slides: prepared.length * 8, distinctAssetsVerified: assets.size, publicationRecordsCreated: action === '--publish' ? prepared.filter(row => !row.exists).length : 0, originalRecordsChanged: 0, tokensChanged: 0, gmailChanges: 0 }));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });

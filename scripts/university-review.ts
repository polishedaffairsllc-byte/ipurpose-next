/** Operator-only preview setup/export. Private contact input must never be committed. No send/schedule/publish command. */
import 'server-only';
import { readFile, writeFile } from 'node:fs/promises';
import { seedReviewContact, universityPreviewEnabled, type ReviewContact } from '@/lib/universities/links';
import { universityReview } from '@/lib/universities/review';
import { reviewCsv } from '@/lib/universities/drafts';
import { z } from 'zod';
const contactSchema = z.object({ contact_id: z.uuid(), institution_id: z.string(), recipient_name: z.string().nullable(), recipient_email: z.email().nullable(), primary_office: z.string().nullable(), verified_source_url: z.url(), source_checked_at: z.iso.date(), contact_status: z.string(), notes: z.array(z.string()) }).strict();
async function main() {
  if (!universityPreviewEnabled()) throw new Error('Preview-only operation.');
  const [command, source, destination] = process.argv.slice(2);
  if (command !== 'seed' && command !== 'export') throw new Error('Usage: university-review.ts seed <private-contact-json> | export <verified-preview-origin> <private-output-json>');
  const { firebaseAdmin } = await import('@/lib/firebaseAdmin'); const db = firebaseAdmin.firestore();
  if (command === 'seed') {
    // Confirm production rules already deny public access. Never deploy rules from this utility.
    const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID; const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!project || !key) throw new Error('Firebase public project configuration is required for security preflight.');
    for (const collection of ['proposalOutreachContacts', 'proposalOutreachLinks', 'proposalOutreachEvents']) {
      const response = await fetch(`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/${collection}?pageSize=1&key=${key}`, { signal: AbortSignal.timeout(15000) });
      if (response.status !== 403) throw new Error(`Anonymous access not proven denied for ${collection}; no contact data written.`);
    }
    const contacts = z.array(contactSchema).parse(JSON.parse(await readFile(source, 'utf8'))) as ReviewContact[];
    if (new Set(contacts.map(c => c.contact_id)).size !== contacts.length) throw new Error('Each contact needs a distinct UUID.');
    for (const contact of contacts) await seedReviewContact(db, contact);
    console.log(JSON.stringify({ previewContactsProcessed: contacts.length, sent: 0, scheduled: 0 }));
  } else {
    const origin = new URL(source); if (origin.protocol !== 'https:' || !origin.hostname.endsWith('.vercel.app') || origin.origin !== source) throw new Error('Supply the verified Vercel preview origin.');
    if (!destination) throw new Error('Private output path required.');
    const report = await universityReview(db, origin.origin);
    await writeFile(destination, JSON.stringify(report, null, 2), { mode: 0o600 });
    await writeFile(destination.replace(/\.json$/, '') + '.csv', reviewCsv(report.rows), { mode: 0o600 });
    console.log(JSON.stringify({ exported: report.rows.length, output: destination, sent: 0, scheduled: 0 }));
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });

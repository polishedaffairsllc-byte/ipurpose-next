/** Server-only operator maintenance. Uses existing Firebase credentials; never publish tokens/credentials. */
import { randomBytes, createHash } from 'node:crypto';
import { Timestamp } from 'firebase-admin/firestore';
import { firebaseAdmin } from '../lib/firebaseAdmin';
import { cleanupOutreachEvents, OUTREACH_LINKS_COLLECTION } from '../lib/outreach/service';
import { proposalById } from '../lib/outreach/registry';
async function main() {
  const db = firebaseAdmin.firestore();
  const [command, proposalId] = process.argv.slice(2);
  if (command === 'cleanup') {
    let total = 0; let count;
    do { count = await cleanupOutreachEvents(db); total += count; } while (count === 200);
    const expired = await db.collection(OUTREACH_LINKS_COLLECTION).where('expiresAt', '<', Timestamp.now()).limit(200).get();
    const batch = db.batch(); expired.docs.forEach(doc => batch.delete(doc.ref)); if (!expired.empty) await batch.commit();
    console.log(JSON.stringify({ deletedEvents: total, deletedLinks: expired.size })); return;
  }
  const proposal = proposalById(proposalId);
  if (command !== 'create-link' || !proposal) throw new Error('Use cleanup or create-link <registered-proposal-id>.');
  const token = randomBytes(32).toString('base64url');
  await db.collection(OUTREACH_LINKS_COLLECTION).doc(createHash('sha256').update(token).digest('hex')).create({
    proposal_id: proposal.id, enabled: true, expiresAt: Timestamp.fromMillis(Date.now() + 180 * 86400000),
  });
  console.log(`https://ipurposesoul.com${proposal.pagePath}?outreach=${token}`);
}
main().catch(() => { console.error('Outreach maintenance failed. Check server credentials and the command.'); process.exitCode = 1; });

/**
 * POST /api/admin/backfill-nurture-sequence
 *
 * One-time admin route to drop existing Clarity Check subscribers into the
 * nurture sequence at the correct point based on when they completed the check.
 *
 * Logic:
 *   - Reads all leads (source: clarity-check) — uses the most recent submission per email
 *   - Skips opted-out emails
 *   - For each subscriber, calculates which nurture emails are still in the future
 *     based on their original completion date
 *   - Writes only the remaining pending tasks to emailTasks (skips tasks already queued)
 *
 * Authorization: Bearer <ADMIN_SECRET_TOKEN> (set in .env.local + Vercel env vars)
 *
 * Run once via:
 *   curl -X POST https://ipurposesoul.com/api/admin/backfill-nurture-sequence \
 *     -H "Authorization: Bearer YOUR_ADMIN_SECRET_TOKEN"
 *
 * Safe to run multiple times — will not create duplicate tasks.
 */

import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebaseAdmin';

const DAY = 24 * 60 * 60 * 1000;

// Full sequence: { type, delayMs from completion date }
const SEQUENCE = [
  { type: 'nurture_1',                   delay: 2  * DAY },
  { type: 'nurture_2',                   delay: 4  * DAY },
  { type: 'clarity_check_founders_rate', delay: 5  * DAY },
  { type: 'nurture_3',                   delay: 7  * DAY },
  { type: 'nurture_4',                   delay: 10 * DAY },
  { type: 'nurture_5',                   delay: 14 * DAY },
];

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const token = process.env.ADMIN_SECRET_TOKEN;
  if (!authHeader || !token) return false;
  return authHeader === `Bearer ${token}`;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = firebaseAdmin.firestore();
  const now = Date.now();

  // 1. Load all existing email tasks so we can skip already-queued ones
  const existingTasksSnap = await db
    .collection('emailTasks')
    .where('status', '==', 'pending')
    .get();

  // Build a set of "email::type" for fast lookup
  const existingKeys = new Set<string>();
  existingTasksSnap.forEach((doc) => {
    const d = doc.data();
    if (d.email && d.type) existingKeys.add(`${d.email}::${d.type}`);
  });

  // Also check completed tasks so we don't re-send something already sent
  const completedTasksSnap = await db
    .collection('emailTasks')
    .where('status', '==', 'completed')
    .get();
  completedTasksSnap.forEach((doc) => {
    const d = doc.data();
    if (d.email && d.type) existingKeys.add(`${d.email}::${d.type}`);
  });

  // 2. Load all leads from clarity-check source — deduplicate by email, keep most recent
  const leadsSnap = await db
    .collection('leads')
    .orderBy('createdAt', 'asc')
    .get();

  const byEmail = new Map<string, { email: string; name: string; submissionId: string; identityType?: string; completedAt: Date }>();
  leadsSnap.forEach((doc) => {
    const d = doc.data();
    if (!d.email) return;
    // Only process clarity-check leads
    if (d.source && d.source !== 'clarity-check') return;
    const completedAt: Date = typeof d.createdAt?.toDate === 'function'
      ? d.createdAt.toDate()
      : new Date(d.createdAt ?? now);
    // Keep most recent (later entries overwrite earlier due to asc order)
    byEmail.set(d.email.toLowerCase().trim(), {
      email: d.email,
      name: d.name ?? '',
      submissionId: doc.id,
      identityType: d.identityType,
      completedAt,
    });
  });

  // 3. Load opt-outs
  const optOutsSnap = await db.collection('email_opt_outs').get();
  const optedOut = new Set<string>();
  optOutsSnap.forEach((doc) => optedOut.add(doc.id)); // doc IDs are base64-encoded emails

  function isOptedOut(email: string): boolean {
    const key = Buffer.from(email.trim().toLowerCase()).toString('base64');
    return optedOut.has(key);
  }

  // 4. Build batch of tasks to create
  let queued = 0;
  let skipped = 0;
  let optedOutCount = 0;
  const results: Array<{ email: string; tasksQueued: string[] }> = [];

  // Firestore batch limit is 500 writes — chunk if needed
  let batch = db.batch();
  let batchCount = 0;

  for (const subscriber of byEmail.values()) {
    if (isOptedOut(subscriber.email)) {
      optedOutCount++;
      continue;
    }

    const completionTime = subscriber.completedAt.getTime();
    const tasksQueuedForSubscriber: string[] = [];

    for (const step of SEQUENCE) {
      // nurture_5 (workshop invite) held until WORKSHOP_ACTIVE=true
      if (step.type === 'nurture_5') continue;

      const scheduledFor = new Date(completionTime + step.delay);

      // Skip if already in the past by more than 24 hours (window has closed)
      if (scheduledFor.getTime() < now - DAY) continue;

      // Skip if already queued or sent
      const key = `${subscriber.email}::${step.type}`;
      if (existingKeys.has(key)) {
        skipped++;
        continue;
      }

      const ref = db.collection('emailTasks').doc();
      batch.set(ref, {
        email: subscriber.email,
        name: subscriber.name,
        submissionId: subscriber.submissionId,
        ...(subscriber.identityType && { identityType: subscriber.identityType }),
        type: step.type,
        scheduledFor,
        status: 'pending',
        createdAt: new Date(),
        backfilled: true,
      });

      existingKeys.add(key); // prevent dupes within this run
      tasksQueuedForSubscriber.push(`${step.type} @ ${scheduledFor.toISOString()}`);
      queued++;
      batchCount++;

      // Commit and reset batch every 499 writes
      if (batchCount >= 499) {
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
      }
    }

    if (tasksQueuedForSubscriber.length > 0) {
      results.push({ email: subscriber.email, tasksQueued: tasksQueuedForSubscriber });
    }
  }

  // Commit remaining
  if (batchCount > 0) await batch.commit();

  console.log(`[Backfill] Done. Queued: ${queued}, Skipped (already exists): ${skipped}, Opted out: ${optedOutCount}`);

  return NextResponse.json({
    success: true,
    totalSubscribers: byEmail.size,
    optedOut: optedOutCount,
    tasksQueued: queued,
    tasksSkipped: skipped,
    detail: results,
  });
}

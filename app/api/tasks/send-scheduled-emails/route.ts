/**
 * Email scheduler - triggered daily by Vercel Cron.
 *
 * Vercel Cron sends a GET request with:
 *   Authorization: Bearer <CRON_SECRET>
 *
 * Manual testing is still possible via POST with:
 *   Authorization: Bearer <SCHEDULER_SECRET_TOKEN>
 *
 * Setup:
 *   - Add CRON_SECRET to Vercel project env vars (Vercel populates this automatically
 *     when you add a cron job if you don't set it yourself — but set it explicitly).
 *   - Keep SCHEDULER_SECRET_TOKEN in .env.local for local/manual testing only.
 */

import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { sendClarityCheckFoundersRateEmail } from '@/lib/email-automation';

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;

  const cronSecret = process.env.CRON_SECRET;
  const manualToken = process.env.SCHEDULER_SECRET_TOKEN;

  // Primary: Vercel Cron uses CRON_SECRET
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true;

  // Fallback: manual testing uses SCHEDULER_SECRET_TOKEN
  if (manualToken && authHeader === `Bearer ${manualToken}`) return true;

  return false;
}

async function runScheduler(request: NextRequest): Promise<NextResponse> {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    console.log(`[SCHEDULER] Running scheduled email task at ${now.toISOString()}`);

    // Query for pending email tasks that are due
    const tasksSnapshot = await firebaseAdmin
      .firestore()
      .collection('emailTasks')
      .where('status', '==', 'pending')
      .limit(100) // Process up to 100 at a time
      .get();

    console.log(`[SCHEDULER] Found ${tasksSnapshot.size} potential tasks to process`);

    let processed = 0;
    let failed = 0;

    // Process each task
    for (const doc of tasksSnapshot.docs) {
      const task = doc.data();
      
      // Filter by type and scheduledFor in code (avoid needing composite index)
      if (task.type !== 'clarity_check_founders_rate') {
        continue;
      }

      // Normalize scheduledFor — Firestore Timestamp or plain Date/string
      const scheduledFor: Date | null = task.scheduledFor
        ? typeof task.scheduledFor.toDate === 'function'
          ? task.scheduledFor.toDate()
          : new Date(task.scheduledFor)
        : null;

      if (!scheduledFor || scheduledFor > now) {
        continue;
      }

      try {
        // Send the email
        const sent = await sendClarityCheckFoundersRateEmail({
          email: task.email,
          name: task.name,
          submissionId: task.submissionId,
          identityType: task.identityType,
          totalScore: task.totalScore,
        });

        if (sent) {
          // Mark as completed
          await doc.ref.update({
            status: 'completed',
            sentAt: new Date(),
          });
          processed++;
          console.log(`[SCHEDULER] ✓ Sent to ${task.email}`);
        } else {
          throw new Error('sendClarityCheckFoundersRateEmail returned false');
        }
      } catch (error) {
        failed++;
        console.error(`[SCHEDULER] ✗ Failed to process ${task.email}:`, error);

        // Update task with error and retry count
        const retryCount = (task.retryCount || 0) + 1;
        const maxRetries = 5;

        if (retryCount < maxRetries) {
          // Retry later (schedule for 1 hour from now)
          await doc.ref.update({
            retryCount,
            lastError: String(error),
            scheduledFor: new Date(Date.now() + 60 * 60 * 1000),
          });
          console.log(`[SCHEDULER] Scheduled retry ${retryCount}/${maxRetries}`);
        } else {
          // Give up after 5 retries
          await doc.ref.update({
            status: 'failed',
            retryCount,
            lastError: String(error),
            failedAt: new Date(),
          });
          console.log(`[SCHEDULER] Max retries exceeded, marking as failed`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      failed,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('[SCHEDULER] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// Vercel Cron calls GET; manual testing can use POST
export const GET = runScheduler;
export const POST = runScheduler;

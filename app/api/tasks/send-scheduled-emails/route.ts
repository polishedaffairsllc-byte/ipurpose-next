/**
 * Email scheduler - runs periodically to send scheduled emails
 * This should be called via a Cloud Function or scheduled task (e.g., Cloud Scheduler)
 * 
 * Example: POST /api/tasks/send-scheduled-emails
 * This could be triggered by Cloud Scheduler every hour
 */

import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { sendClarityCheckFoundersRateEmail } from '@/lib/email-automation';

export async function POST(request: NextRequest) {
  try {
    // Verify this is called from Cloud Scheduler or internal service
    const authToken = request.headers.get('authorization');
    const expectedToken = process.env.SCHEDULER_SECRET_TOKEN;

    if (!expectedToken || authToken !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = new Date();
    console.log(`[SCHEDULER] Running scheduled email task at ${now.toISOString()}`);

    // Query for pending email tasks that are due
    const tasksSnapshot = await firebaseAdmin
      .firestore()
      .collection('emailTasks')
      .where('status', '==', 'pending')
      .where('type', '==', 'clarity_check_founders_rate')
      .where('scheduledFor', '<=', now)
      .limit(100) // Process up to 100 at a time
      .get();

    console.log(`[SCHEDULER] Found ${tasksSnapshot.size} tasks to process`);

    let processed = 0;
    let failed = 0;

    // Process each task
    for (const doc of tasksSnapshot.docs) {
      const task = doc.data();

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
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}

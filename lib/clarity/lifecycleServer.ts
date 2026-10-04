import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { scheduleEmailSequence, sendClarityCheckResultsEmail, type ClarityCheckScores } from '@/lib/email-automation';
import { runClarityLifecycle, type LifecycleInput } from './lifecycle';
import type { TransactionalSender } from './delivery';

export const sendTransactionalEmail: TransactionalSender = async (message, key) => {
  if (!process.env.RESEND_API_KEY) throw new Error('Email provider unavailable');
  const { Resend } = await import('resend');
  const response = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: 'iPurpose <renita@ipurposesoul.com>', to: message.to, subject: message.subject, text: message.text,
  }, { idempotencyKey: key });
  if (response.error || !response.data?.id) throw new Error('Email delivery not confirmed');
  return response.data.id;
};

export function completeClarityLifecycle(input: LifecycleInput) {
  return runClarityLifecycle(input, {
    db: firebaseAdmin.firestore(),
    enroll: scheduleEmailSequence,
    webResults: data => sendClarityCheckResultsEmail({ email: data.email, name: data.name || '',
      scores: data.scores as unknown as ClarityCheckScores, resultSummary: data.resultSummary!,
      nextStep: data.nextStep!, submissionId: data.quizSubmissionId, identityType: data.identityType }),
    send: sendTransactionalEmail,
  });
}

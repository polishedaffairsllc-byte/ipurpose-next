import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      communityLanding,
      memberFeedback,
      formatFit,
      futureCollaboration,
      adjustmentsForNext,
      respondentName,
      respondentEmail,
      sessionDate,
    } = body;

    if (!communityLanding) {
      return NextResponse.json({ ok: false, error: 'At least one response is required.' }, { status: 400 });
    }

    const db = firebaseAdmin.firestore();
    const docRef = await db.collection('sla_org_feedback').add({
      communityLanding: communityLanding || null,
      memberFeedback: memberFeedback || null,
      formatFit: formatFit || null,
      futureCollaboration: futureCollaboration || null,
      adjustmentsForNext: adjustmentsForNext || null,
      respondentName: respondentName || null,
      respondentEmail: respondentEmail || null,
      sessionDate: sessionDate || null,
      source: 'sla-org',
      submittedAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, id: docRef.id });
  } catch (err) {
    console.error('[SLA_ORG_FEEDBACK] Error:', err);
    return NextResponse.json({ ok: false, error: 'Something went wrong.' }, { status: 500 });
  }
}

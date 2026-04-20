import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      // Section 1 — Quick Pulse
      overallRating,
      clarityBefore,
      clarityAfter,
      // Section 2 — What Landed
      mostUseful,
      resonatedPillar,
      unclearOrMore,
      // Section 3 — About You
      businessStage,
      biggestChallenge,
      // Section 4 — Testimonial
      willingToTestimonial,
      testimonialQuote,
      testimonialPermission,
      // Meta
      sessionDate,
      participantName,
      participantEmail,
    } = body;

    if (!overallRating) {
      return NextResponse.json({ ok: false, error: 'Rating is required.' }, { status: 400 });
    }

    const db = firebaseAdmin.firestore();
    const docRef = await db.collection('sla_feedback').add({
      overallRating,
      clarityBefore,
      clarityAfter,
      mostUseful: mostUseful || null,
      resonatedPillar: resonatedPillar || null,
      unclearOrMore: unclearOrMore || null,
      businessStage: businessStage || null,
      biggestChallenge: biggestChallenge || null,
      willingToTestimonial: willingToTestimonial || null,
      testimonialQuote: testimonialQuote || null,
      testimonialPermission: testimonialPermission || null,
      participantName: participantName || null,
      participantEmail: participantEmail || null,
      sessionDate: sessionDate || null,
      source: 'sla-workshop',
      submittedAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, id: docRef.id });
  } catch (err) {
    console.error('[SLA_FEEDBACK] Error:', err);
    return NextResponse.json({ ok: false, error: 'Something went wrong.' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

interface ClarityCheckRequest {
  email: string;
  responses: Record<number, number>;
}

function calculateDimensionScores(responses: Record<number, number>) {
  const internalClarity = (responses[1] || 0) + (responses[2] || 0) + (responses[3] || 0);
  const readinessForSupport = (responses[4] || 0) + (responses[5] || 0) + (responses[6] || 0);
  const frictionBetweenInsightAndAction = (responses[7] || 0) + (responses[8] || 0) + (responses[9] || 0);
  const integrationAndMomentum = (responses[10] || 0) + (responses[11] || 0) + (responses[12] || 0);

  const totalScore =
    internalClarity + readinessForSupport + frictionBetweenInsightAndAction + integrationAndMomentum;

  return {
    internalClarity,
    readinessForSupport,
    frictionBetweenInsightAndAction,
    integrationAndMomentum,
    totalScore,
  };
}

function generateSummary(scores: ReturnType<typeof calculateDimensionScores>) {
  const { internalClarity, readinessForSupport, frictionBetweenInsightAndAction, integrationAndMomentum, totalScore } = scores;

  let summary = '';
  let nextStep = '';

  // Determine overall profile and next step
  if (totalScore >= 50) {
    summary =
      "You're in a place of relative clarity and momentum. Your sense of direction feels grounded, and you're open to support. The work now is integration—translating what you know into consistent practice.";
    nextStep = 'Consider how to structure your days to honor the clarity you have found.';
  } else if (totalScore >= 35) {
    summary =
      "You have insight, but there's friction between knowing and doing. You sense what needs to shift, and you're open to help. The gap isn't about understanding—it's about container and support.";
    nextStep = 'Identify one area where external structure could unlock your momentum.';
  } else {
    summary =
      "You're navigating fog right now. That's not failure—it's often a signal that a deeper recalibration is needed. You're here because something knows better is possible.";
    nextStep = 'Start by naming one thing that, if it shifted, would change everything for you.';
  }

  return { summary, nextStep };
}

async function sendResultsEmail(email: string, scores: ReturnType<typeof calculateDimensionScores>, summary: string, nextStep: string) {
  // This is a placeholder for email sending
  // In production, integrate with SendGrid, Resend, or similar
  console.log(`Email would be sent to ${email} with results:`, { scores, summary, nextStep });

  // TODO: Implement actual email sending
  // For now, we'll just log it
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body: ClarityCheckRequest = await request.json();
    const { email, responses } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    if (!responses || Object.keys(responses).length !== 12) {
      return NextResponse.json(
        { error: 'All 12 questions must be answered' },
        { status: 400 }
      );
    }

    // Validate all responses are between 1-5
    for (const [key, value] of Object.entries(responses)) {
      if (typeof value !== 'number' || value < 1 || value > 5) {
        return NextResponse.json(
          { error: 'All responses must be a number between 1 and 5' },
          { status: 400 }
        );
      }
    }

    // Calculate scores
    const scores = calculateDimensionScores(responses);
    const { summary, nextStep } = generateSummary(scores);

    // Store in Firestore
    try {
      await firebaseAdmin
        .firestore()
        .collection('clarity_checks')
        .add({
          email,
          responses,
          scores,
          summary,
          nextStep,
          timestamp: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        });
    } catch (firestoreError) {
      console.error('Firestore error:', firestoreError);
      // Continue anyway—email is more important
    }

    // Send email with results
    try {
      await sendResultsEmail(email, scores, summary, nextStep);
    } catch (emailError) {
      console.error('Email error:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Clarity check submitted',
        scores,
        summary,
        nextStep,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Clarity check submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process clarity check' },
      { status: 500 }
    );
  }
}

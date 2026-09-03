import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { sendFounderNotification, ClarityCheckScores } from '@/lib/email-automation';
import { getRequestBearerAuth } from '@/lib/firebase/requestAuth';

export const dynamic = 'force-dynamic';

interface ClarityCheckRequest {
  email?: string;
  responses: Record<string, number>;
  identityResponses?: string[];
  onboarding?: boolean;
}

function calculateDimensionScores(responses: Record<string, number>) {
  const internalClarity = (responses[1] || 0) + (responses[2] || 0);
  const readinessForSupport = (responses[3] || 0) + (responses[4] || 0);
  const frictionBetweenInsightAndAction = (responses[5] || 0) + (responses[6] || 0);
  const integrationAndMomentum = (responses[7] || 0);

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

function calculateIdentityType(identityResponses: string[]) {
  const counts: Record<string, number> = {
    A: 0, // Visionary
    B: 0, // Builder
    C: 0, // Nurturer
    D: 0, // Strategist
    E: 0, // Creator
  };

  // Count each response
  identityResponses.forEach(response => {
    if (counts[response] !== undefined) {
      counts[response]++;
    }
  });

  // Find the highest count
  let maxCount = 0;
  let identityType = 'Visionary'; // default
  
  // Deterministic tie-break order: A > B > C > D > E
  const order = ['A', 'B', 'C', 'D', 'E'];
  for (const letter of order) {
    if (counts[letter] > maxCount) {
      maxCount = counts[letter];
      identityType = letter === 'A' ? 'Visionary' :
                     letter === 'B' ? 'Builder' :
                     letter === 'C' ? 'Nurturer' :
                     letter === 'D' ? 'Strategist' : 'Creator';
    }
  }

  return { identityType, identityCounts: counts };
}

function generateSummary(scores: ReturnType<typeof calculateDimensionScores>) {
  const { internalClarity, readinessForSupport, frictionBetweenInsightAndAction, integrationAndMomentum, totalScore } = scores;

  let summary = '';
  let detail = '';
  let nextStep = '';

  // Determine overall profile and next step
  // Thresholds for max score of 35 (7 questions × 5):
  //   High Clarity:   ≥ 26  (top ~third — scoring 3.7+ avg per question)
  //   Mixed Clarity:  17–25 (middle ~third — scoring 2.4–3.6 avg)
  //   Low Clarity:    < 17  (lower ~third — scoring < 2.4 avg)
  if (totalScore >= 26) {
    summary =
      "You have real clarity and forward motion right now. Your direction feels grounded, and you're open to support. The next step is integration - turning what you already know into a steady rhythm.";
    detail = "You scored highly across all dimensions, showing strong internal clarity, readiness for support, and integration. This indicates you're in a good position to take aligned action.";
    nextStep = 'Choose one simple structure to protect your momentum this week (a weekly plan, a daily priority, or a decision filter).';
  } else if (totalScore >= 17) {
    summary =
      "You have insight, but there's a gap between knowing and doing. You can sense what needs to shift, and you're open to support. This isn't a knowledge problem - it's a structure and follow-through problem.";
    detail = "Your scores show clarity in some areas but friction in translating insight to action. With the right systems and support, you can bridge this gap.";
    nextStep = 'Pick one area where a clear system would remove friction (time, decisions, or next steps) - and start there.';
  } else {
    summary =
      "Things feel foggy right now - and that doesn't mean you're failing. It often means you're carrying too much, moving without a clear anchor, or trying to decide under pressure. You're here because part of you knows it's time to recalibrate.";
    detail = "Lower scores across dimensions suggest you may benefit from stepping back to clarify your foundation before taking action. This is a natural part of the journey.";
    nextStep = 'Name one pressure you can release this week, and one truth you\'re ready to act on - even in a small way.';
  }

  return { summary, detail, nextStep };
}

// sendFounderNotification is now imported from @/lib/email-automation

export async function POST(request: NextRequest) {
  try {
    const body: ClarityCheckRequest = await request.json();
    const { email, responses, identityResponses } = body;
    const bearerAuth = await getRequestBearerAuth();
    if (bearerAuth.attempted && !bearerAuth.uid) {
      return NextResponse.json(
        { error: bearerAuth.error || 'Invalid or expired bearer token' },
        { status: 401 }
      );
    }

    const authenticatedUser = bearerAuth.uid
      ? await firebaseAdmin.auth().getUser(bearerAuth.uid)
      : null;

    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const authenticatedEmail = authenticatedUser?.email?.trim().toLowerCase() || '';
    const userEmail = authenticatedEmail || (normalizedEmail.length > 0 ? normalizedEmail : null);

    const responseKeys = responses ? Object.keys(responses).sort() : [];
    if (
      !responses
      || responseKeys.length !== 7
      || responseKeys.some((key, index) => key !== String(index + 1))
    ) {
      return NextResponse.json(
        { error: 'All 7 state questions must be answered' },
        { status: 400 }
      );
    }

    // Validate all responses are between 1-5
    for (const value of Object.values(responses)) {
      if (typeof value !== 'number' || value < 1 || value > 5) {
        return NextResponse.json(
          { error: 'All responses must be a number between 1 and 5' },
          { status: 400 }
        );
      }
    }

    // Validate identity responses if provided
    if (identityResponses && identityResponses.length !== 5) {
      return NextResponse.json(
        { error: 'All 5 identity questions must be answered' },
        { status: 400 }
      );
    }
    if (identityResponses?.some((answer) => !['A', 'B', 'C', 'D', 'E'].includes(answer))) {
      return NextResponse.json(
        { error: 'Identity responses must use the supported answer choices' },
        { status: 400 }
      );
    }

    // Calculate scores
    const scores = calculateDimensionScores(responses);
    const { summary, detail, nextStep } = generateSummary(scores);

    // Calculate identity type if identity responses provided
    let identityType = undefined;
    let identityCounts = undefined;
    if (identityResponses && identityResponses.length === 5) {
      const identityResult = calculateIdentityType(identityResponses);
      identityType = identityResult.identityType;
      identityCounts = identityResult.identityCounts;
    }

    // Store in clarityCheckSubmissions collection for founder intake
    let submissionDocId = '';
    try {
      const submissionData: Record<string, unknown> = {
        email: userEmail,
        responses,
        scores,
        resultSummary: summary,
        resultDetail: detail,
        nextStep,
        source: 'clarity_check',
        status: 'submitted',
        createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      };

      if (bearerAuth.uid) submissionData.uid = bearerAuth.uid;

      // Add identity fields if available
      if (identityType) {
        submissionData.identityType = identityType;
        submissionData.identityCounts = identityCounts;
        submissionData.identityResponses = identityResponses;
      }

      const db = firebaseAdmin.firestore();
      const docRef = db.collection('clarityCheckSubmissions').doc();

      if (bearerAuth.uid && identityType) {
        const userRef = db.collection('users').doc(bearerAuth.uid);
        await db.runTransaction(async (transaction) => {
          const userDocument = await transaction.get(userRef);
          const userData = userDocument.data() || {};
          const onboarding = userData.compassOnboarding
            && typeof userData.compassOnboarding === 'object'
            ? userData.compassOnboarding as Record<string, unknown>
            : {};
          const shouldKeepOnboardingPartial = body.onboarding === true
            && onboarding.status !== 'complete'
            && (onboarding.status === 'in_progress' || !userData.archetypePrimary);

          transaction.set(docRef, submissionData);
          transaction.set(
            userRef,
            {
              archetypePrimary: identityType,
              archetypeSecondary: null,
              archetypeSource: 'clarity_check',
              archetypeUpdatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
              ...(shouldKeepOnboardingPartial ? {
                compassOnboarding: {
                  ...onboarding,
                  status: 'in_progress',
                  currentStep: 14,
                  claritySubmissionId: docRef.id,
                  updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
                },
              } : {}),
              updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
        });
      } else {
        await docRef.set(submissionData);
      }
      submissionDocId = docRef.id;
      console.log('Clarity check submission stored:', { id: submissionDocId, email: userEmail ?? 'not_provided', identityType });

      // Preserve the legacy public-web sync as fill-if-empty. Authenticated
      // native submissions use the verified UID transaction above and may
      // intentionally update the archetype on a fresh retake.
      if (!bearerAuth.uid && identityType && userEmail) {
        try {
          // Find user by email
          const usersSnapshot = await firebaseAdmin
            .firestore()
            .collection('users')
            .where('email', '==', userEmail)
            .limit(1)
            .get();

          if (!usersSnapshot.empty) {
            const userDoc = usersSnapshot.docs[0];
            const userData = userDoc.data();
            
            // Only update if archetypePrimary is not already set
            // (preserves existing archetype if user retakes Clarity Check)
            if (!userData.archetypePrimary) {
              await userDoc.ref.update({
                archetypePrimary: identityType,
                archetypeSecondary: null,
                archetypeSource: 'clarity_check',
                archetypeUpdatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
              });
              console.log('Synced identityType to user profile:', { uid: userDoc.id, archetypePrimary: identityType });
            }
          }
        } catch (syncError) {
          console.error('Failed to sync identityType to user profile:', syncError);
          // Don't fail the whole submission if profile sync fails
        }
      }
    } catch (firestoreError) {
      console.error('Firestore error storing submission:', firestoreError);
      // The public website historically returns the calculated result when
      // intake storage is unavailable. Native onboarding cannot do that: its
      // verified profile/archetype write is part of the completion contract.
      if (bearerAuth.uid) {
        return NextResponse.json(
          { error: 'Failed to save Clarity Check' },
          { status: 500 }
        );
      }
    }

    // Always notify founder on every quiz completion (step 1)
    // Email may be unknown at this stage — that's fine, we label it clearly
    try {
      await sendFounderNotification({
        submissionId: submissionDocId,
        scores,
        resultSummary: summary,
        email: userEmail,
        name: null,
        identityType: identityType ?? null,
        stage: 'quiz_completed',
      });
    } catch (notifyError) {
      console.error('Founder notification failed (non-blocking):', notifyError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Clarity check submitted',
        scores,
        resultSummary: summary,
        resultDetail: detail,
        nextStep,
        identityType,
        identityCounts,
        submissionId: submissionDocId,
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

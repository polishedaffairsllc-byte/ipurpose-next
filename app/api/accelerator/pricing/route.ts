import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { getEnrollableCohort } from '@/lib/accelerator/stages';

export const dynamic = 'force-dynamic';

const EARLY_BIRD_SEATS = 4;
const REGULAR_PRICE = 1997;
const EARLY_BIRD_PRICE = 1497;

export async function GET() {
  try {
    const cohort = getEnrollableCohort();
    const earlyBirdPriceId = process.env.STRIPE_PRICE_ID_ACCELERATOR_EARLY_BIRD;

    if (!earlyBirdPriceId) {
      // Early bird not configured — always use regular price
      return NextResponse.json({
        isEarlyBird: false,
        price: REGULAR_PRICE,
        seatsRemaining: 0,
        totalEarlyBirdSeats: EARLY_BIRD_SEATS,
        cohortId: cohort.id,
      });
    }

    const db = firebaseAdmin.firestore();
    const snap = await db
      .collection('enrollments')
      .where('product', '==', 'accelerator')
      .where('cohort', '==', cohort.id)
      .count()
      .get();

    const enrolledCount = snap.data().count;
    const seatsRemaining = Math.max(0, EARLY_BIRD_SEATS - enrolledCount);
    const isEarlyBird = seatsRemaining > 0;

    return NextResponse.json({
      isEarlyBird,
      price: isEarlyBird ? EARLY_BIRD_PRICE : REGULAR_PRICE,
      seatsRemaining,
      totalEarlyBirdSeats: EARLY_BIRD_SEATS,
      cohortId: cohort.id,
    });
  } catch (err) {
    console.error('[Accelerator Pricing] Error:', err);
    // Fail safe: return regular price
    return NextResponse.json({
      isEarlyBird: false,
      price: REGULAR_PRICE,
      seatsRemaining: 0,
      totalEarlyBirdSeats: EARLY_BIRD_SEATS,
    });
  }
}

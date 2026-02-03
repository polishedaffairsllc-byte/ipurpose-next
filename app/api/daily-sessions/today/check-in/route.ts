/**
 * POST /api/daily-sessions/today/check-in
 * Adds a check-in to today's session
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { getTodayDateString } from '@/lib/types/dailySession';
import type { DailySessionCheckIn } from '@/lib/types/dailySession';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('FirebaseSession')?.value;

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const userId = decoded.uid;
    const today = getTodayDateString();

    const body = await request.json();

    // Validate request body
    if (!Array.isArray(body.emotions) || typeof body.alignmentScore !== 'number') {
      return NextResponse.json(
        { error: 'Invalid check-in data' },
        { status: 400 }
      );
    }

    const docRef = firebaseAdmin
      .firestore()
      .collection('users')
      .doc(userId)
      .collection('dailySessions')
      .doc(today);

    // Check if session is locked
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      const sessionData = docSnap.data();
      if (sessionData.isLocked) {
        return NextResponse.json(
          { error: 'Session is locked' },
          { status: 403 }
        );
      }
    }

    // Create check-in object
    const checkIn: DailySessionCheckIn = {
      id: firebaseAdmin.firestore().collection('_').doc().id,
      emotions: body.emotions,
      alignmentScore: body.alignmentScore,
      need: body.need || '',
      type: 'daily',
      recordedAt: new Date().toISOString(),
    };

    // Add to session's checkIns array
    await docRef.update({
      checkIns: firebaseAdmin.firestore.FieldValue.arrayUnion(checkIn),
      updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    });

    const updatedSnap = await docRef.get();

    return NextResponse.json({
      success: true,
      data: updatedSnap.data(),
    });
  } catch (error) {
    console.error('Check-in POST error:', error);
    return NextResponse.json(
      { error: 'Failed to add check-in' },
      { status: 500 }
    );
  }
}

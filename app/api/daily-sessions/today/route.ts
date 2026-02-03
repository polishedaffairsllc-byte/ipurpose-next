/**
 * GET /api/daily-sessions/today
 * Returns today's daily session (creates if doesn't exist)
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { getTodayDateString, createEmptyDailySession } from '@/lib/types/dailySession';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('FirebaseSession')?.value;

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const userId = decoded.uid;
    const today = getTodayDateString();

    // Try to get existing session
    const docRef = firebaseAdmin
      .firestore()
      .collection('users')
      .doc(userId)
      .collection('dailySessions')
      .doc(today);

    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return NextResponse.json({
        success: true,
        data: docSnap.data(),
      });
    }

    // Create new session for today
    const emptySession = createEmptyDailySession(userId, today);
    const now = firebaseAdmin.firestore.FieldValue.serverTimestamp();

    await docRef.set({
      ...emptySession,
      createdAt: now,
      updatedAt: now,
    });

    const newDocSnap = await docRef.get();

    return NextResponse.json({
      success: true,
      data: newDocSnap.data(),
    });
  } catch (error) {
    console.error('Today session GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch today session' },
      { status: 500 }
    );
  }
}

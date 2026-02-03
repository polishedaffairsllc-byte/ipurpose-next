/**
 * POST /api/daily-sessions/today/lock
 * Locks today's session (makes it read-only)
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { getTodayDateString } from '@/lib/types/dailySession';

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

    const docRef = firebaseAdmin
      .firestore()
      .collection('users')
      .doc(userId)
      .collection('dailySessions')
      .doc(today);

    // Lock the session
    await docRef.update({
      isLocked: true,
      lockedAt: new Date().toISOString(),
      updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    });

    const updatedSnap = await docRef.get();

    return NextResponse.json({
      success: true,
      message: "Today's session is saved.",
      data: updatedSnap.data(),
    });
  } catch (error) {
    console.error('Session lock POST error:', error);
    return NextResponse.json(
      { error: 'Failed to lock session' },
      { status: 500 }
    );
  }
}

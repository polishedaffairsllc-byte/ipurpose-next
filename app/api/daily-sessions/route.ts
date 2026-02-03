/**
 * GET /api/daily-sessions
 * Returns all daily sessions for the authenticated user
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebaseAdmin';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('FirebaseSession')?.value;

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const userId = decoded.uid;

    // Get all daily sessions, ordered by date descending
    const snapshot = await firebaseAdmin
      .firestore()
      .collection('users')
      .doc(userId)
      .collection('dailySessions')
      .orderBy('date', 'desc')
      .get();

    const sessions = snapshot.docs.map(doc => doc.data());

    return NextResponse.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error('Daily sessions GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily sessions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/daily-sessions/today/lab-entry
 * Adds a lab entry to today's session
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { getTodayDateString } from '@/lib/types/dailySession';
import type { DailySessionLabEntry } from '@/lib/types/dailySession';

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
    if (!body.labId || !body.labName) {
      return NextResponse.json(
        { error: 'Missing labId or labName' },
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
      if (sessionData && sessionData.isLocked) {
        return NextResponse.json(
          { error: 'Session is locked' },
          { status: 403 }
        );
      }
    }

    // Create lab entry object
    const labEntry: DailySessionLabEntry = {
      labId: body.labId,
      labName: body.labName,
      status: body.status || 'in_progress',
      content: body.content || {},
      notes: body.notes || '',
      recordedAt: new Date().toISOString(),
    };

    // Add to session's labEntries array
    await docRef.update({
      labEntries: firebaseAdmin.firestore.FieldValue.arrayUnion(labEntry),
      updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    });

    const updatedSnap = await docRef.get();

    return NextResponse.json({
      success: true,
      data: updatedSnap.data(),
    });
  } catch (error) {
    console.error('Lab entry POST error:', error);
    return NextResponse.json(
      { error: 'Failed to add lab entry' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/daily-sessions/today/lab-entry/[labId]
 * Updates a lab entry in today's session
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { getTodayDateString } from '@/lib/types/dailySession';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ labId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('FirebaseSession')?.value;

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const userId = decoded.uid;
    const today = getTodayDateString();
    const { labId } = await params;

    const body = await request.json();

    const docRef = firebaseAdmin
      .firestore()
      .collection('users')
      .doc(userId)
      .collection('dailySessions')
      .doc(today);

    // Check if session is locked
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const sessionData = docSnap.data();
    if (sessionData.isLocked) {
      return NextResponse.json(
        { error: 'Session is locked' },
        { status: 403 }
      );
    }

    // Find and update the lab entry
    const labEntries = sessionData.labEntries || [];
    const index = labEntries.findIndex((entry: any) => entry.labId === labId);

    if (index === -1) {
      return NextResponse.json(
        { error: 'Lab entry not found' },
        { status: 404 }
      );
    }

    // Update the entry
    const updatedEntry = {
      ...labEntries[index],
      ...body,
      labId, // Ensure labId doesn't change
    };

    labEntries[index] = updatedEntry;

    // Update session
    await docRef.update({
      labEntries,
      updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    });

    const updatedSnap = await docRef.get();

    return NextResponse.json({
      success: true,
      data: updatedSnap.data(),
    });
  } catch (error) {
    console.error('Lab entry PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update lab entry' },
      { status: 500 }
    );
  }
}

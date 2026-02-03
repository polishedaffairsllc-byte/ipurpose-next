/**
 * POST /api/daily-sessions/today/reflection
 * Adds a reflection to today's session
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { getTodayDateString } from '@/lib/types/dailySession';
import type { DailySessionReflection } from '@/lib/types/dailySession';

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
    if (!body.type || !body.summary) {
      return NextResponse.json(
        { error: 'Missing type or summary' },
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

    // Create reflection object
    const reflection: DailySessionReflection = {
      id: firebaseAdmin.firestore().collection('_').doc().id,
      type: body.type,
      labId: body.labId,
      labName: body.labName,
      summary: body.summary,
      fields: body.fields || {},
      recordedAt: new Date().toISOString(),
    };

    // Add to session's reflections array
    await docRef.update({
      reflections: firebaseAdmin.firestore.FieldValue.arrayUnion(reflection),
      updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    });

    const updatedSnap = await docRef.get();

    return NextResponse.json({
      success: true,
      data: updatedSnap.data(),
    });
  } catch (error) {
    console.error('Reflection POST error:', error);
    return NextResponse.json(
      { error: 'Failed to add reflection' },
      { status: 500 }
    );
  }
}

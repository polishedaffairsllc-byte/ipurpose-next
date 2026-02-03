import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { requireUid } from '@/lib/firebase/requireUser';

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const uid = await requireUid();
    
    // TODO: Add proper founder verification
    
    const db = firebaseAdmin.firestore();
    const snapshot = await db
      .collection('infoSessionRegistrations')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    const registrations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      ok: true,
      data: registrations,
    });
  } catch (error) {
    console.error('Error fetching info session registrations:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}

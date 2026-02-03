import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { requireUid } from '@/lib/firebase/requireUser';
import { deriveFounderContext } from '@/lib/isFounder';

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const uid = await requireUid();
    
    // Check founder status
    const db = firebaseAdmin.firestore();
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();
    
    const founderContext = deriveFounderContext(null, userData);
    
    if (!founderContext.isFounder) {
      return NextResponse.json(
        { ok: false, error: 'Founder access required' },
        { status: 403 }
      );
    }
    
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
    const status = (error as { status?: number }).status || 500;
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch registrations' },
      { status }
    );
  }
}

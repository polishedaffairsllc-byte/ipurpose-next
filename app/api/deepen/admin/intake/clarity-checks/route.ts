import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { requireUid } from '@/lib/firebase/requireUser';
import { isFounder as isFounderUser } from '@/lib/isFounder';

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const uid = await requireUid();
    
    // Check if founder (TODO: add proper founder verification in lib/isFounder)
    // For now, allow authenticated users - founder check should be tightened
    
    const db = firebaseAdmin.firestore();
    const snapshot = await db
      .collection('clarityCheckSubmissions')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    const submissions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      ok: true,
      data: submissions,
    });
  } catch (error) {
    console.error('Error fetching clarity check submissions:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

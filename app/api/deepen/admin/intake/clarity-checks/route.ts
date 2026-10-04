import { isQuestionnaire } from '@/lib/clarity/submissionType';
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
    
    const query = db.collection('clarityCheckSubmissions').orderBy('createdAt', 'desc');
    let page = query.limit(100);
    const submissions: Record<string, unknown>[] = [];
    while (submissions.length < 100) {
      const snapshot = await page.get();
      for (const doc of snapshot.docs) {
        if (isQuestionnaire(doc.data())) submissions.push({ ...doc.data(), id: doc.id, type: 'questionnaire' });
        if (submissions.length === 100) break;
      }
      if (snapshot.size < 100) break;
      page = query.startAfter(snapshot.docs[snapshot.size - 1]).limit(100);
    }

    return NextResponse.json({
      ok: true,
      data: submissions,
    });
  } catch (error) {
    console.error('Error fetching clarity check submissions:', error);
    const status = (error as { status?: number }).status || 500;
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch submissions' },
      { status }
    );
  }
}

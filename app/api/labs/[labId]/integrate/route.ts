import { NextRequest, NextResponse } from 'next/server';
import { requireUid } from '@/lib/firebase/requireUser';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * POST /api/labs/[labId]/integrate
 * Saves lab snapshot to Reflections collection
 * Body: { labId, summary, fields }
 * Returns: { success, reflectionId, message }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ labId: string }> }
) {
  try {
    const uid = await requireUid();
    const { labId } = await params;
    const { summary, fields } = await req.json();

    if (!summary || !fields) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save to Reflections collection
    const reflectionsRef = collection(db, `users/${uid}/reflections`);
    const docRef = await addDoc(reflectionsRef, {
      labId: labId,
      labName: getLabDisplayName(labId),
      summary,
      fields,
      integratedAt: serverTimestamp(),
      type: 'lab-integration',
    });

    return NextResponse.json({
      success: true,
      reflectionId: docRef.id,
      message: `${getLabDisplayName(labId)} integrated. You'll find it in Reflections.`,
    });
  } catch (error) {
    console.error('Error integrating lab:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Integration failed' }, { status: 500 });
  }
}

function getLabDisplayName(labId: string): string {
  const names: Record<string, string> = {
    identity: 'Identity Lab',
    meaning: 'Meaning Lab',
    agency: 'Agency Lab',
  };
  return names[labId] || 'Lab';
}

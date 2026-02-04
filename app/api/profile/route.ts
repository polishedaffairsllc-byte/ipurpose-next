import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { firebaseAdmin } from '@/lib/firebaseAdmin';

function getRequestContext(request: NextRequest) {
  return {
    ip: request.headers.get('x-forwarded-for')?.split(',')[0] || null,
  };
}

async function getUserId(request: NextRequest): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get('FirebaseSession')?.value ?? null;

  if (session) {
    try {
      const decodedClaims = await firebaseAdmin.auth().verifySessionCookie(session, true);
      return decodedClaims.uid;
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * GET /api/profile
 * Fetch user's profile data (displayName, photoURL)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = firebaseAdmin.firestore();
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json({
        displayName: '',
        photoURL: null,
      });
    }

    const data = userDoc.data() || {};
    return NextResponse.json({
      displayName: data.displayName || '',
      photoURL: data.photoURL || null,
      email: data.email || '',
    });
  } catch (error) {
    console.error('GET /api/profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/profile
 * Update user's profile (displayName and optional photo)
 * Expects FormData with:
 * - displayName: string
 * - photo?: File
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const displayName = formData.get('displayName') as string;
    const photoFile = formData.get('photo') as File | null;

    if (!displayName || displayName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Display name is required' },
        { status: 400 }
      );
    }

    const db = firebaseAdmin.firestore();
    const updateData: any = {
      displayName: displayName.trim(),
      updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    };

    let photoURL: string | null = null;

    // Handle photo upload if provided
    if (photoFile) {
      try {
        // Upload to Firebase Storage
        const bucket = firebaseAdmin.storage().bucket();
        const fileName = `profiles/${userId}/photo-${Date.now()}`;
        const file = bucket.file(fileName);

        const buffer = Buffer.from(await photoFile.arrayBuffer());
        await file.save(buffer, {
          metadata: {
            contentType: photoFile.type,
          },
        });

        // Make file public and get download URL
        await file.makePublic();
        photoURL = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        updateData.photoURL = photoURL;
      } catch (storageError) {
        console.error('Photo upload error:', storageError);
        return NextResponse.json(
          { error: 'Failed to upload photo' },
          { status: 500 }
        );
      }
    }

    // Update user document
    await db.collection('users').doc(userId).set(updateData, { merge: true });

    // Also update Firebase Auth displayName
    try {
      await firebaseAdmin.auth().updateUser(userId, {
        displayName: displayName.trim(),
      });
    } catch (authError) {
      console.error('Auth update error:', authError);
    }

    return NextResponse.json({
      ok: true,
      displayName: displayName.trim(),
      photoURL: photoURL,
    });
  } catch (error) {
    console.error('POST /api/profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

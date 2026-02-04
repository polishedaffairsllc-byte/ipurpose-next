import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { cookies } from 'next/headers';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('FirebaseSession')?.value;

    if (!session) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decodedClaims = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const uid = decodedClaims.uid;

    // Parse form data
    const formData = await request.formData();
    const displayName = formData.get('displayName') as string;
    const photoFile = formData.get('photo') as File | null;

    if (!displayName || displayName.trim().length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Display name is required' },
        { status: 400 }
      );
    }

    let photoURL: string | null = null;

    // Upload photo to Firebase Storage if provided
    if (photoFile) {
      if (photoFile.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { ok: false, error: 'Photo size exceeds 5MB' },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await photoFile.arrayBuffer());
      const bucket = firebaseAdmin.storage().bucket();
      const filename = `profile-photos/${uid}/${Date.now()}-${photoFile.name}`;
      const file = bucket.file(filename);

      // Upload file
      await file.save(buffer, {
        metadata: {
          contentType: photoFile.type,
        },
      });

      // Get public URL
      await file.makePublic();
      photoURL = `https://storage.googleapis.com/${bucket.name}/${filename}`;
    }

    // Update Firestore
    const db = firebaseAdmin.firestore();
    const updateData: any = {
      displayName: displayName.trim(),
      updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    };

    if (photoURL) {
      updateData.photoURL = photoURL;
    }

    await db.collection('users').doc(uid).set(updateData, { merge: true });

    // Also update Firebase Auth displayName if changed
    await firebaseAdmin.auth().updateUser(uid, {
      displayName: displayName.trim(),
    });

    return NextResponse.json({
      ok: true,
      profile: {
        displayName: displayName.trim(),
        photoURL,
        email: decodedClaims.email || '',
      },
    });
  } catch (error) {
    console.error('Profile UPDATE error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

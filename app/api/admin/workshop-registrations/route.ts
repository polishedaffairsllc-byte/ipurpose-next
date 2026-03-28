import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebaseAdmin';

const ADMIN_TOKEN = process.env.ADMIN_SECRET_TOKEN;

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  if (!ADMIN_TOKEN || auth !== `Bearer ${ADMIN_TOKEN}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = firebaseAdmin.firestore();
  const snap = await db.collection('leads').where('source', '==', 'workshop').orderBy('createdAt', 'desc').get();

  if (snap.empty) {
    return NextResponse.json({ count: 0, registrations: [] });
  }

  const registrations = snap.docs.map(doc => {
    const d = doc.data();
    return {
      email: d.email,
      name: d.firstName || d.name || null,
      session: d.session || (d.context?.session) || null,
      createdAt: d.createdAt?.toDate?.()?.toISOString() ?? d.createdAt ?? null,
    };
  });

  return NextResponse.json({ count: registrations.length, registrations });
}

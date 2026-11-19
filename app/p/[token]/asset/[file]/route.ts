import type { NextRequest } from 'next/server';
import { resolveUniversityLink } from '@/lib/universities/links';
import { ASSET_COLLECTION, PRIVATE_ASSET_HEADERS, privatePresentation } from '@/lib/universities/presentations';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(_request: NextRequest, context: { params: Promise<{ token: string; file: string }> }) {
  const unavailable = () => new Response(null, { status: 404, headers: PRIVATE_ASSET_HEADERS });
  const { token, file } = await context.params;
  if (!/^slide-0[1-8](?:-(?:1280|1920))?\.webp$/.test(file)) return unavailable();
  const { firebaseAdmin } = await import('@/lib/firebaseAdmin'); const db = firebaseAdmin.firestore();
  const link = await resolveUniversityLink(db, token); if (!link) return unavailable();
  const deck = await privatePresentation(db, link); const asset = deck?.assets[file]; if (!asset) return unavailable();
  const data = (await db.collection(ASSET_COLLECTION).doc(asset.id).get()).data();
  if (!data || data.sha256 !== asset.sha256 || data.environment !== 'preview' || !Buffer.isBuffer(data.bytes)) return unavailable();
  return new Response(new Uint8Array(data.bytes), { headers: { ...PRIVATE_ASSET_HEADERS, 'Content-Type': 'image/webp', 'Content-Length': String(data.bytes.length) } });
}

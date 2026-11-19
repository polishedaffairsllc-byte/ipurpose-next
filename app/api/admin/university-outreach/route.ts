import { outreachAdminHandler } from '@/lib/outreach/http';
import { universityReview } from '@/lib/universities/review';
import { universityPreviewEnabled } from '@/lib/universities/links';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  if (!universityPreviewEnabled()) return new Response(null, { status: 404, headers: { 'Cache-Control': 'private, no-store' } });
  return outreachAdminHandler(async () => {
    const { firebaseAdmin } = await import('@/lib/firebaseAdmin');
    return { auth: firebaseAdmin.auth(), read: () => universityReview(firebaseAdmin.firestore(), new URL(request.url).origin) };
  })(request);
}

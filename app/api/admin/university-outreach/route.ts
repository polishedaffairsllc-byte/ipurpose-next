import { outreachAdminHandler } from '@/lib/outreach/http';
import { universityReview } from '@/lib/universities/review';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  return outreachAdminHandler(async () => {
    const { firebaseAdmin } = await import('@/lib/firebaseAdmin');
    return { auth: firebaseAdmin.auth(), read: () => universityReview(firebaseAdmin.firestore(), new URL(request.url).origin) };
  })(request);
}

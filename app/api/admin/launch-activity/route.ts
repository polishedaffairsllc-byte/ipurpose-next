import { activityHandler } from '@/lib/admin-activity/http';
import { createActivityService } from '@/lib/admin-activity/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
const handler = activityHandler(async () => {
  const { firebaseAdmin } = await import('@/lib/firebaseAdmin');
  const auth = firebaseAdmin.auth();
  return { auth, service: createActivityService(firebaseAdmin.firestore(), auth) };
});
export const GET = handler;
export const POST = handler;

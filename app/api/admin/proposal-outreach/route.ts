import { outreachAdminHandler } from '@/lib/outreach/http';
import { readOutreach } from '@/lib/outreach/service';
import { getOutreachHistory } from '@/lib/outreach/history';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const GET = outreachAdminHandler(async () => {
  const { firebaseAdmin } = await import('@/lib/firebaseAdmin');
  return { auth: firebaseAdmin.auth(), read: async filters => ({
    ...await readOutreach(firebaseAdmin.firestore(), filters), historical: await getOutreachHistory(),
  }) };
});

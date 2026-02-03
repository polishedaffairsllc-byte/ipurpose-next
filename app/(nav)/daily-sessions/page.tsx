import { redirect } from 'next/navigation';
import { checkEntitlement } from '@/lib/entitlementCheck';
import DailySessionHistory from '@/app/components/DailySessionHistory';

export default async function SessionHistoryPage() {
  const entitlement = await checkEntitlement();

  if (!entitlement.uid) {
    redirect('/login');
  }

  return (
    <div className="container max-w-6xl mx-auto px-6 md:px-10 py-10">
      <div className="mb-10">
        <h1 className="text-4xl font-semibold text-warmCharcoal mb-2">
          Your Daily Sessions
        </h1>
        <p className="text-sm text-warmCharcoal/70">
          Review, print, or export your daily check-ins, lab work, and reflections.
        </p>
      </div>

      <DailySessionHistory />
    </div>
  );
}

import type { Metadata } from 'next';
import UserActivityDashboard from '../launch-metrics/UserActivityDashboard';

export const metadata: Metadata = {
  title: 'User Activity | iPurpose',
  robots: { index: false, follow: false },
};

export default function UserActivityPage() {
  return <main className="mx-auto min-h-screen max-w-[1500px] space-y-6 bg-[#F5F7FA] px-4 py-8 text-[#25283D] sm:px-6 lg:px-8">
    <a className="underline" href="/admin/launch-metrics">← Launch Metrics</a>
    <header>
      <p className="text-sm uppercase tracking-widest">iPurpose · Administration</p>
      <h1 className="mt-2 text-4xl font-italiana">User Activity &amp; Support</h1>
      <p className="mt-2 max-w-4xl text-sm">Use this view to confirm registration, sign-in timing, platform, Compass participation, and session history when troubleshooting a user.</p>
    </header>
    <UserActivityDashboard />
  </main>;
}

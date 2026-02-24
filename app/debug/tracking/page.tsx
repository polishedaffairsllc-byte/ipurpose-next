import DebugTrackingClient from './DebugTrackingClient';

// Public page - no auth required
export const metadata = {
  title: 'Debug: Tracking',
  robots: 'noindex, nofollow', // Prevent search indexing
};

export default function DebugTrackingPage() {
  return <DebugTrackingClient />;
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetProgressButton() {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/accelerator/progress/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        setConfirmed(false);
        setTimeout(() => {
          router.refresh();
        }, 500);
      }
    } catch (err) {
      console.error('Failed to reset progress:', err);
    } finally {
      setLoading(false);
    }
  };

  if (confirmed) {
    return (
      <div className="flex gap-3">
        <button
          onClick={handleReset}
          disabled={loading}
          className="px-4 py-2 rounded-lg font-marcellus text-white text-sm bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Resetting...' : 'Confirm Reset All'}
        </button>
        <button
          onClick={() => setConfirmed(false)}
          disabled={loading}
          className="px-4 py-2 rounded-lg font-marcellus text-warmCharcoal/60 text-sm bg-warmCharcoal/5 hover:bg-warmCharcoal/10 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleReset}
      className="px-4 py-2 rounded-lg font-marcellus text-warmCharcoal/40 text-sm hover:text-warmCharcoal/60 transition-colors hover:underline"
    >
      ↻ Reset Progress (Testing Only)
    </button>
  );
}

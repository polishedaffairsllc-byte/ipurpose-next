'use client';

import { useState } from 'react';

interface WeekCompleteButtonProps {
  week: number;
  isCompleted: boolean;
}

export default function WeekCompleteButton({ week, isCompleted }: WeekCompleteButtonProps) {
  const [completed, setCompleted] = useState(isCompleted);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/accelerator/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ week, completed: !completed }),
      });
      if (res.ok) {
        setCompleted(!completed);
      }
    } catch (err) {
      console.error('Failed to update progress:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`w-full px-6 py-4 rounded-2xl font-marcellus text-center transition-all duration-300 ${
        completed
          ? 'bg-green-50 text-green-700 border-2 border-green-200'
          : 'bg-warmCharcoal/5 text-warmCharcoal/60 border-2 border-warmCharcoal/10 hover:border-warmCharcoal/30'
      } disabled:opacity-50`}
      style={{ fontSize: '16px' }}
    >
      {loading
        ? 'Saving...'
        : completed
        ? '✓ Week Complete — Well Done'
        : 'Mark This Week Complete'}
    </button>
  );
}

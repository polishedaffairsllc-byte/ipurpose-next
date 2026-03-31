'use client';

import { useState } from 'react';
import { getEnrollableCohort } from '@/lib/accelerator/stages';
import { trackBeginCheckout } from '@/lib/analytics';
import { trackInitiateCheckout } from '@/lib/meta-pixel';

interface AcceleratorEnrollButtonProps {
  price: number;
  isEarlyBird: boolean;
  isSoldOut?: boolean;
  className?: string;
  label?: string;
}

export default function AcceleratorEnrollButton({
  price,
  isEarlyBird,
  isSoldOut = false,
  className = '',
  label = 'Claim Your Seat',
}: AcceleratorEnrollButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnroll = async () => {
    if (isSoldOut) return;
    setLoading(true);
    setError(null);

    try {
      const cohort = getEnrollableCohort();

      trackBeginCheckout({
        value: price,
        currency: 'USD',
        items: [
          {
            item_id: `accelerator_${cohort.id}`,
            item_name: `Accelerator ${cohort.label}${isEarlyBird ? ' (Early Bird)' : ''}`,
            price,
            quantity: 1,
          },
        ],
      });

      trackInitiateCheckout('Accelerator', price, 'USD');

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: 'accelerator', cohort: cohort.id }),
      });

      if (!response.ok) throw new Error('Failed to create checkout session');

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err: any) {
      console.error('Enrollment error:', err);
      setError(err.message || 'Failed to start enrollment');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleEnroll}
        disabled={loading || isSoldOut}
        className={className}
      >
        {loading ? 'Starting Enrollment…' : isSoldOut ? 'Sold Out' : label}
      </button>
      {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { getEnrollableCohort } from '@/lib/accelerator/stages';
import { trackEvent, trackBeginCheckout } from '@/lib/analytics';
import { trackInitiateCheckout } from '@/lib/meta-pixel';

interface ProgramEnrollButtonProps {
  /** Current checkout price in USD (early bird or regular) */
  price?: number;
  /** Whether early bird pricing is active */
  isEarlyBird?: boolean;
}

export default function ProgramEnrollButton({ price = 1997, isEarlyBird = false }: ProgramEnrollButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnroll = async () => {
    setLoading(true);
    setError(null);

    try {
      const cohort = getEnrollableCohort();
      
      // GA4: Standard begin_checkout event
      trackBeginCheckout({
        value: price,
        currency: 'USD',
        items: [
          {
            item_id: `accelerator_${cohort.id}`,
            item_name: `Accelerator ${cohort.label}${isEarlyBird ? ' (Early Bird)' : ''}`,
            price: price,
            quantity: 1,
          },
        ],
      });

      // Meta Pixel event
      trackInitiateCheckout('Accelerator', price, 'USD');

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: 'accelerator',
          cohort: cohort.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

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
        disabled={loading}
        className="text-body px-8 py-4 rounded-full text-white text-center hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(to right, #5B4BA6, rgba(91, 75, 166, 0))' }}
      >
        {loading ? 'Starting Enrollment...' : 'Enroll Now'}
      </button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

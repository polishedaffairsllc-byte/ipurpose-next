'use client';

import { useState } from 'react';
import { getEnrollableCohort } from '@/lib/accelerator/stages';
import { trackEvent, trackBeginCheckout } from '@/lib/analytics';
import { trackInitiateCheckout } from '@/lib/meta-pixel';

export default function ProgramEnrollButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnroll = async () => {
    setLoading(true);
    setError(null);

    try {
      const cohort = getEnrollableCohort();
      
      // GA4: Standard begin_checkout event
      trackBeginCheckout({
        value: 1497,
        currency: 'USD',
        items: [
          {
            item_id: `accelerator_${cohort.id}`,
            item_name: `Accelerator ${cohort.label}`,
            price: 1497,
            quantity: 1,
          },
        ],
      });

      // Meta Pixel event
      trackInitiateCheckout('Accelerator', 1497, 'USD');

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
    <button
      onClick={handleEnroll}
      disabled={loading}
      className="text-body px-8 py-4 rounded-full text-white text-center hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ background: 'linear-gradient(to right, #5B4BA6, rgba(91, 75, 166, 0))' }}
    >
      {loading ? 'Starting Enrollment...' : 'Enroll Now'}
    </button>
  );
}

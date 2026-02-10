'use client';

import { useState } from 'react';

export default function DeepenSubscribeButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: 'deepen_membership',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err: any) {
      console.error('Subscription error:', err);
      setError(err.message || 'Failed to start subscription');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="px-6 sm:px-8 py-3 sm:py-4 rounded-full font-marcellus text-white text-center hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0))', fontSize: '35px' }}
      >
        {loading ? 'Redirecting to Checkout...' : '✦ Subscribe & Unlock'}
      </button>
      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}
    </div>
  );
}

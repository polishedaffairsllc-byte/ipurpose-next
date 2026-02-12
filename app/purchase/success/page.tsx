'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type VerifyResult = {
  verified: boolean;
  sessionId?: string;
  email?: string;
  product?: string;
  error?: string;
};

export default function PurchaseSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id') || searchParams.get('sessionId');

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerifyResult | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setResult({ verified: false, error: 'Missing session_id in URL' });
      setLoading(false);
      return;
    }

    const verify = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/stripe/webhook/verify-session?session_id=${encodeURIComponent(sessionId)}`);
        const data = await res.json();
        setResult(data);
      } catch (err) {
        setResult({ verified: false, error: 'Failed to verify session' });
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [sessionId]);

  const starterUrl = process.env.NEXT_PUBLIC_STARTER_PACK_URL || '/starter-pack';

  return (
    <div className="max-w-3xl mx-auto py-20 px-6 text-center">
      <h1 className="text-3xl font-bold mb-4">Thanks for your purchase</h1>

      {loading && <p>Verifying your order…</p>}

      {!loading && result && !result.verified && (
        <div>
          <p className="mb-4">We couldn't verify your purchase.</p>
          <p className="text-sm text-gray-600">{result.error || 'Please check your email for confirmation.'}</p>
        </div>
      )}

      {!loading && result && result.verified && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Welcome to the Starter Pack</h2>
          <p className="mb-6">We've emailed your Starter Pack to <strong>{result.email}</strong>. You can also begin the Starter Pack workspace now.</p>

          <a
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md mr-3"
            href="/starter-pack"
          >
            Begin Starter Pack
          </a>

          <a
            className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md ml-3"
            href={starterUrl}
          >
            Download Materials
          </a>

          <p className="mt-6 text-sm text-gray-600">If you don't see the email, check your spam folder or reply to support.</p>
        </div>
      )}
    </div>
  );
}

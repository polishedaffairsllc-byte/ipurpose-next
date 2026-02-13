"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getFirebaseAuth } from '@/lib/firebaseClient';

type VerifyResult = {
  verified: boolean;
  sessionId?: string;
  email?: string;
  product?: string;
  error?: string;
};

// Map product keys to display names and destination paths
const PRODUCT_INFO: Record<string, { name: string; path: string }> = {
  'starter_pack':      { name: 'Starter Pack',      path: '/starter-pack' },
  'ai_blueprint':      { name: 'AI Blueprint',      path: '/ai-blueprint' },
  'accelerator':       { name: 'Accelerator',       path: '/accelerator' },
  'deepen_membership': { name: 'Deepen Membership', path: '/deepen' },
};

function getProductInfo(key?: string | null) {
  if (key && PRODUCT_INFO[key]) return PRODUCT_INFO[key];
  return { name: 'purchase', path: '/dashboard' };
}

export default function PurchaseSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id') || searchParams.get('sessionId');
  const productParam = searchParams.get('product');
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [authed, setAuthed] = useState(false);

  // Resolve product info from URL param first, then from verify result
  const resolvedProduct = result?.product || productParam;
  const { name: productName, path: productPath } = getProductInfo(resolvedProduct);

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

  // detect client auth state and redirect if already signed in
  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = auth.onAuthStateChanged((u) => {
      const signedIn = !!u;
      setAuthed(signedIn);
      if (signedIn) {
        router.replace(productPath);
      }
    });
    return () => unsub();
  }, [router, productPath]);

  return (
    <div className="relative z-10 max-w-3xl mx-auto py-20 px-6 text-center bg-white min-h-screen">
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
          <h2 className="text-2xl font-semibold mb-4">Your {productName} purchase is confirmed.</h2>

          {!authed && (
            <div>
              <p className="mb-4">Create an account or sign in to unlock access.</p>

              <div className="flex items-center justify-center gap-3 mb-4">
                <a
                  className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md"
                  href={`/login?next=${encodeURIComponent(productPath)}`}
                >
                  Sign in & claim
                </a>

                <a
                  className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-md"
                  href={`/signup?next=${encodeURIComponent(productPath)}`}
                >
                  Create account & claim
                </a>
              </div>

              <p className="text-sm text-gray-600">If you paid with <strong>{result.email}</strong>, sign in with that same email to claim access.</p>
            </div>
          )}

          {authed && (
            <div>
              <p className="mb-6">We've sent confirmation to <strong>{result.email}</strong>. You can access your {productName} now.</p>
              <a className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md" href={productPath}>Go to {productName}</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

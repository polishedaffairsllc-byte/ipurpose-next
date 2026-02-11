'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebaseClient';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import Link from 'next/link';

interface VerificationData {
  verified: boolean;
  sessionId?: string;
  customerId?: string;
  email?: string;
  product?: string;
  cohort?: string;
  cohortStartDate?: string;
  error?: string;
}

export default function CreateAccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [verification, setVerification] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifySession = async () => {
      if (!sessionId) {
        setVerification({ verified: false, error: 'Missing session ID' });
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/stripe/webhook/verify-session?session_id=${encodeURIComponent(sessionId)}`
        );
        const data = await response.json();
        setVerification(data);

        // Pre-fill email if available
        if (data.email) {
          setEmail(data.email);
        }
      } catch (err) {
        console.error('Verification error:', err);
        setVerification({
          verified: false,
          error: 'Failed to verify enrollment',
        });
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [sessionId]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitLoading(true);

    try {
      if (!verification?.verified || !verification?.sessionId) {
        throw new Error('Enrollment verification failed');
      }

      // Create Firebase account
      const auth = getFirebaseAuth();
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const user = credential.user;

      // Create session cookie
      const idToken = await user.getIdToken();
      const cookieRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ idToken }),
      });

      if (!cookieRes.ok) {
        throw new Error('Failed to create session');
      }

      // Write user document with entitlement
      // Note: This happens on the client, so we're calling an API endpoint
      const userRes = await fetch('/api/auth/create-user-with-entitlement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          uid: user.uid,
          email,
          sessionId: verification.sessionId,
          customerId: verification.customerId,
          product: verification.product,
          cohort: verification.cohort,
          cohortStartDate: verification.cohortStartDate,
        }),
      });

      if (!userRes.ok) {
        throw new Error('Failed to create user record');
      }

      // Redirect: accelerator buyers go to cohort registration,
      // all others go to dashboard
      if (verification.product === 'accelerator') {
        router.push('/accelerator/register');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Account creation error:', err);
      setError(err.message || 'Failed to create account');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="text-center">
          <p className="text-warmCharcoal/70">Verifying enrollment...</p>
        </div>
      </div>
    );
  }

  if (!verification?.verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div>
            <h1 className="text-3xl font-marcellus text-warmCharcoal mb-2">
              Enrollment Required
            </h1>
            <p className="text-warmCharcoal/70">
              {verification?.error || 'Invalid or expired enrollment session'}
            </p>
          </div>
          <div className="space-y-3">
            <Link
              href="/program"
              className="block px-6 py-3 bg-lavenderViolet text-white rounded-lg font-marcellus hover:bg-indigoDeep transition"
            >
              View Program
            </Link>
            <Link
              href="/clarity-check"
              className="block px-6 py-3 border-2 border-lavenderViolet text-lavenderViolet rounded-lg font-marcellus hover:bg-lavenderViolet/5 transition"
            >
              Take Clarity Check
            </Link>
            <Link
              href="/login"
              className="block px-6 py-3 border-2 border-warmCharcoal/20 text-warmCharcoal rounded-lg font-marcellus hover:bg-warmCharcoal/5 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-lavenderViolet/10 px-6">
      <div className="w-full max-w-md">
        <div className="ipurpose-glow-container">
          <div className="relative ipurpose-card px-6 py-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-marcellus text-warmCharcoal mb-2">
                Complete Your Account
              </h1>
              <p className="text-warmCharcoal/70 text-sm">
                Thank you for your enrollment. Create your account to get started.
              </p>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-warmCharcoal mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="ipurpose-input"
                  required
                  disabled={submitLoading}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-warmCharcoal mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="ipurpose-input"
                  required
                  disabled={submitLoading}
                  minLength={8}
                  placeholder="Minimum 8 characters"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitLoading}
                className="ipurpose-button-gradient w-full"
              >
                {submitLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center mt-6 text-xs text-warmCharcoal/60">
              Already have an account?{' '}
              <Link href="/login" className="text-lavenderViolet font-semibold hover:text-indigoDeep">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

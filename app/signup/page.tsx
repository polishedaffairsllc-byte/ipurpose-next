'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { getFirebaseAuth } from '@/lib/firebaseClient';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const search = useSearchParams();
  const nextParam = search.get('next') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      const credential = await createUserWithEmailAndPassword(auth, email, password);

      // Get idToken and create a server-side session cookie
      const idToken = await credential.user.getIdToken();
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || `Server responded with ${res.status}`);
      }

      // Brief pause for cookie processing
      await new Promise(resolve => setTimeout(resolve, 500));

      router.push(nextParam);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Try signing in instead.');
      } else {
        setError(err.message ?? 'Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Home Button */}
      <div className="w-full flex justify-start px-6 py-4 md:px-8 md:py-6">
        <a
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            paddingLeft: '1rem',
            paddingRight: '1rem',
            paddingTop: '0.5rem',
            paddingBottom: '0.5rem',
            borderRadius: '0.5rem',
            background: 'linear-gradient(135deg, #9C88FF 0%, #6B5B95 100%)',
            color: 'white',
            fontFamily: 'Marcellus, serif',
            fontSize: '0.875rem',
            fontWeight: '500',
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(156, 136, 255, 0.3)',
            transition: 'all 0.3s ease-in-out',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(156, 136, 255, 0.5)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(156, 136, 255, 0.3)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M4.5 10.5V19a2.5 2.5 0 002.5 2.5h2A2.5 2.5 0 0011.5 19v-3.5a2.5 2.5 0 012.5-2.5h0a2.5 2.5 0 012.5 2.5V19a2.5 2.5 0 002.5 2.5h2A2.5 2.5 0 0021 19v-8.5" />
          </svg>
          Home
        </a>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-lavenderViolet/10 via-transparent to-salmonPeach/10">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-16 sm:py-20 md:py-32">
          <section
            className="relative text-center space-y-4 sm:space-y-6 py-16 sm:py-24 px-4 sm:px-6 rounded-2xl overflow-hidden"
            style={{
              backgroundImage: 'url(/images/360_F_180837604_UyJZNTHPluIJNQJjmTkCpE4XLJ03Zott.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/50" />
            <h1 className="heading-hero mb-6 text-white relative z-10 text-3xl sm:text-4xl md:text-5xl lg:text-6xl" style={{ lineHeight: '1.2', paddingBottom: '0.5em' }}>
              Create Your Account
            </h1>
            <p className="text-white relative z-10 font-italiana px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-lg sm:text-2xl md:text-3xl" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', color: '#FFFFFF' }}>
              Your clarity journey starts here
            </p>
          </section>
        </div>
      </div>

      {/* Signup Form */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-white to-lavenderViolet/10 px-2 py-8">
        <div className="w-full max-w-md flex flex-col items-center justify-center">
          <div className="ipurpose-glow-container w-full">
            <div className="relative ipurpose-card px-4 py-6 md:px-6 md:py-7 flex flex-col items-center">
              <div className="text-center mb-4 w-full">
                <h2 className="heading-hero mb-1 text-2xl md:text-3xl" style={{ lineHeight: '1.2', paddingBottom: '0.5em' }}>Sign Up</h2>
                <p className="font-marcellus text-warmCharcoal/70 text-sm md:text-base">Create your account to access your purchase</p>
              </div>
              <form onSubmit={handleSignup} className="w-full space-y-3">
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-warmCharcoal mb-1">Email</label>
                  <input
                    id="email"
                    type="email"
                    className="ipurpose-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-xs font-medium text-warmCharcoal mb-1">Password</label>
                  <input
                    id="password"
                    type="password"
                    className="ipurpose-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="confirm" className="block text-xs font-medium text-warmCharcoal mb-1">Confirm Password</label>
                  <input
                    id="confirm"
                    type="password"
                    className="ipurpose-input"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs text-center">{error}</div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="ipurpose-button-gradient w-full text-base"
                >
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>
              </form>
              <div className="mt-3 text-center w-full">
                <p className="text-xs text-warmCharcoal/60">
                  Already have an account?{' '}
                  <Link href={`/login?next=${encodeURIComponent(nextParam)}`} className="text-lavenderViolet font-marcellus hover:text-indigoDeep transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

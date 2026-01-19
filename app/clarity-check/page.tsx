'use client';

import { useState } from 'react';
import Link from 'next/link';
import FloatingLogo from '../components/FloatingLogo';
import PublicHeader from '../components/PublicHeader';
import Footer from '../components/Footer';

export default function ClarityCheckPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/leads/clarity-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Use error from API response if available
        const errorMessage = data.error || 'Failed to submit clarity check';
        throw new Error(errorMessage);
      }

      if (data.ok) {
        setSubmitted(true);
      } else {
        throw new Error(data.error || 'Failed to submit clarity check');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-white">
      {/* Floating Logo */}
      <FloatingLogo />
      
      {/* Public Header */}
      <PublicHeader />
      
      {/* Main Content */}
      <div className="container max-w-2xl mx-auto px-6 py-20">
        {!submitted ? (
          <div>
            <h1 className="heading-hero mb-6 text-warmCharcoal text-center">
              Take Your Clarity Check
            </h1>
            <p className="text-lg text-warmCharcoal/75 text-center mb-12">
              A quick assessment to help you understand where you stand and whether iPurpose is right for you. Takes 2 minutes.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6 bg-gradient-to-br from-lavenderViolet/5 to-salmonPeach/5 rounded-2xl p-8 border border-lavenderViolet/10">
              <div>
                <label className="block text-sm font-medium text-warmCharcoal mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-lavenderViolet/20 bg-white text-warmCharcoal placeholder-warmCharcoal/50 focus:outline-none focus:ring-2 focus:ring-lavenderViolet/50"
                  placeholder="E.g., Sarah"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-warmCharcoal mb-2">
                  Your Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-lavenderViolet/20 bg-white text-warmCharcoal placeholder-warmCharcoal/50 focus:outline-none focus:ring-2 focus:ring-lavenderViolet/50"
                  placeholder="sarah@example.com"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-lavenderViolet to-indigoDeep text-white font-marcellus py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-disabled"
              >
                {loading ? 'Submitting...' : 'Take the Clarity Check'}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-6">✓</div>
            <h2 className="text-4xl font-marcellus text-warmCharcoal mb-4">
              You're in.
            </h2>
            <p className="text-lg text-warmCharcoal/75 mb-12">
              Now take the assessment. 12 quick questions to understand where you truly stand.
            </p>
            <div className="space-y-4 mb-8">
              <Link
                href="/clarity-check-numeric"
                className="inline-block w-full bg-gradient-to-r from-lavenderViolet to-indigoDeep text-white font-marcellus py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
              >
                Take the Clarity Check Assessment
              </Link>
              <Link
                href="/program"
                className="inline-block w-full bg-white text-lavenderViolet font-marcellus py-3 px-6 rounded-lg border border-lavenderViolet hover:bg-lavenderViolet/5 transition-colors"
              >
                Or explore the iPurpose Accelerator
              </Link>
            </div>
            <Link href="/" className="text-sm text-lavenderViolet hover:underline">
              Back to Home
            </Link>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

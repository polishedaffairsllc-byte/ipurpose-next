'use client';

import { useState } from 'react';
import Button from '../components/Button';
import Link from 'next/link';
import FloatingLogo from '../components/FloatingLogo';
import PublicHeader from '../components/PublicHeader';

export default function InfoSessionPage() {
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
      const res = await fetch('/api/leads/info-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      if (!res.ok) {
        throw new Error('Failed to register for info session');
      }

      const data = await res.json();
      if (data.ok) {
        setSubmitted(true);
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
              Reserve Your Info Session Spot
            </h1>
            <p className="text-lg text-warmCharcoal/75 text-center mb-12">
              Join a live conversation about the iPurpose program, ask questions, and see if it's the right fit for you.
            </p>

            <div className="bg-gradient-to-br from-lavenderViolet/5 to-salmonPeach/5 rounded-2xl p-6 border border-lavenderViolet/10 mb-8">
              <p className="text-sm text-warmCharcoal/75">
                <strong>Next Session:</strong> Coming soon (dates announced to registrants)
              </p>
              <p className="text-sm text-warmCharcoal/75 mt-2">
                <strong>Format:</strong> Live group call, 30–45 minutes
              </p>
              <p className="text-sm text-warmCharcoal/75 mt-2">
                <strong>What to Expect:</strong> Program overview, Q&A, next steps
              </p>
            </div>

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
                className="w-full bg-gradient-to-r from-lavenderViolet to-indigoDeep text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-disabled"
              >
                {loading ? 'Registering...' : 'Reserve My Spot'}
              </button>

              <p className="text-xs text-warmCharcoal/60 text-center">
                We'll send you session details and timing via email.
              </p>
            </form>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-6">✓</div>
            <h2 className="text-4xl font-marcellus text-warmCharcoal mb-4">
              You're All Set!
            </h2>
            <p className="text-lg text-warmCharcoal/75 mb-8">
              We've saved your spot for the info session. You'll receive the details, date, and time via email shortly.
            </p>
            <div className="bg-gradient-to-br from-lavenderViolet/5 to-salmonPeach/5 rounded-2xl p-8 border border-lavenderViolet/10 mb-8">
              <p className="text-warmCharcoal/75 mb-4">
                In the meantime, learn more about the program:
              </p>
              <Button size="lg" variant="primary" href="/program">
                Explore the Full Program
              </Button>
            </div>
            <p className="text-sm text-warmCharcoal/60">
              Have questions before the session? <Link href="/discover" className="text-lavenderViolet hover:underline">Check out our discovery page</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

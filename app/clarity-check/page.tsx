'use client';

import { useState } from 'react';
import Link from 'next/link';
import PublicHeader from '../components/PublicHeader';
import Footer from '../components/Footer';

export default function ClarityCheckPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // Honeypot
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/leads/clarity-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, website }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Use error from API response if available
        const errorMessage = data.error || 'Failed to submit clarity check';
        throw new Error(errorMessage);
      }

      if (data.ok) {
        setShowConfirmation(true);
        // Hide confirmation after 3 seconds, then show submitted state
        setTimeout(() => {
          setShowConfirmation(false);
          setSubmitted(true);
        }, 3000);
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
      {/* Public Header */}
      <PublicHeader />
      
      {/* Main Content */}
      <div className="container max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        {/* Confirmation Banner */}
        {showConfirmation && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm sm:text-base">
            ✓ Saved. Your Clarity Check is recorded.
          </div>
        )}

        {!submitted ? (
          <div>
            <section 
              className="relative text-center space-y-4 sm:space-y-6 py-16 sm:py-24 px-4 sm:px-6 rounded-2xl overflow-hidden mb-8"
              style={{
                backgroundImage: 'url(/images/cosmic-timetraveler-Gg6Oz8026C8-unsplash.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-black/50"></div>
              
              <h1 className="heading-hero mb-6 text-white relative z-10 text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
                Take Your Clarity Check
              </h1>
              <p className="text-white relative z-10 font-italiana px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-[40px]" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', color: '#FFFFFF' }}>
                Twelve questions to unlock your direction
              </p>
            </section>

            <form onSubmit={handleSubmit} className="space-y-6 bg-gradient-to-br from-lavenderViolet/5 to-salmonPeach/5 rounded-2xl p-4 sm:p-6 md:p-8 border border-lavenderViolet/10">
              <div>
                <label className="block font-medium text-warmCharcoal mb-2 text-[40px]">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-lavenderViolet/20 bg-white text-warmCharcoal placeholder-warmCharcoal/50 focus:outline-none focus:ring-2 focus:ring-lavenderViolet/50 text-[40px]"
                  placeholder="E.g., Sarah"
                />
              </div>

              <div>
                <label className="block font-medium text-warmCharcoal mb-2 text-[40px]">
                  Your Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-lavenderViolet/20 bg-white text-warmCharcoal placeholder-warmCharcoal/50 focus:outline-none focus:ring-2 focus:ring-lavenderViolet/50 text-[40px]"
                  placeholder="sarah@example.com"
                />
              </div>

              {/* Honeypot field - hidden via CSS, not type="hidden" */}
              <div style={{ display: 'none' }}>
                <label className="block text-xs sm:text-sm font-medium text-warmCharcoal mb-2">
                  Website
                </label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-lavenderViolet/20 bg-white text-warmCharcoal placeholder-warmCharcoal/50 focus:outline-none focus:ring-2 focus:ring-lavenderViolet/50 text-sm sm:text-base"
                  placeholder="https://yoursite.com"
                  autoComplete="off"
                  tabIndex={-1}
                />
              </div>

              {error && (
                <div className="text-red-600 text-xs sm:text-sm bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 sm:px-8 py-3 sm:py-4 rounded-full font-marcellus text-white text-center hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0))', fontSize: '35px' }}
              >
                {loading ? 'Submitting...' : 'Take the Clarity Check'}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <div className="text-5xl sm:text-6xl mb-4 sm:mb-6">✓</div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-marcellus text-warmCharcoal mb-3 sm:mb-4">
              You're in.
            </h2>
            <p className="text-warmCharcoal/75 mb-8 sm:mb-12 text-4xl">
              Now take the assessment. 12 quick questions to understand where you truly stand.
            </p>
            <div className="space-y-3 sm:space-y-4 flex flex-col mb-6 sm:mb-8">
              <Link
                href="/clarity-check-numeric"
                className="px-6 sm:px-8 py-3 sm:py-4 rounded-full font-marcellus text-white text-center hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0))', fontSize: '35px' }}
              >
                Take the Clarity Check Assessment
              </Link>
              <Link
                href="/program"
                className="px-6 sm:px-8 py-3 sm:py-4 rounded-full font-marcellus text-white text-center hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(to right, #FCC4B7, rgba(252, 196, 183, 0))', fontSize: '35px' }}
              >
                Or explore the iPurpose Accelerator™
              </Link>
            </div>
            <Link href="/" className="text-xs sm:text-sm text-lavenderViolet hover:underline">
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

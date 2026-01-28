'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * /enrollment-required page
 *
 * Shown to users who:
 * 1. Access community without paid entitlement (Decision #7)
 * 2. Access soul without Deepening tier (Decision #8)
 * 3. Access advanced tools without Deepening tier (Decision #9)
 * 4. Access AI tools without paid tier (Decision #10)
 * 5. Access integration without paid tier (Decision #12)
 *
 * Explains which tier is needed and provides upgrade path
 */

export default function EnrollmentRequiredPage() {
  const router = useRouter();
  const [attemptedRoute, setAttemptedRoute] = useState<string>('');

  useEffect(() => {
    // Get the intended route from URL params or fallback from referrer
    const params = new URLSearchParams(window.location.search);
    const intended = params.get('next') || document.referrer || '/program';
    setAttemptedRoute(intended);
  }, []);

  // Map route to required tier and description
  const getTierInfo = (route: string) => {
    if (route.includes('/community')) {
      return {
        feature: 'Community',
        requiredTier: 'Pro',
        price: '$19/month',
        description:
          'Join our community to connect with other seekers, share your journey, and receive support from our tribe.',
      };
    }
    if (
      route.includes('/soul') ||
      route.includes('/systems') ||
      route.includes('/insights') ||
      route.includes('/creation') ||
      route.includes('/interpretation')
    ) {
      return {
        feature: 'Deepening Tools',
        requiredTier: 'Premium',
        price: '$99/month',
        description:
          'Access soul reflection, systems thinking, insights generation, and creative interpretation tools.',
      };
    }
    if (route.includes('/ai-tools') || route.includes('/api/ai')) {
      return {
        feature: 'AI Tools',
        requiredTier: 'Pro or Premium',
        price: 'from $19/month',
        description: 'Unlock AI-powered clarity, analysis, and guidance for your journey.',
      };
    }
    if (route.includes('/integration')) {
      return {
        feature: 'Integration & Embodiment',
        requiredTier: 'Pro',
        price: '$19/month',
        description:
          'Move from self-discovery into real-world action and embodiment. Available to all paid tier members.',
      };
    }
    return {
      feature: 'This Feature',
      requiredTier: 'Paid Tier',
      price: 'Starting at $19/month',
      description: 'This feature requires a paid subscription to access.',
    };
  };

  const tierInfo = getTierInfo(attemptedRoute);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-lavenderViolet/10">
      {/* Header */}
      <div className="bg-white border-b border-lavenderViolet/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-marcellus text-warmCharcoal">Upgrade to Continue</h1>
          <p className="text-lg text-warmCharcoal/70 mt-2 font-marcellus">
            {tierInfo.feature} is available to paid members
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Feature Description */}
        <div className="bg-lavenderViolet/5 border border-lavenderViolet/30 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-marcellus text-warmCharcoal mb-4">{tierInfo.feature}</h2>
          <p className="text-lg text-warmCharcoal/80">{tierInfo.description}</p>
          <div className="mt-6 text-sm text-warmCharcoal/70">
            <strong>Required Tier:</strong> {tierInfo.requiredTier} ({tierInfo.price})
          </div>
        </div>

        {/* Tier Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Free Tier */}
          <div className="border border-warmCharcoal/20 rounded-lg p-6 bg-white">
            <h3 className="text-xl font-marcellus text-warmCharcoal mb-2">Free</h3>
            <p className="text-warmCharcoal/70 text-sm mb-4">Forever free tier</p>
            <ul className="space-y-2 text-sm text-warmCharcoal/70">
              <li className="flex items-start">
                <span className="text-lavenderViolet mr-2">✓</span>
                <span>Complete Labs (Identity, Meaning, Agency)</span>
              </li>
              <li className="flex items-start">
                <span className="text-warmCharcoal/30 mr-2">✗</span>
                <span>Integration & embodiment</span>
              </li>
              <li className="flex items-start">
                <span className="text-warmCharcoal/30 mr-2">✗</span>
                <span>AI tools & analysis</span>
              </li>
              <li className="flex items-start">
                <span className="text-warmCharcoal/30 mr-2">✗</span>
                <span>Community access</span>
              </li>
            </ul>
          </div>

          {/* Pro Tier */}
          <div className="border-2 border-lavenderViolet rounded-lg p-6 bg-lavenderViolet/5 relative">
            <div className="absolute -top-3 left-4 bg-lavenderViolet text-white px-3 py-1 rounded-full text-xs font-bold">
              MOST POPULAR
            </div>
            <h3 className="text-xl font-marcellus text-warmCharcoal mb-2">Pro</h3>
            <p className="text-lavenderViolet font-marcellus font-semibold mb-4">$19/month</p>
            <ul className="space-y-2 text-sm text-warmCharcoal/80">
              <li className="flex items-start">
                <span className="text-lavenderViolet mr-2">✓</span>
                <span>Everything in Free</span>
              </li>
              <li className="flex items-start">
                <span className="text-lavenderViolet mr-2">✓</span>
                <span>Integration & embodiment</span>
              </li>
              <li className="flex items-start">
                <span className="text-lavenderViolet mr-2">✓</span>
                <span>AI tools & analysis</span>
              </li>
              <li className="flex items-start">
                <span className="text-lavenderViolet mr-2">✓</span>
                <span>Community access</span>
              </li>
              <li className="flex items-start">
                <span className="text-warmCharcoal/30 mr-2">✗</span>
                <span>Advanced tools (deepening tier)</span>
              </li>
            </ul>
            <button className="w-full bg-lavenderViolet text-white font-marcellus font-semibold py-2 px-4 rounded-lg mt-6 hover:bg-indigoDeep transition">
              Upgrade to Pro
            </button>
          </div>

          {/* Premium Tier */}
          <div className="border border-warmCharcoal/20 rounded-lg p-6 bg-white">
            <h3 className="text-xl font-marcellus text-warmCharcoal mb-2">Premium</h3>
            <p className="text-warmCharcoal/70 font-marcellus font-semibold text-sm mb-4">$99/month</p>
            <ul className="space-y-2 text-sm text-warmCharcoal/70">
              <li className="flex items-start">
                <span className="text-lavenderViolet mr-2">✓</span>
                <span>Everything in Pro</span>
              </li>
              <li className="flex items-start">
                <span className="text-lavenderViolet mr-2">✓</span>
                <span>Soul reflection wing</span>
              </li>
              <li className="flex items-start">
                <span className="text-lavenderViolet mr-2">✓</span>
                <span>Advanced tools</span>
              </li>
              <li className="flex items-start">
                <span className="text-lavenderViolet mr-2">✓</span>
                <span>1-on-1 guidance (coming soon)</span>
              </li>
            </ul>
            <button className="w-full bg-warmCharcoal text-white font-marcellus font-semibold py-2 px-4 rounded-lg mt-6 hover:bg-warmCharcoal/80 transition">
              Upgrade to Premium
            </button>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-lavenderViolet/10 rounded-lg p-8 text-center border border-lavenderViolet/20">
          <h2 className="text-2xl font-marcellus text-warmCharcoal mb-4">
            Ready to unlock {tierInfo.feature}?
          </h2>
          <p className="text-warmCharcoal/80 mb-6 max-w-xl mx-auto">
            Choose your tier below to continue your journey with iPurpose.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/program"
              className="px-6 py-3 bg-lavenderViolet text-white font-marcellus font-semibold rounded-lg hover:bg-indigoDeep transition"
            >
              View Plans
            </Link>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-white text-warmCharcoal font-marcellus font-semibold border border-lavenderViolet/30 rounded-lg hover:bg-lavenderViolet/5 transition"
            >
              Go Back
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12 bg-white rounded-lg border border-warmCharcoal/20 p-8">
          <h3 className="text-xl font-marcellus text-warmCharcoal mb-6">Frequently Asked Questions</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-marcellus font-semibold text-warmCharcoal mb-2">
                Can I try Pro or Premium for free?
              </h4>
              <p className="text-warmCharcoal/80">
                We offer a 7-day free trial on all paid tiers. No credit card required.
              </p>
            </div>
            <div>
              <h4 className="font-marcellus font-semibold text-warmCharcoal mb-2">
                What's the difference between Pro and Premium?
              </h4>
              <p className="text-warmCharcoal/80">
                Pro includes Integration, AI tools, and Community. Premium adds advanced deepening tools
                (Soul, Systems, Insights, Creation, Interpretation).
              </p>
            </div>
            <div>
              <h4 className="font-marcellus font-semibold text-warmCharcoal mb-2">
                Can I cancel anytime?
              </h4>
              <p className="text-warmCharcoal/80">
                Yes. Cancel your subscription anytime with no penalties or hidden fees.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import FloatingLogo from '@/app/components/FloatingLogo';
import Footer from '@/app/components/Footer';

export default function PurchaseSuccessPage() {
  const searchParams = useSearchParams();
  const product = searchParams.get('product') || 'unknown';

  const productDetails: { [key: string]: { name: string; nextStep: string; link: string } } = {
    'starter_pack': {
      name: 'Purpose Starter Pack',
      nextStep: 'Check your email for your digital download',
      link: '/starter-pack',
    },
    'ai_blueprint': {
      name: 'AI Blueprint for Purpose-Driven Work',
      nextStep: 'Check your email for your guide and templates',
      link: '/ai-blueprint',
    },
    'accelerator': {
      name: 'iPurpose Accelerator',
      nextStep: 'Check your email to set up your account and get started',
      link: '/program',
    },
  };

  const details = productDetails[product] || { name: 'Your iPurpose Purchase', nextStep: 'Check your email for next steps', link: '/' };

  return (
    <div className="relative min-h-screen bg-white">
      <FloatingLogo />

      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 py-20">
        <div className="max-w-2xl text-center">
          <div className="text-6xl mb-8 text-lavenderViolet">✓</div>
          
          <h1 className="text-5xl md:text-6xl font-marcellus text-warmCharcoal mb-4">
            You're In!
          </h1>

          <p className="text-2xl text-warmCharcoal/80 mb-2">
            Thank you for your order.
          </p>

          <p className="text-xl text-warmCharcoal/70 mb-8">
            {details.nextStep}
          </p>

          <div className="bg-gradient-to-br from-lavenderViolet/5 to-transparent p-8 rounded-lg border border-lavenderViolet/20 mb-12">
            <h2 className="text-2xl font-marcellus text-warmCharcoal mb-2">
              What to Expect
            </h2>
            <ul className="text-left space-y-3 text-warmCharcoal/70">
              <li className="flex gap-3">
                <span className="text-lavenderViolet font-bold">→</span>
                <span>Check your inbox (and spam folder) in the next few minutes</span>
              </li>
              <li className="flex gap-3">
                <span className="text-lavenderViolet font-bold">→</span>
                <span>Click the link to access your materials immediately</span>
              </li>
              <li className="flex gap-3">
                <span className="text-lavenderViolet font-bold">→</span>
                <span>Save your receipt for your records</span>
              </li>
              {product === 'accelerator' && (
                <li className="flex gap-3">
                  <span className="text-lavenderViolet font-bold">→</span>
                  <span>Complete your account setup to join your cohort</span>
                </li>
              )}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/"
              className="px-8 py-3 bg-gradient-to-r from-lavenderViolet to-indigoDeep text-white rounded-full font-marcellus text-lg hover:opacity-90 transition-opacity"
            >
              Back to Home
            </Link>
            <Link
              href={details.link}
              className="px-8 py-3 border-2 border-lavenderViolet text-lavenderViolet rounded-full font-marcellus text-lg hover:bg-lavenderViolet/5 transition-colors"
            >
              Explore {product === 'accelerator' ? 'the Program' : 'More'}
            </Link>
          </div>

          <p className="text-sm text-warmCharcoal/50 mt-12">
            Questions? Check your email for support details or visit our contact page.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}

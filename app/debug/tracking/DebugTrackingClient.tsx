'use client';

import { useEffect, useState } from 'react';
import { trackViewContent, trackInitiateCheckout } from '@/lib/meta-pixel';

interface TrackingStatus {
  pixelInitialized: boolean;
  fbeventsLoaded: boolean;
  gaInitialized: boolean;
  pixelId: string;
  gaId: string;
  currentUrl: string;
}

export default function DebugTrackingClient() {
  const [status, setStatus] = useState<TrackingStatus>({
    pixelInitialized: false,
    fbeventsLoaded: false,
    gaInitialized: false,
    pixelId: '',
    gaId: '',
    currentUrl: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get environment variables (these are NEXT_PUBLIC_*)
    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || 'NOT_SET';
    const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'NOT_SET';
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    // Check if fbq is initialized
    const pixelInitialized = typeof (window as any).fbq === 'function';

    // Check if fbevents.js is loaded
    const fbeventsLoaded = performance
      .getEntriesByType('resource')
      .some(
        (entry: any) =>
          entry.name.includes('fbevents.js') ||
          entry.name.includes('facebook') ||
          entry.name.includes('meta')
      );

    // Check if gtag is initialized
    const gaInitialized = typeof (window as any).gtag === 'function';

    setStatus({
      pixelInitialized,
      fbeventsLoaded,
      gaInitialized,
      pixelId,
      gaId,
      currentUrl,
    });
    setLoading(false);
  }, []);

  const maskId = (id: string, showLast: number = 4): string => {
    if (id === 'NOT_SET') return 'NOT_SET';
    if (id.length <= showLast) return id;
    return '*'.repeat(id.length - showLast) + id.slice(-showLast);
  };

  const fireViewContent = () => {
    try {
      trackViewContent('Debug Test Product', 'product', 27, 'USD');
      alert('✅ ViewContent event fired! Check Meta Events Manager.');
    } catch (error) {
      alert('❌ Error firing ViewContent: ' + String(error));
    }
  };

  const fireInitiateCheckout = () => {
    try {
      trackInitiateCheckout('Debug Product', 27, 'USD');
      alert('✅ InitiateCheckout event fired! Check Meta Events Manager.');
    } catch (error) {
      alert('❌ Error firing InitiateCheckout: ' + String(error));
    }
  };

  const fireGABeginCheckout = () => {
    try {
      if (typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'begin_checkout', {
          value: 27,
          currency: 'USD',
          items: [{ item_id: 'debug-product', item_name: 'Debug Product' }],
        });
        alert('✅ GA4 begin_checkout event fired! Check GA4 Real-time.');
      } else {
        alert('❌ gtag function not available');
      }
    } catch (error) {
      alert('❌ Error firing GA event: ' + String(error));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading tracking status...</p>
      </div>
    );
  }

  const allGood = status.pixelInitialized && status.fbeventsLoaded && status.gaInitialized;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 Tracking Debug</h1>
          <p className="text-gray-600">Real-time verification of GA4 and Meta Pixel integration</p>
        </div>

        {/* Status Summary */}
        <div
          className={`mb-8 p-6 rounded-lg border-2 transition-all ${
            allGood
              ? 'border-green-400 bg-green-50'
              : 'border-yellow-400 bg-yellow-50'
          }`}
        >
          <div className="text-center mb-4">
            <div className="text-5xl font-bold mb-2">
              {allGood ? '✅' : '⚠️'}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {allGood
                ? 'All Tracking Systems Active'
                : 'Tracking Partially Configured'}
            </h2>
          </div>

          {/* Status Indicators */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className={`text-3xl mb-2 ${status.pixelInitialized ? '✅' : '❌'}`}>
                {status.pixelInitialized ? '✅' : '❌'}
              </div>
              <p className="text-sm font-semibold text-gray-700">Meta Pixel Init</p>
              <p className="text-xs text-gray-600">fbq function</p>
            </div>
            <div className="text-center">
              <div className={`text-3xl mb-2 ${status.fbeventsLoaded ? '✅' : '❌'}`}>
                {status.fbeventsLoaded ? '✅' : '❌'}
              </div>
              <p className="text-sm font-semibold text-gray-700">fbevents.js</p>
              <p className="text-xs text-gray-600">script loaded</p>
            </div>
            <div className="text-center">
              <div className={`text-3xl mb-2 ${status.gaInitialized ? '✅' : '❌'}`}>
                {status.gaInitialized ? '✅' : '❌'}
              </div>
              <p className="text-sm font-semibold text-gray-700">Google Analytics</p>
              <p className="text-xs text-gray-600">gtag function</p>
            </div>
          </div>
        </div>

        {/* Configuration Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Configuration</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Meta Pixel ID:</span>
              <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">
                {maskId(status.pixelId)}
              </code>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">GA Measurement ID:</span>
              <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">
                {maskId(status.gaId)}
              </code>
            </div>
          </div>
        </div>

        {/* URL Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Current URL</h3>
          <p className="text-sm text-gray-600 break-all">
            <code className="bg-gray-100 px-2 py-1 rounded">{status.currentUrl}</code>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            💡 Add ?utm_source=test&utm_medium=debug for UTM tracking
          </p>
        </div>

        {/* Test Buttons */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Test Events</h3>
          <p className="text-sm text-gray-600 mb-4">
            Click buttons to fire test events. Check your dashboards for incoming events.
          </p>

          <div className="space-y-3">
            <button
              onClick={fireViewContent}
              disabled={!status.pixelInitialized}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                status.pixelInitialized
                  ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
            >
              🎯 Fire ViewContent Test
            </button>

            <button
              onClick={fireInitiateCheckout}
              disabled={!status.pixelInitialized}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                status.pixelInitialized
                  ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
            >
              💳 Fire InitiateCheckout Test
            </button>

            <button
              onClick={fireGABeginCheckout}
              disabled={!status.gaInitialized}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                status.gaInitialized
                  ? 'bg-green-600 text-white hover:bg-green-700 active:scale-95'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
            >
              📈 Fire GA4 begin_checkout Test
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs text-gray-600 text-center">
          <p>
            This debug page is not indexed. Events fired here will appear in your Meta Events Manager and GA4 Real-time dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}

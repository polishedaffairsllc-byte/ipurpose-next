'use client';

import { useEffect, useState } from 'react';
import ModuleGuide from '@/app/components/ModuleGuide';

export default function CompassPage() {
  const [loading, setLoading] = useState(true);
  const [compassData, setCompassData] = useState<any>(null);

  useEffect(() => {
    const loadCompass = async () => {
      try {
        // TODO: Fetch user's most recent Clarity Check results
        // For now, show placeholder
        setCompassData({
          clarity: 0,
          alignment: 0,
          agency: 0,
          lastAssessment: null,
        });
      } catch (err) {
        console.error('Error loading compass:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCompass();
  }, []);

  return (
    <div className="container max-w-4xl mx-auto px-6 md:px-10 py-10">
      <h1 className="text-4xl font-semibold text-warmCharcoal mb-2">Your Compass</h1>
      <p className="text-sm text-warmCharcoal/70 mb-8">
        Track your clarity, alignment, and agency across your iPurpose journey.
      </p>

      {loading ? (
        <p className="text-sm text-warmCharcoal/60">Loading your compass...</p>
      ) : (
        <div className="space-y-6">
          {/* Placeholder content */}
          <div className="p-6 border border-warmCharcoal/10 rounded-lg">
            <p className="text-sm text-warmCharcoal/70">
              Your Clarity Check results and progress tracking will appear here. Start with the{' '}
              <a href="/clarity-check" className="font-semibold text-lavenderViolet hover:text-indigoDeep">
                Clarity Check
              </a>{' '}
              to establish your baseline.
            </p>
          </div>

          {/* Guidance */}
        <div className="space-y-4">
            <div className="p-4 bg-lavender/5 rounded-lg border border-lavenderViolet/10">
              <h3 className="font-semibold text-warmCharcoal mb-2">Next step</h3>
              <p className="text-sm text-warmCharcoal/70">
                Take the Clarity Check to map where you are, then dive into the labs that match your readiness level.
              </p>
            </div>
          </div>
        </div>
      )}

      <ModuleGuide moduleId="compass" />
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ModuleGuide from '@/app/components/ModuleGuide';

export default function CompassPage() {
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('Friend');
  const [compassData, setCompassData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch user profile
        try {
          const profileRes = await fetch('/api/profile');
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            if (profileData.displayName) {
              setDisplayName(profileData.displayName);
            }
          }
        } catch (err) {
          console.warn('Could not load profile:', err);
        }

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

    loadData();
  }, []);

  return (
    <div className="container max-w-4xl mx-auto px-6 md:px-10 py-10">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-semibold text-warmCharcoal mb-2">Your Compass{displayName ? `, ${displayName}` : ''}</h1>
          <p className="text-sm text-warmCharcoal/70">
            Track your clarity, alignment, and agency across your iPurpose journey.
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-warmCharcoal/60">Loading your compass...</p>
        ) : (
          <div className="space-y-6">
            {/* Placeholder content */}
            <div className="p-6 border border-warmCharcoal/10 rounded-lg bg-white/50">
              <p className="text-sm text-warmCharcoal/70 mb-4">
                Your Clarity Check results and progress tracking will appear here.
              </p>
              <Link 
                href="/clarity-check" 
                className="inline-flex items-center px-4 py-2 rounded-lg bg-lavenderViolet text-white font-medium hover:opacity-90 transition-opacity"
              >
                Start Clarity Check
              </Link>
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
    </div>
  );
}

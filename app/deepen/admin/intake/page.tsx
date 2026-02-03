'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Card from '@/app/components/Card';
import Link from 'next/link';

type SubmissionType = 'clarity_check' | 'info_session';

interface ClarityCheckSubmission {
  id: string;
  email: string;
  scores: {
    totalScore: number;
    internalClarity: number;
    readinessForSupport: number;
    frictionBetweenInsightAndAction: number;
    integrationAndMomentum: number;
  };
  resultSummary: string;
  createdAt: string;
  status: 'submitted';
}

interface InfoSessionRegistration {
  id: string;
  name: string;
  email: string;
  timezone?: string;
  createdAt: string;
  status: 'registered';
}

export default function FounderIntakePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('submission') || searchParams.get('registration');
  const selectedType = searchParams.get('submission') ? 'clarity_check' : 'info_session';

  const [clarityChecks, setClarityChecks] = useState<ClarityCheckSubmission[]>([]);
  const [infoSessions, setInfoSessions] = useState<InfoSessionRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<ClarityCheckSubmission | InfoSessionRegistration | null>(null);

  useEffect(() => {
    async function loadIntake() {
      try {
        setLoading(true);
        const [checksRes, sessionsRes] = await Promise.all([
          fetch('/api/deepen/admin/intake/clarity-checks', { cache: 'no-store' }),
          fetch('/api/deepen/admin/intake/info-sessions', { cache: 'no-store' }),
        ]);

        if (!checksRes.ok || !sessionsRes.ok) {
          throw new Error('Failed to load intake data');
        }

        const checksData = await checksRes.json();
        const sessionsData = await sessionsRes.json();

        setClarityChecks(checksData.data || []);
        setInfoSessions(sessionsData.data || []);

        // Select the item from URL if specified
        if (selectedId) {
          if (selectedType === 'clarity_check') {
            const item = checksData.data?.find((cc: ClarityCheckSubmission) => cc.id === selectedId);
            setSelectedSubmission(item || null);
          } else {
            const item = sessionsData.data?.find((is: InfoSessionRegistration) => is.id === selectedId);
            setSelectedSubmission(item || null);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load intake data');
      } finally {
        setLoading(false);
      }
    }

    loadIntake();
  }, [selectedId, selectedType]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-warmCharcoal/70">Loading intake data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-warmCharcoal mb-2">Founder Intake Dashboard</h1>
          <p className="text-warmCharcoal/70">Clarity Check submissions and Info Session registrations</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* List Column */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              {/* Clarity Checks Section */}
              <div>
                <h2 className="text-lg font-semibold text-warmCharcoal mb-3">
                  Clarity Checks ({clarityChecks.length})
                </h2>
                <div className="space-y-2">
                  {clarityChecks.length === 0 ? (
                    <p className="text-sm text-warmCharcoal/60">No clarity check submissions yet</p>
                  ) : (
                    clarityChecks.map((cc) => (
                      <button
                        key={cc.id}
                        onClick={() => setSelectedSubmission(cc)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition ${
                          selectedSubmission?.id === cc.id
                            ? 'border-lavenderViolet bg-lavenderViolet/5'
                            : 'border-warmCharcoal/10 hover:border-warmCharcoal/20'
                        }`}
                      >
                        <p className="text-sm font-medium text-warmCharcoal truncate">{cc.email}</p>
                        <p className="text-xs text-warmCharcoal/60 mt-1">
                          Score: {cc.scores.totalScore}/60
                        </p>
                        <p className="text-xs text-warmCharcoal/50 mt-1">
                          {new Date(cc.createdAt).toLocaleDateString()}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Info Sessions Section */}
              <div className="pt-6 border-t border-warmCharcoal/10">
                <h2 className="text-lg font-semibold text-warmCharcoal mb-3">
                  Info Sessions ({infoSessions.length})
                </h2>
                <div className="space-y-2">
                  {infoSessions.length === 0 ? (
                    <p className="text-sm text-warmCharcoal/60">No info session registrations yet</p>
                  ) : (
                    infoSessions.map((is) => (
                      <button
                        key={is.id}
                        onClick={() => setSelectedSubmission(is)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition ${
                          selectedSubmission?.id === is.id
                            ? 'border-lavenderViolet bg-lavenderViolet/5'
                            : 'border-warmCharcoal/10 hover:border-warmCharcoal/20'
                        }`}
                      >
                        <p className="text-sm font-medium text-warmCharcoal truncate">{is.name}</p>
                        <p className="text-xs text-warmCharcoal/60 mt-1">{is.email}</p>
                        <p className="text-xs text-warmCharcoal/50 mt-1">
                          {new Date(is.createdAt).toLocaleDateString()}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Detail Column */}
          <div className="lg:col-span-2">
            {selectedSubmission ? (
              <Card accent="lavender">
                <div className="space-y-6">
                  {'scores' in selectedSubmission ? (
                    // Clarity Check Detail
                    <>
                      <div>
                        <h3 className="text-2xl font-semibold text-warmCharcoal mb-2">Clarity Check Details</h3>
                        <p className="text-sm text-warmCharcoal/70">{selectedSubmission.email}</p>
                        <p className="text-xs text-warmCharcoal/50 mt-1">
                          Submitted: {new Date(selectedSubmission.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="grid gap-4">
                        <div className="p-4 bg-warmCharcoal/5 rounded-lg">
                          <p className="text-xs text-warmCharcoal/60 mb-1">Total Score</p>
                          <p className="text-3xl font-semibold text-warmCharcoal">
                            {selectedSubmission.scores.totalScore}
                            <span className="text-lg text-warmCharcoal/60">/60</span>
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-warmCharcoal/5 rounded-lg">
                            <p className="text-xs text-warmCharcoal/60 mb-1">Internal Clarity</p>
                            <p className="text-lg font-semibold text-warmCharcoal">
                              {selectedSubmission.scores.internalClarity}
                            </p>
                          </div>
                          <div className="p-3 bg-warmCharcoal/5 rounded-lg">
                            <p className="text-xs text-warmCharcoal/60 mb-1">Readiness</p>
                            <p className="text-lg font-semibold text-warmCharcoal">
                              {selectedSubmission.scores.readinessForSupport}
                            </p>
                          </div>
                          <div className="p-3 bg-warmCharcoal/5 rounded-lg">
                            <p className="text-xs text-warmCharcoal/60 mb-1">Friction</p>
                            <p className="text-lg font-semibold text-warmCharcoal">
                              {selectedSubmission.scores.frictionBetweenInsightAndAction}
                            </p>
                          </div>
                          <div className="p-3 bg-warmCharcoal/5 rounded-lg">
                            <p className="text-xs text-warmCharcoal/60 mb-1">Integration</p>
                            <p className="text-lg font-semibold text-warmCharcoal">
                              {selectedSubmission.scores.integrationAndMomentum}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-warmCharcoal mb-2">Summary</h4>
                        <p className="text-sm text-warmCharcoal/75 leading-relaxed">
                          {selectedSubmission.resultSummary}
                        </p>
                      </div>
                    </>
                  ) : (
                    // Info Session Detail
                    <>
                      <div>
                        <h3 className="text-2xl font-semibold text-warmCharcoal mb-2">Info Session Registration</h3>
                        <div className="space-y-2">
                          <p>
                            <span className="text-sm text-warmCharcoal/60">Name: </span>
                            <span className="text-sm font-medium text-warmCharcoal">{selectedSubmission.name}</span>
                          </p>
                          <p>
                            <span className="text-sm text-warmCharcoal/60">Email: </span>
                            <span className="text-sm font-medium text-warmCharcoal">{selectedSubmission.email}</span>
                          </p>
                          {selectedSubmission.timezone && (
                            <p>
                              <span className="text-sm text-warmCharcoal/60">Timezone: </span>
                              <span className="text-sm font-medium text-warmCharcoal">{selectedSubmission.timezone}</span>
                            </p>
                          )}
                          <p>
                            <span className="text-sm text-warmCharcoal/60">Registered: </span>
                            <span className="text-sm font-medium text-warmCharcoal">
                              {new Date(selectedSubmission.createdAt).toLocaleString()}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <p className="text-sm text-emerald-800">
                          ✓ Confirmation email sent to {selectedSubmission.email}
                        </p>
                      </div>
                    </>
                  )}

                  <div className="pt-6 border-t border-warmCharcoal/10">
                    <Link
                      href="/deepen/admin/intake"
                      className="text-sm text-lavenderViolet hover:text-indigoDeep"
                    >
                      ← Back to List
                    </Link>
                  </div>
                </div>
              </Card>
            ) : (
              <Card accent="lavender">
                <div className="text-center py-12">
                  <p className="text-warmCharcoal/70">Select an item from the list to view details</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

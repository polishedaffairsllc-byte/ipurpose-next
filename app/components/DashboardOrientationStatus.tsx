"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "./Card";

type Progress = {
  currentStep?: string | null;
  completedSteps?: string[];
  percentComplete?: number;
};

type DashboardData = {
  identityStatus?: "not_started" | "in_progress" | "complete";
  meaningStatus?: "not_started" | "in_progress" | "complete";
  agencyStatus?: "not_started" | "in_progress" | "complete";
};

const labKeys = ["identity", "meaning", "agency"] as const;

const orientationInfo = [
  {
    label: "What this is",
    value: "A guided development space to map Identity, Meaning, and Agency into something you can act on."
  },
  {
    label: "How it works",
    value: "You'll complete 3 labs (Identity → Meaning → Agency). Each lab saves progress. Your Dashboard reflects what's complete and what's next."
  },
  {
    label: "What you'll get",
    value: "Clear self-language, priorities, and a simple next-step plan."
  },
  {
    label: "Time",
    value: "20–40 minutes per lab (you can pause anytime)."
  }
];

function formatStatus(status?: string) {
  if (status === "complete") return "Complete";
  if (status === "in_progress") return "In progress";
  return "Not started";
}

export default function DashboardOrientationStatus() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [labs, setLabs] = useState<DashboardData | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadAll() {
      try {
        const [progressRes, dashboardRes] = await Promise.all([
          fetch("/api/learning-path/orientation"),
          fetch("/api/dashboard"),
        ]);

        const progressJson = progressRes.ok ? await progressRes.json() : null;
        const dashboardJson = dashboardRes.ok ? await dashboardRes.json() : null;

        if (!isActive) return;

        setProgress(progressJson?.data ?? null);
        setLabs(dashboardJson?.data ?? null);
      } catch (err) {
        if (isActive) setError(err instanceof Error ? err.message : "Failed to load status");
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadAll();

    return () => {
      isActive = false;
    };
  }, []);

  // Calculate percentage based on lab completion status
  const calculatePercentComplete = () => {
    if (!labs) return 0;
    const statuses = [
      labs.identityStatus,
      labs.meaningStatus,
      labs.agencyStatus,
    ];
    const completedCount = statuses.filter(s => s === "complete").length;
    const inProgressCount = statuses.filter(s => s === "in_progress").length;
    
    // Formula: (completed * 100 + inProgress * 50) / 3
    return Math.round((completedCount * 100 + inProgressCount * 50) / 3);
  };

  const percentComplete = calculatePercentComplete();

  return (
    <div className="space-y-8">
      {/* Orientation Info Table */}
      <Card accent="lavender">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-warmCharcoal mb-4">Orientation</h3>
            <p className="text-sm text-warmCharcoal/70 mb-6">
              {progress?.currentStep ? `Current: ${progress.currentStep}` : "A guided development space to map Identity, Meaning, and Agency into something you can act on."}
            </p>
          </div>

          {loading ? (
            <p className="text-sm text-warmCharcoal/70">Loading status...</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : (
            <div className="space-y-4">
              {/* Info Table */}
              <table className="w-full text-sm">
                <tbody className="divide-y divide-ip-border">
                  {orientationInfo.map((item, idx) => (
                    <tr key={idx} className="hover:bg-warmCharcoal/5 transition">
                      <td className="py-3 pr-4 font-medium text-warmCharcoal whitespace-nowrap align-top">{item.label}</td>
                      <td className="py-3 text-warmCharcoal/70">{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Overall Progress Bar */}
              <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(42, 42, 42, 0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'rgba(42, 42, 42, 0.6)' }}>Lab Progress</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#2A2A2A' }}>{percentComplete}%</span>
                </div>
                <div style={{ width: '100%', height: '0.75rem', borderRadius: '9999px', backgroundColor: 'rgba(42, 42, 42, 0.1)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      borderRadius: '9999px',
                      width: `${percentComplete}%`,
                      background: 'linear-gradient(to right, #9C88FF, #4B4E6D)',
                      transition: 'width 0.3s ease-in-out',
                    }}
                  />
                </div>
              </div>

              {/* Lab Status with Progress Bars */}
              <div className="mt-6 space-y-3">
                <h4 className="text-sm font-semibold text-warmCharcoal mb-3">Lab Status</h4>
                {labKeys.map((labKey) => {
                  const status = labs?.[`${labKey}Status` as keyof DashboardData] as string | undefined;
                  const isComplete = status === "complete";
                  const isInProgress = status === "in_progress";
                  const progressPercent = isComplete ? 100 : isInProgress ? 50 : 0;
                  
                  // iPurpose brand colors for progress bars
                  let barColor = '#D4D4D4'; // neutral gray for not started
                  let barGradient = `linear-gradient(to right, ${barColor}, ${barColor})`;
                  
                  if (isComplete) {
                    // Emerald green for complete
                    barColor = '#10B981';
                    barGradient = `linear-gradient(to right, #10B981, #059669)`;
                  } else if (isInProgress) {
                    // Warm gold for in progress
                    barColor = '#F59E0B';
                    barGradient = `linear-gradient(to right, #F59E0B, #D97706)`;
                  }

                  return (
                    <Link
                      key={labKey}
                      href={`/labs/${labKey}`}
                      style={{
                        display: 'block',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(42, 42, 42, 0.1)',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease-in-out',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(42, 42, 42, 0.03)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ textTransform: 'capitalize', fontWeight: '500', color: '#2A2A2A', fontSize: '0.875rem' }}>
                          {labKey} Lab
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'rgba(42, 42, 42, 0.7)', fontWeight: '500' }}>
                          {formatStatus(status)}
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '0.5rem', borderRadius: '9999px', backgroundColor: 'rgba(42, 42, 42, 0.1)', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            borderRadius: '9999px',
                            width: `${progressPercent}%`,
                            background: barGradient,
                            transition: 'width 0.3s ease-in-out',
                          }}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>


            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

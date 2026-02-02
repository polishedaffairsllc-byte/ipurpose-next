"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type LearningPathResponse = {
  path: { key: string; title: string };
  progress: { currentStep: string | null; completedSteps: string[]; percentComplete: number };
};

const steps = [
  { key: "orientation_intro", title: "Orientation Intro", type: "read", icon: "📖" },
  { key: "identity_lab", title: "Identity Lab", type: "lab", href: "/labs/identity", icon: "✨" },
  { key: "meaning_lab", title: "Meaning Lab", type: "lab", href: "/labs/meaning", icon: "💫" },
  { key: "agency_lab", title: "Agency Lab", type: "lab", href: "/labs/agency", icon: "🎯" },
  { key: "integration_reflection", title: "Integration Reflection", type: "write", href: "/integration?from=labs", icon: "🧩" },
  { key: "community_reflection", title: "Community Reflection (Optional)", type: "community", href: "/community", icon: "🤝" },
];

export default function LearningPathPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<LearningPathResponse | null>(null);

  useEffect(() => {
    let isActive = true;

    async function load() {
      try {
        const res = await fetch("/api/learning-path/orientation");
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to load learning path");
        }
        const json = await res.json();
        if (isActive) setData(json?.data ?? null);
      } catch (err) {
        if (isActive) setError(err instanceof Error ? err.message : "Failed to load learning path");
      } finally {
        if (isActive) setLoading(false);
      }
    }

    load();

    return () => {
      isActive = false;
    };
  }, []);

  const completed = data?.progress?.completedSteps ?? [];
  const completedCount = completed.length;
  const totalSteps = steps.length;

  const nextStep = steps.find((step) => !completed.includes(step.key));

  return (
    <div className="container max-w-5xl mx-auto px-6 md:px-10 py-10">
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '600', color: '#2A2A2A', marginBottom: '0.5rem' }}>
          Learning Path
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'rgba(42, 42, 42, 0.7)' }}>
          Follow the path to complete your Orientation
        </p>
      </div>

      {loading ? (
        <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'rgba(42, 42, 42, 0.7)' }}>
          Loading your progress...
        </p>
      ) : error ? (
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#EF4444' }}>{error}</p>
      ) : (
        <>
          {/* Steps Timeline */}
          <div style={{ marginTop: '2rem', position: 'relative' }}>
            {/* Timeline line */}
            <div style={{
              position: 'absolute',
              left: '1.5rem',
              top: '2rem',
              bottom: '0',
              width: '2px',
              background: 'linear-gradient(to bottom, #9C88FF, #E5E7EB)',
            }} />

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {steps.map((step, index) => {
                const isCompleted = completed.includes(step.key);
                const isCurrent = step.key === data?.progress?.currentStep;
                
                return (
                  <div
                    key={step.key}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      gap: '1rem',
                    }}
                  >
                    {/* Timeline dot */}
                    <div style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '1rem',
                      width: '1.5rem',
                      height: '1.5rem',
                      borderRadius: '50%',
                      backgroundColor: isCompleted ? '#10B981' : isCurrent ? '#9C88FF' : 'rgba(42, 42, 42, 0.1)',
                      border: `2px solid ${isCompleted ? '#10B981' : isCurrent ? '#9C88FF' : 'rgba(42, 42, 42, 0.1)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                    }}>
                      {isCompleted ? '✓' : ''}
                    </div>

                    {/* Step card */}
                    <div style={{
                      marginLeft: '1.5rem',
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      border: `1px solid ${isCompleted ? 'rgba(16, 185, 129, 0.2)' : isCurrent ? 'rgba(156, 136, 255, 0.3)' : 'rgba(42, 42, 42, 0.1)'}`,
                      backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.05)' : isCurrent ? 'rgba(156, 136, 255, 0.05)' : 'rgba(255, 255, 255, 0.5)',
                      transition: 'all 0.2s ease-in-out',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '1.25rem' }}>{step.icon}</span>
                            <h3 style={{
                              fontSize: '1rem',
                              fontWeight: '600',
                              color: '#2A2A2A',
                              textDecoration: isCompleted ? 'line-through' : 'none',
                            }}>
                              {step.title}
                            </h3>
                          </div>
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <p style={{ fontSize: '0.75rem', color: 'rgba(42, 42, 42, 0.6)', fontWeight: '500', textTransform: 'uppercase' }}>
                              {isCompleted ? (
                                <span style={{ color: '#10B981' }}>✓ Completed</span>
                              ) : isCurrent ? (
                                <span style={{ color: '#9C88FF' }}>In Progress</span>
                              ) : (
                                'Pending'
                              )}
                            </p>
                            {isCompleted && (
                              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#9C88FF', backgroundColor: 'rgba(156, 136, 255, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '9999px' }}>
                                {step.milestone}
                              </span>
                            )}
                          </div>
                        </div>
                        {step.href && !isCompleted && (
                          <Link
                            href={step.href}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: isCurrent ? '#9C88FF' : '#F5F5F5',
                              color: isCurrent ? 'white' : '#2A2A2A',
                              borderRadius: '9999px',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              textDecoration: 'none',
                              transition: 'all 0.2s ease-in-out',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            {isCurrent ? 'Continue' : 'Open'}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/app/components/Button';
import Card from '@/app/components/Card';
import ModuleGuide from '@/app/components/ModuleGuide';

interface Reflection {
  id: string;
  labName?: string;
  summary: string;
  type: 'lab-integration' | 'personal';
  integratedAt: Date;
}

export default function ReflectionsPage() {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReflection, setSelectedReflection] = useState<Reflection | null>(null);

  useEffect(() => {
    const fetchReflections = async () => {
      try {
        // TODO: Fetch user reflections from Firestore
        setReflections([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reflections');
      } finally {
        setLoading(false);
      }
    };

    fetchReflections();
  }, []);

  return (
    <div className="container max-w-4xl mx-auto px-6 md:px-10 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold text-warmCharcoal mb-2">Your Reflections</h1>
        <p className="text-sm text-warmCharcoal/70">
          Collect and review insights from your lab work and personal reflections.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-warmCharcoal/60">Loading...</p>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      ) : reflections.length === 0 ? (
        <div className="p-8 border border-dashed border-warmCharcoal/20 rounded-lg text-center">
          <p className="text-sm text-warmCharcoal/60 mb-4">
            No reflections yet. Complete a lab and click "Integrate" to capture your insights.
          </p>
          <Link href="/labs">
            <Button>Go to Labs</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            {reflections.map((reflection) => (
              <button
                key={reflection.id}
                onClick={() => setSelectedReflection(reflection)}
                className="w-full text-left"
              >
                <Card
                  accent="salmon"
                  className="p-4 cursor-pointer hover:shadow-md transition"
                >
                  <h3 className="font-semibold text-warmCharcoal text-sm">
                    {reflection.labName || 'Reflection'}
                  </h3>
                  <p className="text-xs text-warmCharcoal/60">
                    {reflection.integratedAt.toLocaleDateString()}
                  </p>
                </Card>
              </button>
            ))}
          </div>

          {selectedReflection && (
            <Card accent="salmon" className="p-6">
              <h3 className="text-lg font-semibold text-warmCharcoal mb-1">
                {selectedReflection.labName || 'Reflection'}
              </h3>
              <p className="text-xs text-warmCharcoal/60 mb-4">
                {selectedReflection.integratedAt.toLocaleDateString()}
              </p>
              <p className="text-sm text-warmCharcoal/80 mb-4">{selectedReflection.summary}</p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedReflection.summary);
                  }}
                >
                  Copy
                </Button>
                <Button variant="secondary" onClick={() => window.print()}>
                  Print
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      <ModuleGuide moduleId="reflections" />
    </div>
  );
}

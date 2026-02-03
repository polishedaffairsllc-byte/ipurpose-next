'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/app/components/Button';
import Card from '@/app/components/Card';

interface Asset {
  id: string;
  title: string;
  type: 'pdf' | 'guide' | 'library';
  description: string;
  filename?: string;
  downloadUrl?: string;
  unlockUrl?: string;
}

export default function ResourcesPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await fetch('/api/resources/get-assets');
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch assets');
        }
        const data = await res.json();
        setAssets(data.assets || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading resources');
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [router]);

  return (
    <div className="container max-w-4xl mx-auto px-6 md:px-10 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold text-warmCharcoal mb-2">Your Resources</h1>
        <p className="text-sm text-warmCharcoal/70">
          Access your purchased assets and guides. All resources are available for lifetime re-download.
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-warmCharcoal/60">Loading your resources...</div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      ) : assets.length === 0 ? (
        <div className="p-8 border border-dashed border-warmCharcoal/20 rounded-lg text-center">
          <p className="text-sm text-warmCharcoal/60 mb-4">
            You haven't purchased any products yet.
          </p>
          <Link href="/programs">
            <Button>Explore Programs</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* PDFs - downloadable */}
          {assets
            .filter((a) => a.type === 'pdf')
            .map((asset) => (
              <Card
                key={asset.id}
                accent="lavender"
                className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div>
                  <h3 className="font-semibold text-warmCharcoal mb-1">{asset.title}</h3>
                  <p className="text-sm text-warmCharcoal/70">{asset.description}</p>
                </div>
                <a href={asset.downloadUrl} download={asset.filename}>
                  <Button variant="secondary">Download PDF</Button>
                </a>
              </Card>
            ))}

          {/* Guides & Libraries - unlock access */}
          {assets
            .filter((a) => a.type !== 'pdf')
            .map((asset) => (
              <Card
                key={asset.id}
                accent={asset.type === 'guide' ? 'salmon' : 'salmon'}
                className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div>
                  <h3 className="font-semibold text-warmCharcoal mb-1">{asset.title}</h3>
                  <p className="text-sm text-warmCharcoal/70">{asset.description}</p>
                </div>
                {asset.unlockUrl && (
                  <Link href={asset.unlockUrl}>
                    <Button>Access</Button>
                  </Link>
                )}
              </Card>
            ))}
        </div>
      )}

      {/* Help section */}
      <div className="mt-12 p-6 bg-warmCharcoal/5 rounded-lg">
        <h3 className="font-semibold text-warmCharcoal mb-3">Questions about your assets?</h3>
        <p className="text-sm text-warmCharcoal/70 mb-4">
          All purchased assets are available for unlimited re-download. You can access these resources anytime from your Resources page.
        </p>
        <Link href="/support" className="text-sm font-medium text-lavenderViolet hover:text-indigoDeep">
          Contact support →
        </Link>
      </div>
    </div>
  );
}

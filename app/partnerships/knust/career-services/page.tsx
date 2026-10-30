import type { Metadata } from 'next';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { notFound } from 'next/navigation';
import PartnershipPresentation from '../../sdsn/[audience]/PartnershipPresentation';
import { isKNUSTPreviewEnabled, knustConfig } from '@/lib/partnerships/knust';
import '../../sdsn/[audience]/sdsn.css';
import './knust.css';

export function generateMetadata(): Metadata {
  if (!isKNUSTPreviewEnabled()) notFound();
  return {
    title: knustConfig.h1, description: knustConfig.sub,
    robots: { index: false, follow: false, noarchive: true },
    openGraph: { title: 'iPurpose · Partnership concept', description: 'Prepared for an exploratory partnership discussion.', images: [] },
    twitter: { card: 'summary', title: 'iPurpose · Partnership concept', images: [] },
  };
}

export default function KNUSTCareerServicesPage() {
  if (!isKNUSTPreviewEnabled()) notFound();
  const overviewUrl = knustConfig.overviewUrl && existsSync(path.join(process.cwd(), 'public', knustConfig.overviewUrl)) ? knustConfig.overviewUrl : undefined;
  return <PartnershipPresentation config={{ ...knustConfig, overviewUrl }} />;
}

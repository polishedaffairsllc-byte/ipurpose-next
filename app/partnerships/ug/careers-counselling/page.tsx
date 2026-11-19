import type { Metadata } from 'next';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { notFound } from 'next/navigation';
import PartnershipPresentation from '../../sdsn/[audience]/PartnershipPresentation';
import { isUGPreviewEnabled, ugConfig } from '@/lib/partnerships/ug';
import '../../sdsn/[audience]/sdsn.css';
import './ug.css';

export function generateMetadata(): Metadata {
  if (!isUGPreviewEnabled()) notFound();
  return {
    title: ugConfig.h1, description: ugConfig.sub,
    robots: { index: false, follow: false, noarchive: true },
    openGraph: { title: 'iPurpose · Partnership concept', description: 'Prepared for an exploratory partnership discussion.', images: [] },
    twitter: { card: 'summary', title: 'iPurpose · Partnership concept', images: [] },
  };
}

export default function UGCareersCounsellingPage() {
  if (!isUGPreviewEnabled()) notFound();
  const overviewUrl = ugConfig.overviewUrl && existsSync(path.join(process.cwd(), 'public', ugConfig.overviewUrl)) ? ugConfig.overviewUrl : undefined;
  return <PartnershipPresentation config={{ ...ugConfig, overviewUrl }} />;
}

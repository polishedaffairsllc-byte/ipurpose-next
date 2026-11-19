import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSDSNConfig, sdsnConfigs } from '@/lib/partnerships/sdsn';
import PartnershipPresentation from './PartnershipPresentation';
import './sdsn.css';
export const dynamicParams = false;
export function generateStaticParams() {
  return Object.values(sdsnConfigs).filter(config => config.enabled).map(config => ({ audience: config.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ audience: string }> }): Promise<Metadata> {
  const config = getSDSNConfig((await params).audience);
  if (!config) notFound();
  return {
    title: config.h1, description: config.sub,
    robots: { index: false, follow: false, noarchive: true },
    openGraph: { title: 'iPurpose · Partnership concept', description: 'Prepared for an exploratory partnership discussion.', images: [] },
    twitter: { card: 'summary', title: 'iPurpose · Partnership concept', images: [] },
  };
}
export default async function SDSNPage({ params }: { params: Promise<{ audience: string }> }) {
  const config = getSDSNConfig((await params).audience);
  if (!config) notFound();
  return <PartnershipPresentation config={config} />;
}

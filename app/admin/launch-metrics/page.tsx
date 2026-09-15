import type { Metadata } from 'next';
import LaunchMetricsClient from './LaunchMetricsClient';

export const metadata: Metadata = { title: 'Launch Metrics | iPurpose', robots: { index: false, follow: false } };
export default function LaunchMetricsPage() { return <LaunchMetricsClient />; }

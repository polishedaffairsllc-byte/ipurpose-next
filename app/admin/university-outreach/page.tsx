import type { Metadata } from 'next';
import UniversityReviewClient from './UniversityReviewClient';
export const metadata: Metadata = { title: 'University Outreach Review | iPurpose', robots: { index: false, follow: false, noarchive: true } };
export default function UniversityReviewPage() { return <UniversityReviewClient/>; }

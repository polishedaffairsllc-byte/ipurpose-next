import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Clarity Check — Where You Are Right Now',
  description: 'A reflective clarity assessment to understand your current state: internal clarity, readiness for support, and momentum toward action.',
  openGraph: {
    title: 'Clarity Check — Where You Are Right Now',
    description: 'A reflective clarity assessment to understand your current state: internal clarity, readiness for support, and momentum toward action.',
    type: 'website',
  },
  robots: 'index, follow',
};

export default function ClarityCheckLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

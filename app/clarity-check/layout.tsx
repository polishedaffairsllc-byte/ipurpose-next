import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Clarity Check — Find Your Next Aligned Step',
  description: 'Start here to gain clarity on what you\'re building and what comes next, with a grounded introduction to the iPurpose method.',
  openGraph: {
    title: 'Clarity Check — Find Your Next Aligned Step',
    description: 'Start here to gain clarity on what you\'re building and what comes next, with a grounded introduction to the iPurpose method.',
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

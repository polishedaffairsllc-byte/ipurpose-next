import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Find Out Where You\'re Stuck — Free Clarity Check in Under 3 Minutes',
  description: 'Answer 12 quick questions to discover exactly where you\'re stuck and what your next aligned step should be. No sign-up required.',
  openGraph: {
    title: 'Find Out Where You\'re Stuck — Free Clarity Check in Under 3 Minutes',
    description: 'Answer 12 quick questions to discover exactly where you\'re stuck and what your next aligned step should be. No sign-up required.',
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

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Clarity Check Quiz | iPurpose',
  description: 'Take the iPurpose Clarity Check to reflect on your direction, alignment, and next steps.',
  alternates: { canonical: './' },
  robots: { index: true, follow: true },
};

export default function ClarityCheckQuizLayout({ children }: { children: React.ReactNode }) {
  return children;
}

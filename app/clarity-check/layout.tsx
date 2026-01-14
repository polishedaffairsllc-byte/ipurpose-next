import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Discover Your Alignment Type | iPurpose',
  description: 'Take the iPurpose Alignment Type assessment to discover your unique archetype and get personalized guidance for your journey.',
  openGraph: {
    title: 'Discover Your Alignment Type | iPurpose',
    description: 'Take the iPurpose Alignment Type assessment to discover your unique archetype and get personalized guidance for your journey.',
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

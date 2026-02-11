import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'iPurpose™ Starter Pack — Get Clear in 60–90 Minutes',
  description: 'A guided self-directed experience to help you get clear on your direction, name your purpose, and take your next step with calm structure.',
  openGraph: {
    title: 'iPurpose™ Starter Pack — Get Clear in 60–90 Minutes',
    description: 'A guided self-directed experience to help you get clear on your direction, name your purpose, and take your next step with calm structure.',
    type: 'website',
  },
  robots: 'index, follow',
};

export default function StarterPackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About iPurpose | Soul → Systems → AI',
  description: 'Learn why iPurpose exists and how the Soul → Systems → AI framework helps you build what\'s true.',
  openGraph: {
    title: 'About iPurpose | Soul → Systems → AI',
    description: 'Learn why iPurpose exists and how the Soul → Systems → AI framework helps you build what\'s true.',
    type: 'website',
  },
  robots: 'index, follow',
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

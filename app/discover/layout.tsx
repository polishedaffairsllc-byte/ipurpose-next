import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Discover iPurpose | Build with Clarity',
  description: 'Discover how iPurpose helps visionary entrepreneurs reconnect to their purpose and build with clarity, without burnout.',
};

export default function DiscoverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Clarity Check | iPurpose',
  description: 'Take a 2-minute clarity check to see if iPurpose is right for you. Get personalized insights about reconnecting with your purpose.',
};

export default function ClarityCheckLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

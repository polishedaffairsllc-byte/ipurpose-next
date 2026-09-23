import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'iPurpose Blueprint | Use AI with Intention',
  description: 'A beginner-friendly guide to using AI ethically and intentionally to support clarity, planning, and creative work.',
  alternates: { canonical: 'https://ipurposesoul.com/ai-blueprint' },
  openGraph: {
    title: 'iPurpose™ Blueprint | Use AI with Intention',
    description: 'A beginner-friendly guide to using AI ethically and intentionally to support clarity, planning, and creative work.',
    url: 'https://ipurposesoul.com/ai-blueprint',
    type: 'website',
  },
  robots: 'index, follow',
};

export default function AIBlueprintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

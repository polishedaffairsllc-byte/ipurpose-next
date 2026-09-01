import { Metadata } from 'next';

const title = 'Soul → Systems → AI™ | The iPurpose Framework';
const description = 'Learn how iPurpose combines personal clarity, practical business systems, and thoughtful AI to help creators make better decisions and build sustainable workflows.';
const canonical = 'https://ipurposesoul.com/discover';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical },
  openGraph: {
    title,
    description,
    url: canonical,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  robots: { index: true, follow: true },
};

export default function DiscoverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

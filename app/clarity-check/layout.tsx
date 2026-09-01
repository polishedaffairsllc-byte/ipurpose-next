import { Metadata } from 'next';

const title = 'Business Clarity Check | Find Your Next Best Step — iPurpose';
const description = 'Use the free iPurpose Clarity Check to identify what is blocking progress and whether you need clearer direction, better systems, or more intentional use of AI.';
const canonical = 'https://ipurposesoul.com/clarity-check';

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

export default function ClarityCheckLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

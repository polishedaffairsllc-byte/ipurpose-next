import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'iPurpose 6-Week Program | Build with Clarity',
  description: 'A guided 6-week journey to reconnect with your purpose, build aligned systems, and expand through AI. Cohort-based learning with live mentorship.',
};

export default function ProgramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

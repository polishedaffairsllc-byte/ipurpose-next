import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'iPurpose Accelerator | Build with Clarity',
  description: 'A guided cohort-based journey to reconnect with your purpose, build aligned systems, and expand through AI. Live mentorship and cohort-based learning.',
};

export default function ProgramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

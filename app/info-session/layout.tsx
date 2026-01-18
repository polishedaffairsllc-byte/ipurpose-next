import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Info Session | iPurpose Program',
  description: 'Reserve your spot for a live info session about the iPurpose Accelerator. Ask questions and learn if it\'s right for you.',
};

export default function InfoSessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

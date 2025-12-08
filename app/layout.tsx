import type { Metadata } from 'next';
import { Italiana } from 'next/font/google';
import './tailwind.css';
import { AuthContextProvider } from './context/AuthContext';

const italiana = Italiana({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-italiana',
});

export const metadata: Metadata = {
  title: 'iPurpose Platform',
  description: 'Your next-generation coaching platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={italiana.variable}>
      {/* 🔥 IMPORTANT: Apply Tailwind font + brand background + brand text */}
      <body className="font-italiana bg-ip-surface text-ip-text">
        <AuthContextProvider>
          {children}
        </AuthContextProvider>
      </body>
    </html>
  );
}

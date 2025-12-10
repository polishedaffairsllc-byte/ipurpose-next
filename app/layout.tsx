import type { Metadata } from 'next';
import './tailwind.css';
import { AuthContextProvider } from './context/AuthContext';

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
    <html lang="en">
      {/* 🔥 IMPORTANT: Apply Tailwind font + brand background + brand text */}
      <body className="font-italiana bg-ip-surface text-ip-text">
        <AuthContextProvider>
          {children}
        </AuthContextProvider>
      </body>
    </html>
  );
}

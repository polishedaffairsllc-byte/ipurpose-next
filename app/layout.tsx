import "./globals.css";
import type { Metadata } from "next";
import { AuthContextProvider } from './context/AuthContext';

export const metadata: Metadata = {
  title: "iPurpose Platform",
  description: "Align your Soul. Empower your Systems. Expand through AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-offWhite">
        <AuthContextProvider>
          {children}
        </AuthContextProvider>
      </body>
    </html>
  );
}

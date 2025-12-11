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
      <body className="min-h-screen bg-[radial-gradient(circle_at_top_left,#2b2d4a_0,#0f1017_42%,#050509_100%)] text-offWhite">
        <AuthContextProvider>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t border-white/5 py-6 text-center">
              <p className="text-xs text-white/40 font-montserrat">
                © {new Date().getFullYear()} iPurpose. Alignment looks good on you.
              </p>
            </footer>
          </div>
        </AuthContextProvider>
      </body>
    </html>
  );
}

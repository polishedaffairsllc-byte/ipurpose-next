import "./globals.css";
import type { Metadata } from "next";
import { AuthContextProvider } from './context/AuthContext';
import BackgroundLayer from "./components/BackgroundLayer";
import InternalNavbar from "./components/InternalNavbar";
import VideoBackground from "./components/VideoBackground";

export const metadata: Metadata = {
  title: "iPurpose — Where Inner Alignment Becomes Coherent Action",
  description: "iPurpose helps creators move from stuck or self-doubting into clarity and coherent action by integrating inner alignment, practical structure, and thoughtful use of AI.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  metadataBase: new URL('https://ipurposesoul.com'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Trigger rebuild to ensure NavBar removal is picked up
  return (
    <html lang="en" className="antialiased">
      <head>
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-XXXXXXXXXX');
        ` }} />
      </head>
      <body className="min-h-screen font-marcellus text-warmCharcoal">
        <div className="fixed inset-0 -z-40">
          <VideoBackground src="/videos/water-reflection.mp4" />
        </div>
        <BackgroundLayer />
        <AuthContextProvider>
          <InternalNavbar />
          {children}
        </AuthContextProvider>
      </body>
    </html>
  );
}

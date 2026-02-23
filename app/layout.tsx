import "./globals.css";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { AuthContextProvider } from './context/AuthContext';
import BackgroundLayer from "./components/BackgroundLayer";
import InternalNavbar from "./components/InternalNavbar";
import VideoBackground from "./components/VideoBackground";
import PixelInitializer from "./components/PixelInitializer";

export const metadata: Metadata = {
  title: "iPurpose — Where Inner Alignment Becomes Coherent Action",
  description: "iPurpose helps creators move from stuck or self-doubting into clarity and coherent action by integrating inner alignment, practical structure, and thoughtful use of AI.",
  metadataBase: new URL('https://ipurposesoul.com'),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
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
      </head>
      <body className="min-h-screen font-marcellus text-warmCharcoal text-3xl">
        {/* Pixel Initialization (Meta Pixel) */}
        <PixelInitializer />
        
        {/* Google Analytics 4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script
          id="ga4-config"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                'anonymize_ip': true,
                'allow_google_signals': false
              });
            `,
          }}
        />
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

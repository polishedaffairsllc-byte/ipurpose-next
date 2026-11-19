import "./globals.css";
import type { Metadata, Viewport } from "next";
import GoogleAds from './components/GoogleAds';
import { CANONICAL_DOMAIN_CONFIG } from '@/lib/canonical';
import SiteChrome from './components/SiteChrome';
import SiteStructuredData from "./components/SiteStructuredData";
import GoogleAnalytics from "./components/GoogleAnalytics";

export const metadata: Metadata = {
  title: "iPurpose — Where Inner Alignment Becomes Coherent Action",
  description: "iPurpose helps creators move from stuck or self-doubting into clarity and coherent action by integrating inner alignment, practical structure, and thoughtful use of AI.",
  metadataBase: new URL(CANONICAL_DOMAIN_CONFIG.domain),
  alternates: { canonical: './' },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <GoogleAds />
      </head>
      <body className="min-h-screen font-marcellus text-warmCharcoal text-3xl">
        <SiteStructuredData />
        <GoogleAnalytics />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
